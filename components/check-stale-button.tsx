"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw } from "lucide-react"

export function CheckStaleButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCheck = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/check-stale", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Stale Check Complete",
          description: data.message,
        })
      } else {
        toast({
          title: "Check Failed",
          description: data.error || "Failed to check stale issues",
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
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCheck} disabled={isLoading} className="w-full bg-transparent" variant="outline">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Checking...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Check Stale Issues
        </>
      )}
    </Button>
  )
}
