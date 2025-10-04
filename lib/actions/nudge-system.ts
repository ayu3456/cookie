"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendNudge(issueId: string) {
  const supabase = await createClient()

  try {
    // Get the issue
    const { data: issue, error } = await supabase
      .from("claimed_issues")
      .select("*, repository:repositories(*)")
      .eq("id", issueId)
      .single()

    if (error) throw error

    // Update nudge count and timestamp
    await supabase
      .from("claimed_issues")
      .update({
        status: "nudged",
        nudge_count: issue.nudge_count + 1,
        last_nudged_at: new Date().toISOString(),
      })
      .eq("id", issueId)

    // Log the nudge
    await supabase.from("activity_log").insert({
      claimed_issue_id: issueId,
      action_type: "nudged",
      action_data: {
        issue_number: issue.issue_number,
        claimer: issue.claimer_username,
        nudge_count: issue.nudge_count + 1,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/notifications")

    return {
      success: true,
      message: `Nudge sent to ${issue.claimer_username}`,
    }
  } catch (error) {
    console.error("[v0] Error sending nudge:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send nudge",
    }
  }
}

export async function getNudgeableIssues() {
  const supabase = await createClient()

  try {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    // Find issues that:
    // 1. Are active or already nudged
    // 2. Were claimed more than 3 days ago
    // 3. Don't have a linked PR
    // 4. Haven't been nudged in the last 24 hours (or never nudged)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: issues, error } = await supabase
      .from("claimed_issues")
      .select("*, repository:repositories(*)")
      .in("status", ["active", "nudged"])
      .lte("claimed_at", threeDaysAgo.toISOString())
      .eq("has_linked_pr", false)
      .or(`last_nudged_at.is.null,last_nudged_at.lte.${oneDayAgo.toISOString()}`)

    if (error) throw error

    return {
      success: true,
      issues: issues || [],
    }
  } catch (error) {
    console.error("[v0] Error getting nudgeable issues:", error)
    return {
      success: false,
      issues: [],
      message: error instanceof Error ? error.message : "Failed to get nudgeable issues",
    }
  }
}

export async function autoNudgeAll() {
  const supabase = await createClient()

  try {
    const result = await getNudgeableIssues()

    if (!result.success || !result.issues) {
      return {
        success: false,
        message: "Failed to get nudgeable issues",
      }
    }

    let nudgedCount = 0

    for (const issue of result.issues) {
      const nudgeResult = await sendNudge(issue.id)
      if (nudgeResult.success) {
        nudgedCount++
      }
    }

    revalidatePath("/dashboard")
    revalidatePath("/notifications")

    return {
      success: true,
      message: `Sent ${nudgedCount} nudges`,
      nudgedCount,
    }
  } catch (error) {
    console.error("[v0] Error auto-nudging:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to auto-nudge",
    }
  }
}

export async function manualReleaseIssue(issueId: string, reason: string) {
  const supabase = await createClient()

  try {
    // Get the issue
    const { data: issue, error } = await supabase.from("claimed_issues").select("*").eq("id", issueId).single()

    if (error) throw error

    // Update status to released
    await supabase.from("claimed_issues").update({ status: "released" }).eq("id", issueId)

    // Log the release
    await supabase.from("activity_log").insert({
      claimed_issue_id: issueId,
      action_type: "released",
      action_data: {
        issue_number: issue.issue_number,
        claimer: issue.claimer_username,
        reason: reason || "manual_release",
      },
    })

    // Update shame board
    const { data: shameEntry } = await supabase
      .from("shame_board")
      .select("*")
      .eq("username", issue.claimer_username)
      .single()

    if (shameEntry) {
      const totalAbandoned = shameEntry.total_abandoned + 1
      const total = totalAbandoned + shameEntry.total_completed
      const reliabilityScore = total > 0 ? (shameEntry.total_completed / total) * 100 : 0

      await supabase
        .from("shame_board")
        .update({
          total_abandoned: totalAbandoned,
          reliability_score: reliabilityScore,
          last_updated_at: new Date().toISOString(),
        })
        .eq("username", issue.claimer_username)
    } else {
      await supabase.from("shame_board").insert({
        username: issue.claimer_username,
        total_abandoned: 1,
        total_completed: 0,
        reliability_score: 0,
      })
    }

    revalidatePath("/dashboard")
    revalidatePath("/shame-board")

    return {
      success: true,
      message: "Issue released successfully",
    }
  } catch (error) {
    console.error("[v0] Error releasing issue:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to release issue",
    }
  }
}
