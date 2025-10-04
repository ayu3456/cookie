"use server"

import { createClient } from "@/lib/supabase/server"
import { fetchIssues, fetchIssueComments, isClaimComment, checkForLinkedPR, type GitHubComment } from "@/lib/github"
import { revalidatePath } from "next/cache"

export async function scanRepository(owner: string, repo: string) {
  const supabase = await createClient()

  try {
    // Get or create repository record
    let { data: repository, error: repoError } = await supabase
      .from("repositories")
      .select("*")
      .eq("github_owner", owner)
      .eq("github_repo", repo)
      .single()

    if (repoError && repoError.code === "PGRST116") {
      // Repository doesn't exist, create it
      const { data: newRepo, error: insertError } = await supabase
        .from("repositories")
        .insert({ github_owner: owner, github_repo: repo })
        .select()
        .single()

      if (insertError) throw insertError
      repository = newRepo
    } else if (repoError) {
      throw repoError
    }

    // Fetch all open issues
    const issues = await fetchIssues(owner, repo, "open")
    let detectedCount = 0
    let updatedCount = 0

    // Process each issue
    for (const issue of issues) {
      const comments = await fetchIssueComments(owner, repo, issue.number)

      // Find claim comments
      const claimComments = comments.filter((comment: GitHubComment) => isClaimComment(comment.body))

      for (const claimComment of claimComments) {
        // Check if this claim already exists
        const { data: existingClaim } = await supabase
          .from("claimed_issues")
          .select("*")
          .eq("repository_id", repository.id)
          .eq("issue_number", issue.number)
          .eq("claimer_username", claimComment.user.login)
          .single()

        if (!existingClaim) {
          // New claim detected
          const claimedAt = new Date(claimComment.created_at)
          const autoReleaseAt = new Date(claimedAt.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days grace period

          // Check if there's a linked PR
          const hasLinkedPR = await checkForLinkedPR(owner, repo, issue.number, claimComment.user.login)

          const { error: insertError } = await supabase.from("claimed_issues").insert({
            repository_id: repository.id,
            issue_number: issue.number,
            issue_title: issue.title,
            issue_url: issue.html_url,
            claimer_username: claimComment.user.login,
            claimer_avatar_url: claimComment.user.avatar_url,
            claim_comment_id: claimComment.id.toString(),
            claim_comment_text: claimComment.body,
            claimed_at: claimedAt.toISOString(),
            auto_release_at: autoReleaseAt.toISOString(),
            has_linked_pr: hasLinkedPR,
            status: hasLinkedPR ? "active" : "active",
          })

          if (!insertError) {
            detectedCount++

            // Log the detection
            await supabase.from("activity_log").insert({
              action_type: "detected",
              action_data: {
                issue_number: issue.number,
                claimer: claimComment.user.login,
                repository: `${owner}/${repo}`,
              },
            })
          }
        } else {
          // Update existing claim
          const hasLinkedPR = await checkForLinkedPR(owner, repo, issue.number, claimComment.user.login)

          const updates: Record<string, unknown> = {
            last_checked_at: new Date().toISOString(),
            has_linked_pr: hasLinkedPR,
          }

          // If PR was just linked, update status and log it
          if (hasLinkedPR && !existingClaim.has_linked_pr) {
            updates.status = "active"
            await supabase.from("activity_log").insert({
              claimed_issue_id: existingClaim.id,
              action_type: "pr_linked",
              action_data: {
                issue_number: issue.number,
                claimer: claimComment.user.login,
              },
            })
          }

          await supabase.from("claimed_issues").update(updates).eq("id", existingClaim.id)

          updatedCount++
        }
      }
    }

    // Update repository timestamp
    await supabase.from("repositories").update({ updated_at: new Date().toISOString() }).eq("id", repository.id)

    revalidatePath("/")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: `Scan complete: ${detectedCount} new claims detected, ${updatedCount} claims updated`,
      detectedCount,
      updatedCount,
    }
  } catch (error) {
    console.error("[v0] Error scanning repository:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to scan repository",
    }
  }
}

export async function checkStaleIssues() {
  const supabase = await createClient()

  try {
    const now = new Date()

    // Find issues that should be auto-released
    const { data: staleIssues, error } = await supabase
      .from("claimed_issues")
      .select("*, repository:repositories(*)")
      .eq("status", "active")
      .lte("auto_release_at", now.toISOString())

    if (error) throw error

    let releasedCount = 0

    for (const issue of staleIssues || []) {
      // Double-check if there's a linked PR (in case it was just created)
      const hasLinkedPR = await checkForLinkedPR(
        issue.repository.github_owner,
        issue.repository.github_repo,
        issue.issue_number,
        issue.claimer_username,
      )

      if (!hasLinkedPR) {
        // Release the claim
        await supabase.from("claimed_issues").update({ status: "released" }).eq("id", issue.id)

        // Log the release
        await supabase.from("activity_log").insert({
          claimed_issue_id: issue.id,
          action_type: "released",
          action_data: {
            issue_number: issue.issue_number,
            claimer: issue.claimer_username,
            reason: "auto_release_timeout",
          },
        })

        // Update shame board
        await updateShameBoard(issue.claimer_username, "abandoned")

        releasedCount++
      } else {
        // Update to show PR is linked
        await supabase.from("claimed_issues").update({ has_linked_pr: true }).eq("id", issue.id)
      }
    }

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/shame-board")

    return {
      success: true,
      message: `Released ${releasedCount} stale claims`,
      releasedCount,
    }
  } catch (error) {
    console.error("[v0] Error checking stale issues:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to check stale issues",
    }
  }
}

export async function updateShameBoard(username: string, action: "abandoned" | "completed") {
  const supabase = await createClient()

  try {
    // Get or create shame board entry
    const { data: entry, error } = await supabase.from("shame_board").select("*").eq("username", username).single()

    if (error && error.code === "PGRST116") {
      // Create new entry
      const { data: newEntry, error: insertError } = await supabase
        .from("shame_board")
        .insert({
          username,
          total_abandoned: action === "abandoned" ? 1 : 0,
          total_completed: action === "completed" ? 1 : 0,
          reliability_score: action === "abandoned" ? 0 : 100,
        })
        .select()
        .single()

      if (insertError) throw insertError
      return newEntry
    } else if (error) {
      throw error
    }

    // Update existing entry
    const totalAbandoned = entry.total_abandoned + (action === "abandoned" ? 1 : 0)
    const totalCompleted = entry.total_completed + (action === "completed" ? 1 : 0)
    const total = totalAbandoned + totalCompleted
    const reliabilityScore = total > 0 ? (totalCompleted / total) * 100 : 100

    await supabase
      .from("shame_board")
      .update({
        total_abandoned: totalAbandoned,
        total_completed: totalCompleted,
        reliability_score: reliabilityScore,
        last_updated_at: new Date().toISOString(),
      })
      .eq("username", username)

    revalidatePath("/shame-board")
  } catch (error) {
    console.error("[v0] Error updating shame board:", error)
  }
}

export async function markIssueCompleted(issueId: string) {
  const supabase = await createClient()

  try {
    // Get the issue
    const { data: issue, error } = await supabase.from("claimed_issues").select("*").eq("id", issueId).single()

    if (error) throw error

    // Update status
    await supabase.from("claimed_issues").update({ status: "completed" }).eq("id", issueId)

    // Log completion
    await supabase.from("activity_log").insert({
      claimed_issue_id: issueId,
      action_type: "completed",
      action_data: {
        issue_number: issue.issue_number,
        claimer: issue.claimer_username,
      },
    })

    // Update shame board
    await updateShameBoard(issue.claimer_username, "completed")

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/shame-board")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error marking issue completed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to mark issue completed",
    }
  }
}
