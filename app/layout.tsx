import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Cookie-Licking Detector",
  description: "Stop the cookie licking problem in open source",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {/* Navigation */}
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="text-xl font-bold">
              Cookie-Licking Detector
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/notifications">Notifications</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/leaderboard">Leaderboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/shame-board">Shame Board</Link>
              </Button>
            </div>
          </div>
        </nav>

        {children}
        <Toaster />
      </body>
    </html>
  )
}
