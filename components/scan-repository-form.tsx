"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function ScanRepositoryForm() {
  const [owner, setOwner] = useState("")
  const [repo, setRepo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Scan Complete",
          description: data.message,
        })
        setOwner("")
        setRepo("")
      } else {
        toast({
          title: "Scan Failed",
          description: data.error || "Failed to scan repository",
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="owner">Repository Owner</Label>
        <Input
          id="owner"
          placeholder="facebook"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="repo">Repository Name</Label>
        <Input
          id="repo"
          placeholder="react"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scanning...
          </>
        ) : (
          "Scan Repository"
        )}
      </Button>
    </form>
  )
}
