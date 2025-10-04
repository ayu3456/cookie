"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, Bell, XCircle } from "lucide-react"
import type { ClaimedIssue } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface NudgeableIssuesListProps {
  issues: (ClaimedIssue & { repository?: { github_owner: string; github_repo: string } })[]
}

export function NudgeableIssuesList({ issues }: NudgeableIssuesListProps) {
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleNudge = async (issueId: string) => {
    setLoadingId(issueId)

    try {
      const response = await fetch("/api/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Nudge Sent",
          description: data.message,
        })
      } else {
        toast({
          title: "Failed to Send Nudge",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoadingId(null)
    }
  }

  const handleRelease = async (issueId: string) => {
    setLoadingId(issueId)

    try {
      const response = await fetch("/api/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, reason: "manual_release_from_nudge_page" }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Issue Released",
          description: data.message,
        })
      } else {
        toast({
          title: "Failed to Release",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoadingId(null)
    }
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
        <p className="text-muted-foreground">No issues ready for nudging at this time.</p>
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
                <Badge variant={issue.nudge_count > 0 ? "secondary" : "outline"}>
                  {issue.nudge_count > 0 ? `Nudged ${issue.nudge_count}x` : "Not Nudged"}
                </Badge>
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
                <span>{getDaysAgo(issue.claimed_at)} days since claim</span>
                {issue.last_nudged_at && <span>Last nudged {getDaysAgo(issue.last_nudged_at)} days ago</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleNudge(issue.id)}
                disabled={loadingId === issue.id}
              >
                <Bell className="mr-1 h-3 w-3" />
                Nudge
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRelease(issue.id)}
                disabled={loadingId === issue.id}
              >
                <XCircle className="mr-1 h-3 w-3" />
                Release
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href={issue.issue_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
