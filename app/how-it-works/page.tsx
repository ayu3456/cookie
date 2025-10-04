import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Bell, Zap, Shield, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            Documentation
          </Badge>
          <h1 className="mb-4 text-balance text-4xl font-bold">How It Works</h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            A comprehensive guide to understanding the Cookie-Licking Detector system and how data flows through the
            application.
          </p>
        </div>

        {/* System Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">System Overview</CardTitle>
            <CardDescription>Understanding the cookie-licking problem and our solution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">What is Cookie Licking?</h3>
              <p className="text-muted-foreground">
                In open source, "cookie licking" refers to when contributors claim issues by commenting "I'll work on
                this" or "please assign this to me" but never actually deliver. This blocks other contributors from
                working on the issue and slows down project progress.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Our Solution</h3>
              <p className="text-muted-foreground">
                The Cookie-Licking Detector automatically monitors GitHub issues, detects claims, tracks progress, and
                releases stale claims after a grace period. It also maintains a public "shame board" to encourage
                accountability.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Flow */}
        <div className="mb-8">
          <h2 className="mb-6 text-center text-3xl font-bold">Data Flow & Architecture</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <CardTitle>1. Repository Scanning</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold">Data Source: GitHub API</p>
                <p className="text-muted-foreground">
                  The system scans GitHub repositories for open issues and their comments. It uses pattern matching to
                  detect claim phrases like:
                </p>
                <ul className="ml-4 list-disc text-muted-foreground">
                  <li>"I'll work on this"</li>
                  <li>"assign me"</li>
                  <li>"I can take this"</li>
                  <li>"working on it"</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>Stored in:</strong> <code className="text-xs">repositories</code> and{" "}
                  <code className="text-xs">claimed_issues</code> tables
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>2. Progress Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold">Data Source: GitHub API + Database</p>
                <p className="text-muted-foreground">For each claimed issue, the system checks for:</p>
                <ul className="ml-4 list-disc text-muted-foreground">
                  <li>Linked pull requests</li>
                  <li>Recent commits mentioning the issue</li>
                  <li>Time since claim was made</li>
                  <li>Previous nudges sent</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>Stored in:</strong> <code className="text-xs">claimed_issues.has_linked_pr</code>,{" "}
                  <code className="text-xs">nudge_count</code>, <code className="text-xs">last_nudged_at</code>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>3. Nudging System</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold">Data Source: Database</p>
                <p className="text-muted-foreground">
                  Issues claimed for 3+ days without progress are eligible for nudging:
                </p>
                <ul className="ml-4 list-disc text-muted-foreground">
                  <li>Polite reminder comments on GitHub</li>
                  <li>24-hour cooldown between nudges</li>
                  <li>Maximum 3 nudges per issue</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>Stored in:</strong> <code className="text-xs">activity_log</code> table with action_type
                  "nudged"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>4. Auto-Release</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold">Data Source: Database</p>
                <p className="text-muted-foreground">
                  After 7 days without a linked PR, claims are automatically released:
                </p>
                <ul className="ml-4 list-disc text-muted-foreground">
                  <li>Status changed to "released"</li>
                  <li>Comment posted on GitHub</li>
                  <li>Issue becomes available for others</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>Stored in:</strong> <code className="text-xs">claimed_issues.status</code>,{" "}
                  <code className="text-xs">released_at</code>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>5. Shame Board</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold">Data Source: Database Aggregation</p>
                <p className="text-muted-foreground">Public accountability through reliability scores:</p>
                <ul className="ml-4 list-disc text-muted-foreground">
                  <li>Tracks completed vs abandoned issues</li>
                  <li>Calculates reliability percentage</li>
                  <li>Updates in real-time</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>Stored in:</strong> <code className="text-xs">shame_board</code> table
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>6. Activity Logging</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold">Data Source: All System Actions</p>
                <p className="text-muted-foreground">Every action is logged for transparency:</p>
                <ul className="ml-4 list-disc text-muted-foreground">
                  <li>Claims detected</li>
                  <li>Nudges sent</li>
                  <li>Issues completed</li>
                  <li>Claims released</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>Stored in:</strong> <code className="text-xs">activity_log</code> table
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Database Schema */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Database Schema</CardTitle>
            <CardDescription>Understanding where data is stored</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">repositories</h3>
              <p className="text-sm text-muted-foreground">
                Stores tracked GitHub repositories with metadata like stars, open issues count, and last scan time.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">claimed_issues</h3>
              <p className="text-sm text-muted-foreground">
                Core table tracking each claimed issue with status (active, nudged, completed, released), claim details,
                progress indicators, and auto-release timestamps.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">activity_log</h3>
              <p className="text-sm text-muted-foreground">
                Audit trail of all system actions including claims detected, nudges sent, issues completed, and claims
                released.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">shame_board</h3>
              <p className="text-sm text-muted-foreground">
                Aggregated contributor statistics showing total claimed, completed, and abandoned issues with calculated
                reliability scores.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl">Getting Started</CardTitle>
            <CardDescription>Ready to use the Cookie-Licking Detector?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="ml-4 list-decimal space-y-2">
              <li>Visit the Dashboard to scan your first repository</li>
              <li>Monitor claimed issues and their progress</li>
              <li>Use the Notifications page to send nudges</li>
              <li>Check the Shame Board to see contributor reliability scores</li>
            </ol>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/shame-board">View Shame Board</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
