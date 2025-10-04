import { type NextRequest, NextResponse } from "next/server"
import { sendNudge, autoNudgeAll } from "@/lib/actions/nudge-system-mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { issueId, autoNudge } = body

    if (autoNudge) {
      const result = await autoNudgeAll()
      return NextResponse.json(result)
    }

    if (!issueId) {
      return NextResponse.json({ error: "Issue ID is required" }, { status: 400 })
    }

    const result = await sendNudge(issueId)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] API nudge error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
