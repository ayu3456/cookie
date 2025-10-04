"use client"

import { AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Alert className="max-w-2xl">
        <Database className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">{title}</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>{description}</p>
          {action && (
            <Button onClick={action.onClick} className="mt-4">
              {action.label}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}

export function DatabaseSetupRequired() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Alert className="max-w-2xl border-amber-500/50 bg-amber-500/10">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        <AlertTitle className="text-lg font-semibold text-amber-500">Database Setup Required</AlertTitle>
        <AlertDescription className="mt-2 space-y-4 text-foreground">
          <p>The database tables haven't been created yet. Please run the SQL scripts to set up the database:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>
              Run <code className="bg-muted px-2 py-1 rounded text-sm">scripts/001_create_tables.sql</code> to create
              the database schema
            </li>
            <li>
              Run <code className="bg-muted px-2 py-1 rounded text-sm">scripts/002_seed_data.sql</code> to populate with
              sample data
            </li>
          </ol>
          <p className="text-sm text-muted-foreground">
            You can run these scripts from the Scripts panel in the v0 interface.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  )
}
