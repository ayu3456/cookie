import { createClient } from "@/lib/supabase/server"

/**
 * Checks if the database tables are set up and ready to use.
 * Returns true if tables exist, false otherwise.
 */
export async function checkDatabaseSetup(): Promise<boolean> {
  try {
    const supabase = await createClient()

    try {
      const { error } = await supabase.from("claimed_issues").select("id").limit(1)

      // If there's an error about the table not existing, return false
      if (error && error.message.includes("Could not find the table")) {
        return false
      }

      // If there's any other error, also return false to be safe
      if (error) {
        return false
      }

      // Tables exist and are accessible
      return true
    } catch (fetchError) {
      // Handle fetch errors (like 404) gracefully
      console.error("[v0] Database fetch failed:", fetchError)
      return false
    }
  } catch (error) {
    console.error("[v0] Database check failed:", error)
    return false
  }
}
