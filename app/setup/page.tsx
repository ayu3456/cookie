import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Database, Github, Play } from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Setup Guide</h1>
        <p className="text-muted-foreground text-lg">Get your Cookie-Licking Detector up and running with real data</p>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                1
              </div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Create Database Tables
                </CardTitle>
                <CardDescription>Run the SQL scripts to set up your database schema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-14">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">How to run scripts:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    Look for the <strong>"Scripts"</strong> panel in the v0 UI (bottom or side panel)
                  </li>
                  <li>
                    Click on <code className="bg-muted px-2 py-1 rounded">scripts/001_create_tables.sql</code>
                  </li>
                  <li>
                    Click the <strong>"Run"</strong> button to execute the script
                  </li>
                  <li>Wait for confirmation that tables were created successfully</li>
                </ol>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-mono">
                  This creates: repositories, claimed_issues, activity_logs, and shame_board tables
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Add Sample Data (Optional)
                </CardTitle>
                <CardDescription>Populate with realistic test data to see the app in action</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-14">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Run the seed script:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    In the Scripts panel, click on{" "}
                    <code className="bg-muted px-2 py-1 rounded">scripts/002_seed_data.sql</code>
                  </li>
                  <li>
                    Click <strong>"Run"</strong> to add sample data
                  </li>
                </ol>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  <strong>Note:</strong> This step is optional. You can skip it and generate real data from GitHub
                  instead.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                3
              </div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Scan GitHub Repositories
                </CardTitle>
                <CardDescription>Generate real data by scanning actual GitHub repositories</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-14">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    Go to the{" "}
                    <Link href="/dashboard" className="text-primary hover:underline">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    Enter a GitHub repository URL (e.g.,{" "}
                    <code className="bg-muted px-2 py-1 rounded">facebook/react</code>)
                  </li>
                  <li>
                    Click <strong>"Scan Repository"</strong>
                  </li>
                  <li>The app will analyze all open issues and detect claimed ones</li>
                </ol>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">The app detects:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Comments like "I'll work on this", "assign me", "I can take this"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Whether there are linked PRs or commits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>How long issues have been claimed without progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Stale claims (7+ days with no activity)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>What Happens After Setup?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Automatic Tracking:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • <strong>Active Claims:</strong> Issues that are claimed but have no PR yet
                  </li>
                  <li>
                    • <strong>Stale Claims:</strong> Claims with no activity for 7+ days
                  </li>
                  <li>
                    • <strong>Completed Claims:</strong> Issues where a PR was submitted
                  </li>
                  <li>
                    • <strong>Abandoned Claims:</strong> Released after being stale too long
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features You Can Use:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • <strong>Nudge System:</strong> Send reminders to contributors who claimed issues
                  </li>
                  <li>
                    • <strong>Auto-Release:</strong> Automatically release stale claims after grace period
                  </li>
                  <li>
                    • <strong>Shame Board:</strong> Public leaderboard showing reliability scores
                  </li>
                  <li>
                    • <strong>Activity Logs:</strong> Track all actions and changes
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/how-it-works">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
