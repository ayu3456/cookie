import { createClient } from "./server"

export async function setupDatabaseIfNeeded() {
  const supabase = createClient()

  // Check if tables exist by trying to query repositories
  const { error } = await supabase.from("repositories").select("id").limit(1)

  // If table doesn't exist (404 error), create the schema
  if (error && error.message.includes("Could not find the table")) {
    console.log("[v0] Database tables not found, creating schema...")

    try {
      // Create tables
      await supabase.rpc("exec_sql", {
        sql: `
          -- Create repositories table
          CREATE TABLE IF NOT EXISTS repositories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            owner TEXT NOT NULL,
            url TEXT NOT NULL UNIQUE,
            last_scanned_at TIMESTAMPTZ,
            total_issues INTEGER DEFAULT 0,
            claimed_issues INTEGER DEFAULT 0,
            stale_issues INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          -- Create claimed_issues table
          CREATE TABLE IF NOT EXISTS claimed_issues (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
            issue_number INTEGER NOT NULL,
            issue_title TEXT NOT NULL,
            issue_url TEXT NOT NULL,
            claimed_by_username TEXT NOT NULL,
            claimed_by_avatar TEXT,
            claimed_at TIMESTAMPTZ NOT NULL,
            claim_comment TEXT,
            status TEXT NOT NULL CHECK (status IN ('active', 'nudged', 'completed', 'abandoned')),
            has_linked_pr BOOLEAN DEFAULT FALSE,
            linked_pr_url TEXT,
            days_since_claim INTEGER,
            last_nudged_at TIMESTAMPTZ,
            nudge_count INTEGER DEFAULT 0,
            released_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(repository_id, issue_number)
          );

          -- Create activity_log table
          CREATE TABLE IF NOT EXISTS activity_log (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            claimed_issue_id UUID REFERENCES claimed_issues(id) ON DELETE CASCADE,
            action_type TEXT NOT NULL CHECK (action_type IN ('claimed', 'nudged', 'completed', 'abandoned', 'released')),
            details JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );

          -- Create shame_board table
          CREATE TABLE IF NOT EXISTS shame_board (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username TEXT NOT NULL UNIQUE,
            avatar_url TEXT,
            total_claims INTEGER DEFAULT 0,
            completed_claims INTEGER DEFAULT 0,
            abandoned_claims INTEGER DEFAULT 0,
            reliability_score DECIMAL(5,2) DEFAULT 0,
            last_updated TIMESTAMPTZ DEFAULT NOW()
          );

          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_claimed_issues_status ON claimed_issues(status);
          CREATE INDEX IF NOT EXISTS idx_claimed_issues_repository ON claimed_issues(repository_id);
          CREATE INDEX IF NOT EXISTS idx_claimed_issues_username ON claimed_issues(claimed_by_username);
          CREATE INDEX IF NOT EXISTS idx_activity_log_issue ON activity_log(claimed_issue_id);
          CREATE INDEX IF NOT EXISTS idx_shame_board_score ON shame_board(reliability_score DESC);

          -- Enable Row Level Security
          ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
          ALTER TABLE claimed_issues ENABLE ROW LEVEL SECURITY;
          ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
          ALTER TABLE shame_board ENABLE ROW LEVEL SECURITY;

          -- Create policies (allow all for now)
          CREATE POLICY IF NOT EXISTS "Allow all on repositories" ON repositories FOR ALL USING (true);
          CREATE POLICY IF NOT EXISTS "Allow all on claimed_issues" ON claimed_issues FOR ALL USING (true);
          CREATE POLICY IF NOT EXISTS "Allow all on activity_log" ON activity_log FOR ALL USING (true);
          CREATE POLICY IF NOT EXISTS "Allow all on shame_board" ON shame_board FOR ALL USING (true);
        `,
      })

      console.log("[v0] Database schema created successfully")
      return true
    } catch (setupError) {
      console.error("[v0] Failed to create database schema:", setupError)
      return false
    }
  }

  return true
}
