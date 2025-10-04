import { type NextRequest, NextResponse } from "next/server"
import { manualReleaseIssue } from "@/lib/actions/nudge-system"

export async function POST(request: NextRequest) {
  try {
    const { issueId, reason } = await request.json()

    if (!issueId) {
      return NextResponse.json({ error: "Issue ID is required" }, { status: 400 })
    }

    const result = await manualReleaseIssue(issueId, reason)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] API release error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
