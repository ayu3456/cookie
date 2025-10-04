-- Create tables for tracking claimed issues

-- Repositories table to track which repos we're monitoring
CREATE TABLE IF NOT EXISTS repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_owner TEXT NOT NULL,
  github_repo TEXT NOT NULL,
  github_installation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(github_owner, github_repo)
);

-- Claimed issues table
CREATE TABLE IF NOT EXISTS claimed_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  issue_number INTEGER NOT NULL,
  issue_title TEXT NOT NULL,
  issue_url TEXT NOT NULL,
  claimer_username TEXT NOT NULL,
  claimer_avatar_url TEXT,
  claim_comment_id TEXT NOT NULL,
  claim_comment_text TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active', -- active, nudged, released, completed
  nudge_count INTEGER DEFAULT 0,
  last_nudged_at TIMESTAMPTZ,
  has_linked_pr BOOLEAN DEFAULT FALSE,
  has_commits BOOLEAN DEFAULT FALSE,
  auto_release_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repository_id, issue_number, claimer_username)
);

-- Activity log for tracking all actions
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimed_issue_id UUID REFERENCES claimed_issues(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- detected, nudged, released, pr_linked, completed
  action_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shame board entries (public accountability)
CREATE TABLE IF NOT EXISTS shame_board (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  total_abandoned INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  reliability_score DECIMAL(5,2) DEFAULT 100.00, -- percentage
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(username)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_claimed_issues_status ON claimed_issues(status);
CREATE INDEX IF NOT EXISTS idx_claimed_issues_repository ON claimed_issues(repository_id);
CREATE INDEX IF NOT EXISTS idx_claimed_issues_auto_release ON claimed_issues(auto_release_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_activity_log_claimed_issue ON activity_log(claimed_issue_id);
CREATE INDEX IF NOT EXISTS idx_shame_board_score ON shame_board(reliability_score DESC);

-- Enable Row Level Security
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimed_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE shame_board ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (this is a public tool)
CREATE POLICY "Allow public read on repositories" ON repositories FOR SELECT USING (true);
CREATE POLICY "Allow public read on claimed_issues" ON claimed_issues FOR SELECT USING (true);
CREATE POLICY "Allow public read on activity_log" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public read on shame_board" ON shame_board FOR SELECT USING (true);

-- For now, allow public insert/update (in production, you'd restrict this to authenticated admins)
CREATE POLICY "Allow public insert on repositories" ON repositories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on repositories" ON repositories FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on claimed_issues" ON claimed_issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on claimed_issues" ON claimed_issues FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on activity_log" ON activity_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on shame_board" ON shame_board FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on shame_board" ON shame_board FOR UPDATE USING (true);
