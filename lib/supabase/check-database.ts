"use server"

import { createClient } from "./server"

let databaseReady: boolean | null = null
let lastCheck = 0
const CHECK_INTERVAL = 60000 // Check every 60 seconds

export async function isDatabaseReady(): Promise<boolean> {
  // Return cached result if checked recently
  const now = Date.now()
  if (databaseReady !== null && now - lastCheck < CHECK_INTERVAL) {
    return databaseReady
  }

  try {
    const supabase = createClient()

    // Try a simple query that won't fail if tables don't exist
    // We'll query the pg_tables system catalog to check if our tables exist
    const { data, error } = await supabase.rpc("check_table_exists", { table_name: "repositories" }).single()

    if (error) {
      // If the RPC doesn't exist, tables definitely don't exist
      console.log("[v0] Database not ready: tables not created yet")
      databaseReady = false
      lastCheck = now
      return false
    }

    databaseReady = !!data
    lastCheck = now
    return databaseReady
  } catch (error) {
    console.log("[v0] Database check failed, assuming not ready")
    databaseReady = false
    lastCheck = now
    return false
  }
}

// Reset the cache (useful after running setup scripts)
export function resetDatabaseCheck() {
  databaseReady = null
  lastCheck = 0
}
