import { type NextRequest, NextResponse } from "next/server"
import { scanRepository } from "@/lib/actions/scan-repository-mongodb"

export async function POST(request: NextRequest) {
  try {
    const { owner, repo } = await request.json()

    if (!owner || !repo) {
      return NextResponse.json({ error: "Owner and repo are required" }, { status: 400 })
    }

    const result = await scanRepository(owner, repo)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] API scan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
