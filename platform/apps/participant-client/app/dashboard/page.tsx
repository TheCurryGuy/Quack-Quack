"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { HackathonCard, type HackathonCardProps } from "@/components/HackathonCard"

type HackathonFromApi = Omit<HackathonCardProps, "description" | "href"> & { body: string }

export default function DashboardPage() {
  const [recentHackathons, setRecentHackathons] = useState<HackathonFromApi[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRegistered: 0,
    activeEvents: 0,
    completedEvents: 0,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("/api/my-hackathons")
        setRecentHackathons(response.data.slice(0, 3))

        const active = response.data.filter(
          (h: HackathonFromApi) => h.status === "LIVE" || h.status === "UPCOMING",
        ).length
        const completed = response.data.filter((h: HackathonFromApi) => h.status === "ENDED").length

        setStats({
          totalRegistered: response.data.length,
          activeEvents: active,
          completedEvents: completed,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-3">Welcome Back!</h1>
        <p className="text-xl text-muted-foreground">Track your hackathon journey and discover new opportunities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 rounded-xl p-7 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-muted-foreground mb-2">Total Registered</p>
              <p className="text-4xl font-bold text-foreground">{stats.totalRegistered}</p>
            </div>
            <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border-2 border-accent/30 rounded-xl p-7 hover:shadow-xl hover:shadow-accent/10 hover:border-accent/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-muted-foreground mb-2">Active Events</p>
              <p className="text-4xl font-bold text-foreground">{stats.activeEvents}</p>
            </div>
            <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center">
              <span className="text-3xl">🚀</span>
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border-2 border-chart-3/30 rounded-xl p-7 hover:shadow-xl hover:shadow-chart-3/10 hover:border-chart-3/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-muted-foreground mb-2">Completed</p>
              <p className="text-4xl font-bold text-foreground">{stats.completedEvents}</p>
            </div>
            <div className="w-14 h-14 bg-chart-3/20 rounded-xl flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/explore"
          className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground rounded-xl p-8 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 border-2 border-primary/40"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Explore Events</h3>
              <p className="text-base opacity-90">Discover new hackathons to join</p>
            </div>
            <span className="text-4xl">🔍</span>
          </div>
        </Link>

        <Link
          href="/dashboard/profile"
          className="bg-linear-to-br from-secondary to-secondary/80 text-secondary-foreground rounded-xl p-8 hover:shadow-2xl hover:shadow-secondary/30 transition-all hover:scale-[1.02] active:scale-95 border-2 border-border/60"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">View Profile</h3>
              <p className="text-base opacity-90">Update your information</p>
            </div>
            <span className="text-4xl">👤</span>
          </div>
        </Link>
      </div>

      {/* Recent Hackathons Section */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground">Recent Events</h2>
            <p className="text-base text-muted-foreground mt-2">Your latest registered hackathons</p>
          </div>
          <Link href="/dashboard/my-hackathons" className="text-primary hover:text-primary/80 font-semibold text-base transition-colors">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : recentHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentHackathons.map((hackathon) => (
              <HackathonCard
                key={hackathon.id}
                id={hackathon.id}
                name={hackathon.name}
                logoUrl={hackathon.logoUrl}
                startDate={hackathon.startDate}
                status={hackathon.status}
                description={hackathon.body}
                href={`/dashboard/hackathon/${hackathon.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card/50 backdrop-blur-sm border-2 border-border/60 rounded-xl p-16 text-center">
            <p className="text-muted-foreground mb-6 text-lg">No hackathons registered yet</p>
            <Link
              href="/dashboard/explore"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all font-semibold text-lg"
            >
              Explore Events
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
