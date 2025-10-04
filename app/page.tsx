import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cookie, Shield, Bell, TrendingUp } from "lucide-react"
import Link from "next/link"
import { safeQueryRepositories, safeQueryClaimedIssues } from "@/lib/supabase/safe-query"
import { DatabaseSetupBanner } from "@/components/database-setup-banner"

export default async function HomePage() {
  const { data: repositories, isDemoMode: reposDemoMode } = await safeQueryRepositories()
  const { data: allClaimedIssues, isDemoMode: issuesDemoMode } = await safeQueryClaimedIssues("active")

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

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-background to-muted/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center">
            <Cookie className="h-16 w-16 text-primary" />
          </div>
          <h1 className="mb-4 text-balance text-5xl font-bold tracking-tight">Cookie Licking Detector</h1>
          <p className="mx-auto mb-8 max-w-2xl text-pretty text-xl text-muted-foreground">
            Stop cookie lickers in their tracks. Track claimed GitHub issues, send automated nudges, and maintain a
            public shame board for accountability.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/shame-board">View Shame Board</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Shield className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Track Claims</CardTitle>
                <CardDescription>
                  Automatically detect when contributors claim issues in your GitHub repositories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Scan repositories for comments containing "claiming" or similar phrases. Keep a real-time database of
                  who claimed what and when.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Send Nudges</CardTitle>
                <CardDescription>Automated reminders for stale claims without progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  After 3 days without a linked PR, send friendly nudges. After 7 days, auto-release the claim and
                  update the shame board.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Public Accountability</CardTitle>
                <CardDescription>Maintain reliability scores for all contributors</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track completion rates and display them on a public shame board. Build reputation through consistent
                  delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <p className="mb-2 text-4xl font-bold text-primary">{repositories?.length || 0}</p>
              <p className="text-muted-foreground">Repositories Tracked</p>
            </div>
            <div className="text-center">
              <p className="mb-2 text-4xl font-bold text-primary">{allClaimedIssues?.length || 0}</p>
              <p className="text-muted-foreground">Active Claims</p>
            </div>
            <div className="text-center">
              <p className="mb-2 text-4xl font-bold text-primary">100%</p>
              <p className="text-muted-foreground">Accountability</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Stop Cookie Lickers?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-pretty text-muted-foreground">
            Set up your first repository in minutes and start tracking claims automatically.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">Start Tracking Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
