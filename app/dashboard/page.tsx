import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScanRepositoryForm } from "@/components/scan-repository-form"
import { ClaimedIssuesList } from "@/components/claimed-issues-list"
import { CheckStaleButton } from "@/components/check-stale-button"
import { safeQueryRepositories, safeQueryClaimedIssues } from "@/lib/supabase/safe-query"
import { DatabaseSetupBanner } from "@/components/database-setup-banner"

export default async function DashboardPage() {
  const { data: repositories, isDemoMode: reposDemoMode } = await safeQueryRepositories()
  const { data: claimedIssues, isDemoMode: issuesDemoMode } = await safeQueryClaimedIssues()

  const isDemoMode = reposDemoMode || issuesDemoMode

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
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage cookie-licked issues across repositories.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Scan Repository */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Scan Repository</CardTitle>
                <CardDescription>Add a GitHub repository to start tracking claimed issues.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScanRepositoryForm />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
                <CardDescription>Run maintenance tasks to keep data up to date.</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckStaleButton />
              </CardContent>
            </Card>

            {/* Tracked Repositories */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tracked Repositories</CardTitle>
                <CardDescription>{repositories?.length || 0} repositories being monitored</CardDescription>
              </CardHeader>
              <CardContent>
                {repositories && repositories.length > 0 ? (
                  <div className="space-y-2">
                    {repositories.map((repo) => (
                      <div key={repo.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex-1">
                          <p className="font-medium">
                            {repo.github_owner}/{repo.github_repo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last scanned: {new Date(repo.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No repositories tracked yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Claimed Issues List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Claimed Issues</CardTitle>
                <CardDescription>
                  {claimedIssues?.length || 0} issues being tracked across all repositories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClaimedIssuesList issues={claimedIssues || []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
