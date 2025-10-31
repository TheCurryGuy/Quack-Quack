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
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-lg text-muted-foreground">Manage your hackathon events and access powerful AI tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/my-hackathons" className="group">
          <Card className="border-2 border-primary/30 bg-muted/30 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 transition-all cursor-pointer h-full hover:scale-[1.02]">
            <CardHeader className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg border-2 border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                      <List className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">My Hackathons</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Create, manage, and monitor your hackathon events. Handle participant approvals and event settings.
                  </CardDescription>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/tools" className="group">
          <Card className="border-2 border-accent/30 bg-card/50 backdrop-blur-sm hover:bg-card/70 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/20 transition-all cursor-pointer h-full hover:scale-[1.02]">
            <CardHeader className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 rounded-lg border-2 border-accent/20 group-hover:bg-accent/20 group-hover:border-accent/30 transition-colors">
                      <Wrench className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-2xl">AI Tools</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Use advanced AI models for team formation, registration, and room allocation.
                  </CardDescription>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all mt-1" />
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
