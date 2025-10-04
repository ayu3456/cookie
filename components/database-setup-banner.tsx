import { CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DatabaseSetupBanner() {
  return (
    <Alert className="mb-6 border-green-500/50 bg-green-50 dark:bg-green-950/20">
      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
      <AlertTitle className="text-green-900 dark:text-green-100">MongoDB Connected</AlertTitle>
      <AlertDescription className="text-green-800 dark:text-green-200">
        <p>
          Your MongoDB Atlas database is connected and ready to track cookie-licked issues. Start by scanning a repository from the Dashboard.
        </p>
      </AlertDescription>
    </Alert>
  )
}
