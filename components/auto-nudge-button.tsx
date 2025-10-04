"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, BellRing } from "lucide-react"

interface AutoNudgeButtonProps {
  count: number
}

export function AutoNudgeButton({ count }: AutoNudgeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAutoNudge = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoNudge: true }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Auto-Nudge Complete",
          description: data.message,
        })
      } else {
        toast({
          title: "Auto-Nudge Failed",
          description: data.error || "Failed to send nudges",
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
    <Button onClick={handleAutoNudge} disabled={isLoading || count === 0} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending Nudges...
        </>
      ) : (
        <>
          <BellRing className="mr-2 h-4 w-4" />
          Nudge All ({count})
        </>
      )}
    </Button>
  )
}
