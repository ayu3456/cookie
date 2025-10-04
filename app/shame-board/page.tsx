import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, TrendingDown, Award, Flame } from "lucide-react"
import { demoShameboardEntries } from "@/lib/demo-data"

export default async function ShameBoardPage() {
  const supabase = await createClient()

  let isDemoMode = false
  let shameEntries = null
  let topPerformers = null
  let worstOffenders = null

  try {
    try {
      const { data: shameData, error: shameError } = await supabase
        .from("shame_board")
        .select("*")
        .order("reliability_score", { ascending: true })

      if (shameData && !shameError) {
        shameEntries = shameData
        isDemoMode = false
      }
    } catch (fetchError) {
      console.log("[v0] Database not available, using demo data")
      isDemoMode = true
      shameEntries = demoShameboardEntries
    }

    if (!isDemoMode) {
      try {
        const { data: topData } = await supabase
          .from("shame_board")
          .select("*")
          .gte("total_completed", 1)
          .order("reliability_score", { ascending: false })
          .limit(5)

        const { data: worstData } = await supabase
          .from("shame_board")
          .select("*")
          .gte("total_abandoned", 2)
          .order("reliability_score", { ascending: true })
          .limit(5)

        if (topData) topPerformers = topData
        if (worstData) worstOffenders = worstData
      } catch (fetchError) {
        console.log("[v0] Could not fetch leaderboard data, using demo data")
        isDemoMode = true
        topPerformers = demoShameboardEntries
          .filter((e) => e.total_completed >= 1)
          .sort((a, b) => b.reliability_score - a.reliability_score)
          .slice(0, 5)

        worstOffenders = demoShameboardEntries
          .filter((e) => e.total_abandoned >= 2)
          .sort((a, b) => a.reliability_score - b.reliability_score)
          .slice(0, 5)
      }
    }
  } catch (error) {
    console.log("[v0] Supabase client error, using demo data")
    isDemoMode = true
    shameEntries = demoShameboardEntries
    topPerformers = demoShameboardEntries
      .filter((e) => e.total_completed >= 1)
      .sort((a, b) => b.reliability_score - a.reliability_score)
      .slice(0, 5)

    worstOffenders = demoShameboardEntries
      .filter((e) => e.total_abandoned >= 2)
      .sort((a, b) => a.reliability_score - b.reliability_score)
      .slice(0, 5)
  }

  const getReliabilityBadge = (score: number) => {
    if (score >= 90) return { variant: "default" as const, label: "Excellent", icon: Trophy }
    if (score >= 70) return { variant: "secondary" as const, label: "Good", icon: Award }
    if (score >= 50) return { variant: "outline" as const, label: "Fair", icon: Flame }
    return { variant: "destructive" as const, label: "Poor", icon: TrendingDown }
  }

  const getReliabilityColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-background">
      {isDemoMode && (
        <div className="border-b bg-amber-500/10 px-4 py-3 text-center text-sm">
          <p className="text-amber-900 dark:text-amber-100">
            <strong>Demo Mode:</strong> Showing sample data. Run the SQL scripts to connect your database.
          </p>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-balance text-4xl font-bold">The Shame Board</h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Public accountability for cookie lickers. Your reputation is on the line.
          </p>
        </div>

        {/* Hall of Fame & Hall of Shame */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Hall of Fame */}
          <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <CardTitle>Hall of Fame</CardTitle>
              </div>
              <CardDescription>Top contributors who deliver on their promises</CardDescription>
            </CardHeader>
            <CardContent>
              {topPerformers && topPerformers.length > 0 ? (
                <div className="space-y-3">
                  {topPerformers.map((entry, index) => (
                    <div key={entry.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://github.com/${entry.username}.png`} alt={entry.username} />
                        <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{entry.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.total_completed} completed, {entry.total_abandoned} abandoned
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{entry.reliability_score.toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">No top performers yet</p>
              )}
            </CardContent>
          </Card>

          {/* Hall of Shame */}
          <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <CardTitle>Hall of Shame</CardTitle>
              </div>
              <CardDescription>Cookie lickers who abandon their claims</CardDescription>
            </CardHeader>
            <CardContent>
              {worstOffenders && worstOffenders.length > 0 ? (
                <div className="space-y-3">
                  {worstOffenders.map((entry, index) => (
                    <div key={entry.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 dark:bg-red-900 dark:text-red-300">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://github.com/${entry.username}.png`} alt={entry.username} />
                        <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{entry.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.total_completed} completed, {entry.total_abandoned} abandoned
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{entry.reliability_score.toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">No offenders yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Full Leaderboard</CardTitle>
            <CardDescription>Complete reliability scores for all tracked contributors</CardDescription>
          </CardHeader>
          <CardContent>
            {shameEntries && shameEntries.length > 0 ? (
              <div className="space-y-4">
                {shameEntries.map((entry) => {
                  const badge = getReliabilityBadge(entry.reliability_score)
                  const BadgeIcon = badge.icon
                  const total = entry.total_completed + entry.total_abandoned

                  return (
                    <div key={entry.id} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://github.com/${entry.username}.png`} alt={entry.username} />
                            <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{entry.username}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant={badge.variant}>
                                <BadgeIcon className="mr-1 h-3 w-3" />
                                {badge.label}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {total} total {total === 1 ? "issue" : "issues"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getReliabilityColor(entry.reliability_score)}`}>
                            {entry.reliability_score.toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Reliability</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <Progress value={entry.reliability_score} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950/20">
                          <p className="font-semibold text-green-700 dark:text-green-400">
                            {entry.total_completed} Completed
                          </p>
                          <p className="text-xs text-muted-foreground">Issues delivered</p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950/20">
                          <p className="font-semibold text-red-700 dark:text-red-400">
                            {entry.total_abandoned} Abandoned
                          </p>
                          <p className="text-xs text-muted-foreground">Issues dropped</p>
                        </div>
                      </div>

                      {entry.last_updated_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Last updated: {new Date(entry.last_updated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No contributors tracked yet. Start scanning repositories!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mt-8 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle>How Reliability Scores Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Reliability Score</strong> = (Completed Issues / Total Issues) × 100
            </p>
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              <li>
                <strong>Excellent (90%+)</strong>: Consistently delivers on claimed issues
              </li>
              <li>
                <strong>Good (70-89%)</strong>: Generally reliable with occasional misses
              </li>
              <li>
                <strong>Fair (50-69%)</strong>: Mixed track record, needs improvement
              </li>
              <li>
                <strong>Poor (&lt;50%)</strong>: Frequently abandons claimed issues
              </li>
            </ul>
            <p className="pt-2 text-muted-foreground">
              Issues are marked as abandoned if they're auto-released after 7 days without a linked PR. Build your
              reputation by completing what you claim!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
