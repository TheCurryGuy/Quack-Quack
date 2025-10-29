"use client"

import { useAuth } from "@/app/context/AuthContext"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { List, Wrench, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { token, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login")
    }
  }, [token, isLoading, router])

  if (isLoading || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-lg text-muted-foreground">Manage your hackathon events and access powerful AI tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/my-hackathons" className="group">
          <Card className="border-border bg-card hover:bg-card/80 hover:border-primary/50 transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <List className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>My Hackathons</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Create, manage, and monitor your hackathon events. Handle participant approvals and event settings.
                  </CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/tools" className="group">
          <Card className="border-border bg-card hover:bg-card/80 hover:border-secondary/50 transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                      <Wrench className="h-5 w-5 text-secondary" />
                    </div>
                    <CardTitle>AI Tools</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Use advanced AI models for team formation, registration, and room allocation.
                  </CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors mt-1" />
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
