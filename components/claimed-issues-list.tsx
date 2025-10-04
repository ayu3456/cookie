"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, GitPullRequest, Clock, CheckCircle2 } from "lucide-react"
import type { ClaimedIssue } from "@/lib/types"
import { markIssueCompleted } from "@/lib/actions/scan-repository"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface ClaimedIssuesListProps {
  issues: (ClaimedIssue & { repository?: { github_owner: string; github_repo: string } })[]
}

export function ClaimedIssuesList({ issues }: ClaimedIssuesListProps) {
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleMarkCompleted = async (issueId: string) => {
    setLoadingId(issueId)
    const result = await markIssueCompleted(issueId)

    if (result.success) {
      toast({
        title: "Issue Marked Complete",
        description: "The issue has been marked as completed.",
      })
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to mark issue as completed",
        variant: "destructive",
      })
    }
    setLoadingId(null)
  }

  const getStatusBadge = (issue: ClaimedIssue) => {
    const now = new Date()
    const autoRelease = issue.auto_release_at ? new Date(issue.auto_release_at) : null
    const isStale = autoRelease && now > autoRelease

    if (issue.status === "completed") {
      return <Badge variant="default">Completed</Badge>
    }
    if (issue.status === "released") {
      return <Badge variant="destructive">Released</Badge>
    }
    if (isStale) {
      return <Badge variant="destructive">Stale</Badge>
    }
    if (issue.has_linked_pr) {
      return <Badge variant="secondary">Has PR</Badge>
    }
    return <Badge variant="outline">Active</Badge>
  }

  const getDaysAgo = (date: string) => {
    const now = new Date()
    const claimed = new Date(date)
    const days = Math.floor((now.getTime() - claimed.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  if (issues.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No claimed issues found. Scan a repository to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <div key={issue.id} className="rounded-lg border p-4">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                {getStatusBadge(issue)}
                {issue.repository && (
                  <span className="text-sm text-muted-foreground">
                    {issue.repository.github_owner}/{issue.repository.github_repo}
                  </span>
                )}
              </div>
              <h3 className="mb-1 font-semibold leading-tight">
                #{issue.issue_number} {issue.issue_title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={issue.claimer_avatar_url || "/placeholder.svg"} alt={issue.claimer_username} />
                    <AvatarFallback>{issue.claimer_username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{issue.claimer_username}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{getDaysAgo(issue.claimed_at)} days ago</span>
                </div>
                {issue.has_linked_pr && (
                  <div className="flex items-center gap-1 text-green-600">
                    <GitPullRequest className="h-3 w-3" />
                    <span>PR Linked</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {issue.status === "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkCompleted(issue.id)}
                  disabled={loadingId === issue.id}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Complete
                </Button>
              )}
              <Button size="sm" variant="ghost" asChild>
                <a href={issue.issue_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
          <div className="rounded bg-muted p-2 text-sm">
            <p className="italic text-muted-foreground">"{issue.claim_comment_text}"</p>
          </div>
        </div>
      ))}
    </div>
  )
}
