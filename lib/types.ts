export interface Repository {
  id: string
  github_owner: string
  github_repo: string
  github_installation_id?: string
  created_at: string
  updated_at: string
}

export interface ClaimedIssue {
  id: string
  repository_id: string
  issue_number: number
  issue_title: string
  issue_url: string
  claimer_username: string
  claimer_avatar_url?: string
  claim_comment_id: string
  claim_comment_text: string
  claimed_at: string
  last_checked_at: string
  status: "active" | "nudged" | "released" | "completed"
  nudge_count: number
  last_nudged_at?: string
  has_linked_pr: boolean
  has_commits: boolean
  auto_release_at?: string
  created_at: string
  updated_at: string
  repository?: Repository
}

export interface ActivityLog {
  id: string
  claimed_issue_id?: string
  action_type: "detected" | "nudged" | "released" | "pr_linked" | "completed"
  action_data?: Record<string, unknown>
  created_at: string
}

export interface ShameboardEntry {
  id: string
  username: string
  total_abandoned: number
  total_completed: number
  reliability_score: number
  last_updated_at: string
  created_at: string
}
