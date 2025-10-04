import { NextResponse } from "next/server"
import { checkStaleIssues } from "@/lib/actions/scan-repository-mongodb"

export async function POST() {
  try {
    const result = await checkStaleIssues()

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] API check-stale error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
