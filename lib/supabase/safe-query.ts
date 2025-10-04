import { createServerClient } from "@/lib/supabase/server"
import { demoRepositories, demoClaimedIssues, demoShameboardEntries } from "@/lib/demo-data"

const DATABASE_ENABLED = true

export async function safeQueryRepositories() {
  if (!DATABASE_ENABLED) {
    console.log("[v0] Using demo mode (database not enabled)")
    return { data: demoRepositories, isDemoMode: true }
  }

  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("repositories").select("*").order("updated_at", { ascending: false })

    if (error) {
      console.log("[v0] Database query failed, using demo mode:", error.message)
      return { data: demoRepositories, isDemoMode: true }
    }

    if (!data || data.length === 0) {
      console.log("[v0] No data in database, using demo mode")
      return { data: demoRepositories, isDemoMode: true }
    }

    console.log("[v0] Using real database data")
    return { data, isDemoMode: false }
  } catch (err) {
    console.log("[v0] Database not available, using demo mode")
    return { data: demoRepositories, isDemoMode: true }
  }
}

export async function safeQueryClaimedIssues(status?: string) {
  if (!DATABASE_ENABLED) {
    console.log("[v0] Using demo mode (database not enabled)")
    const filtered = status ? demoClaimedIssues.filter((issue) => issue.status === status) : demoClaimedIssues
    return { data: filtered, isDemoMode: true }
  }

  try {
    const supabase = await createServerClient()
    let query = supabase.from("claimed_issues").select("*").order("claimed_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.log("[v0] Database query failed, using demo mode:", error.message)
      const filtered = status ? demoClaimedIssues.filter((issue) => issue.status === status) : demoClaimedIssues
      return { data: filtered, isDemoMode: true }
    }

    if (!data || data.length === 0) {
      console.log("[v0] No data in database, using demo mode")
      const filtered = status ? demoClaimedIssues.filter((issue) => issue.status === status) : demoClaimedIssues
      return { data: filtered, isDemoMode: true }
    }

    console.log("[v0] Using real database data")
    return { data, isDemoMode: false }
  } catch (err) {
    console.log("[v0] Database not available, using demo mode")
    const filtered = status ? demoClaimedIssues.filter((issue) => issue.status === status) : demoClaimedIssues
    return { data: filtered, isDemoMode: true }
  }
}

export async function safeQueryShameBoard() {
  if (!DATABASE_ENABLED) {
    console.log("[v0] Using demo mode (database not enabled)")
    return { data: demoShameboardEntries, isDemoMode: true }
  }

  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("shame_board")
      .select("*")
      .order("reliability_score", { ascending: false })

    if (error) {
      console.log("[v0] Database query failed, using demo mode:", error.message)
      return { data: demoShameboardEntries, isDemoMode: true }
    }

    if (!data || data.length === 0) {
      console.log("[v0] No data in database, using demo mode")
      return { data: demoShameboardEntries, isDemoMode: true }
    }

    console.log("[v0] Using real database data")
    return { data, isDemoMode: false }
  } catch (err) {
    console.log("[v0] Database not available, using demo mode")
    return { data: demoShameboardEntries, isDemoMode: true }
  }
}
