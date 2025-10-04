import { ObjectId } from 'mongodb'

export interface Repository {
  _id?: ObjectId
  github_owner: string
  github_repo: string
  github_installation_id?: string
  created_at: Date
  updated_at: Date
}

export interface ClaimedIssue {
  _id?: ObjectId
  repository_id: ObjectId
  issue_number: number
  issue_title: string
  issue_url: string
  claimer_username: string
  claimer_avatar_url?: string
  claim_comment_id: string
  claim_comment_text: string
  claimed_at: Date
  last_checked_at: Date
  status: 'active' | 'nudged' | 'released' | 'completed'
  nudge_count: number
  last_nudged_at?: Date
  has_linked_pr: boolean
  has_commits: boolean
  auto_release_at?: Date
  created_at: Date
  updated_at: Date
  repository?: Repository
}

export interface ActivityLog {
  _id?: ObjectId
  claimed_issue_id?: ObjectId
  action_type: 'detected' | 'nudged' | 'released' | 'pr_linked' | 'completed'
  action_data?: Record<string, unknown>
  created_at: Date
}

export interface ShameboardEntry {
  _id?: ObjectId
  username: string
  total_abandoned: number
  total_completed: number
  reliability_score: number
  last_updated_at: Date
  created_at: Date
}

// Collection names
export const COLLECTIONS = {
  REPOSITORIES: 'repositories',
  CLAIMED_ISSUES: 'claimed_issues',
  ACTIVITY_LOG: 'activity_log',
  SHAME_BOARD: 'shame_board'
} as const
