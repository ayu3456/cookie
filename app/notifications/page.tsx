import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NudgeableIssuesList } from "@/components/nudgeable-issues-list"
import { AutoNudgeButton } from "@/components/auto-nudge-button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { safeQueryClaimedIssues } from "@/lib/mongodb/safe-query"
import { DatabaseSetupBanner } from "@/components/database-setup-banner"

export default async function NotificationsPage() {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const { data: allIssues, isDemoMode } = await safeQueryClaimedIssues()

  const nudgeableIssues =
    allIssues?.filter(
      (issue) =>
        (issue.status === "active" || issue.status === "nudged") &&
        !issue.has_linked_pr &&
        new Date(issue.claimed_at) <= threeDaysAgo,
    ) || []

  const recentNudges: any[] = []

  return (
    <div className="min-h-screen bg-background">
      {isDemoMode && (
        <div className="border-b bg-amber-500/10 px-4 py-3">
          <div className="container mx-auto">
            <DatabaseSetupBanner />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Notifications & Nudges</h1>
            <p className="text-muted-foreground">Manage nudges and notifications for stale claims.</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {nudgeableIssues?.length || 0} Ready to Nudge
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Nudgeable Issues */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Issues Ready for Nudging</CardTitle>
                <CardDescription>
                  These issues have been claimed for 3+ days without progress and haven't been nudged recently.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NudgeableIssuesList issues={nudgeableIssues || []} />
              </CardContent>
            </Card>
          </div>

          {/* Actions & Recent Activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
                <CardDescription>Send nudges to all eligible issues at once.</CardDescription>
              </CardHeader>
              <CardContent>
                <AutoNudgeButton count={nudgeableIssues?.length || 0} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Nudges</CardTitle>
                <CardDescription>Last 10 nudges sent</CardDescription>
              </CardHeader>
              <CardContent>
                {recentNudges && recentNudges.length > 0 ? (
                  <div className="space-y-2">
                    {recentNudges.map((nudge) => (
                      <div key={nudge.id} className="rounded-lg border p-2 text-sm">
                        <p className="font-medium">
                          Issue #{(nudge.action_data as { issue_number?: number })?.issue_number}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(nudge.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent nudges</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
