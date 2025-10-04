import { Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function DatabaseSetupBanner() {
  return (
    <Alert className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <Database className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">Database Not Set Up</AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <p className="mb-3">
          Your Supabase database is connected, but the tables haven't been created yet. Run the SQL scripts to enable
          real data tracking.
        </p>
        <div className="flex gap-3">
          <Link href="/setup">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-600 text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/20 bg-transparent"
            >
              View Setup Guide
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  )
}
