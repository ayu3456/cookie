"use server"

import { ObjectId } from 'mongodb'
import { getClaimedIssuesWithRepository, updateClaimedIssue, createActivityLog, getNudgeableIssues } from '@/lib/mongodb/operations'
import { revalidatePath } from "next/cache"

export async function sendNudge(issueId: string) {
  try {
    // Get the issue
    const issues = await getClaimedIssuesWithRepository({ _id: new ObjectId(issueId) })
    const issue = issues[0]

    if (!issue) {
      throw new Error('Issue not found')
    }

    // Update nudge count and timestamp
    await updateClaimedIssue(issue._id!, {
      status: "nudged",
      nudge_count: issue.nudge_count + 1,
      last_nudged_at: new Date(),
    })

    // Log the nudge
    await createActivityLog({
      claimed_issue_id: issue._id!,
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
    console.error("[MongoDB] Error sending nudge:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send nudge",
    }
  }
}

export async function getNudgeableIssues() {
  try {
    const issues = await getNudgeableIssues()

    return {
      success: true,
      issues: issues || [],
    }
  } catch (error) {
    console.error("[MongoDB] Error getting nudgeable issues:", error)
    return {
      success: false,
      issues: [],
      message: error instanceof Error ? error.message : "Failed to get nudgeable issues",
    }
  }
}

export async function autoNudgeAll() {
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
      const nudgeResult = await sendNudge(issue._id!.toString())
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
    console.error("[MongoDB] Error auto-nudging:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to auto-nudge",
    }
  }
}

export async function manualReleaseIssue(issueId: string, reason: string) {
  try {
    const { updateClaimedIssue, createActivityLog, getOrCreateShameBoardEntry } = await import('@/lib/mongodb/operations')

    // Get the issue
    const issues = await getClaimedIssuesWithRepository({ _id: new ObjectId(issueId) })
    const issue = issues[0]

    if (!issue) {
      throw new Error('Issue not found')
    }

    // Update status to released
    await updateClaimedIssue(issue._id!, { status: "released" })

    // Log the release
    await createActivityLog({
      claimed_issue_id: issue._id!,
      action_type: "released",
      action_data: {
        issue_number: issue.issue_number,
        claimer: issue.claimer_username,
        reason: reason || "manual_release",
      },
    })

    // Update shame board
    const shameEntry = await getOrCreateShameBoardEntry(issue.claimer_username)
    
    const totalAbandoned = shameEntry.total_abandoned + 1
    const total = totalAbandoned + shameEntry.total_completed
    const reliabilityScore = total > 0 ? (shameEntry.total_completed / total) * 100 : 0

    const { updateShameBoardEntry } = await import('@/lib/mongodb/operations')
    await updateShameBoardEntry(issue.claimer_username, "abandoned")

    revalidatePath("/dashboard")
    revalidatePath("/shame-board")

    return {
      success: true,
      message: "Issue released successfully",
    }
  } catch (error) {
    console.error("[MongoDB] Error releasing issue:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to release issue",
    }
  }
}
