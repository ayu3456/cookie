"use server"

import { ObjectId } from 'mongodb'
import { getOrCreateRepository, createClaimedIssue, findClaimedIssue, updateClaimedIssue, createActivityLog, updateShameBoardEntry } from '@/lib/mongodb/operations'
import { fetchIssues, fetchIssueComments, isClaimComment, checkForLinkedPR, type GitHubComment } from "@/lib/github"
import { revalidatePath } from "next/cache"

export async function scanRepository(owner: string, repo: string) {
  try {
    // Get or create repository record
    const repository = await getOrCreateRepository(owner, repo)

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
        const existingClaim = await findClaimedIssue(repository._id!, issue.number, claimComment.user.login)

        if (!existingClaim) {
          // New claim detected
          const claimedAt = new Date(claimComment.created_at)
          const autoReleaseAt = new Date(claimedAt.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days grace period

          // Check if there's a linked PR
          const hasLinkedPR = await checkForLinkedPR(owner, repo, issue.number, claimComment.user.login)

          await createClaimedIssue({
            repository_id: repository._id!,
            issue_number: issue.number,
            issue_title: issue.title,
            issue_url: issue.html_url,
            claimer_username: claimComment.user.login,
            claimer_avatar_url: claimComment.user.avatar_url,
            claim_comment_id: claimComment.id.toString(),
            claim_comment_text: claimComment.body,
            claimed_at: claimedAt,
            auto_release_at: autoReleaseAt,
            has_linked_pr: hasLinkedPR,
            status: hasLinkedPR ? "active" : "active",
            last_checked_at: new Date(),
            nudge_count: 0,
            has_commits: false
          })

          detectedCount++

          // Log the detection
          await createActivityLog({
            action_type: "detected",
            action_data: {
              issue_number: issue.number,
              claimer: claimComment.user.login,
              repository: `${owner}/${repo}`,
            },
          })
        } else {
          // Update existing claim
          const hasLinkedPR = await checkForLinkedPR(owner, repo, issue.number, claimComment.user.login)

          const updates: any = {
            last_checked_at: new Date(),
            has_linked_pr: hasLinkedPR,
          }

          // If PR was just linked, update status and log it
          if (hasLinkedPR && !existingClaim.has_linked_pr) {
            updates.status = "active"
            await createActivityLog({
              claimed_issue_id: existingClaim._id!,
              action_type: "pr_linked",
              action_data: {
                issue_number: issue.number,
                claimer: claimComment.user.login,
              },
            })
          }

          await updateClaimedIssue(existingClaim._id!, updates)
          updatedCount++
        }
      }
    }

    // Update repository timestamp
    await getOrCreateRepository(owner, repo) // This will update the timestamp

    revalidatePath("/")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: `Scan complete: ${detectedCount} new claims detected, ${updatedCount} claims updated`,
      detectedCount,
      updatedCount,
    }
  } catch (error) {
    console.error("[MongoDB] Error scanning repository:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to scan repository",
    }
  }
}

export async function checkStaleIssues() {
  try {
    const { getStaleIssues, updateClaimedIssue, createActivityLog, updateShameBoardEntry } = await import('@/lib/mongodb/operations')
    const { checkForLinkedPR } = await import('@/lib/github')

    const now = new Date()
    const staleIssues = await getStaleIssues()

    let releasedCount = 0

    for (const issue of staleIssues) {
      // Double-check if there's a linked PR (in case it was just created)
      const hasLinkedPR = await checkForLinkedPR(
        issue.repository!.github_owner,
        issue.repository!.github_repo,
        issue.issue_number,
        issue.claimer_username,
      )

      if (!hasLinkedPR) {
        // Release the claim
        await updateClaimedIssue(issue._id!, { status: "released" })

        // Log the release
        await createActivityLog({
          claimed_issue_id: issue._id!,
          action_type: "released",
          action_data: {
            issue_number: issue.issue_number,
            claimer: issue.claimer_username,
            reason: "auto_release_timeout",
          },
        })

        // Update shame board
        await updateShameBoardEntry(issue.claimer_username, "abandoned")

        releasedCount++
      } else {
        // Update to show PR is linked
        await updateClaimedIssue(issue._id!, { has_linked_pr: true })
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
    console.error("[MongoDB] Error checking stale issues:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to check stale issues",
    }
  }
}

export async function updateShameBoard(username: string, action: "abandoned" | "completed") {
  try {
    const { updateShameBoardEntry } = await import('@/lib/mongodb/operations')
    await updateShameBoardEntry(username, action)
    revalidatePath("/shame-board")
  } catch (error) {
    console.error("[MongoDB] Error updating shame board:", error)
  }
}

export async function markIssueCompleted(issueId: string) {
  try {
    const { updateClaimedIssue, createActivityLog, updateShameBoardEntry } = await import('@/lib/mongodb/operations')
    const { getClaimedIssuesWithRepository } = await import('@/lib/mongodb/operations')

    // Get the issue
    const issues = await getClaimedIssuesWithRepository({ _id: new ObjectId(issueId) })
    const issue = issues[0]

    if (!issue) {
      throw new Error('Issue not found')
    }

    // Update status
    await updateClaimedIssue(issue._id!, { status: "completed" })

    // Log completion
    await createActivityLog({
      claimed_issue_id: issue._id!,
      action_type: "completed",
      action_data: {
        issue_number: issue.issue_number,
        claimer: issue.claimer_username,
      },
    })

    // Update shame board
    await updateShameBoardEntry(issue.claimer_username, "completed")

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/shame-board")

    return { success: true }
  } catch (error) {
    console.error("[MongoDB] Error marking issue completed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to mark issue completed",
    }
  }
}
