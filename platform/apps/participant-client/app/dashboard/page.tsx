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
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Welcome Back!</h1>
        <p className="text-lg text-muted-foreground">Track your hackathon journey and discover new opportunities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Registered</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalRegistered}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Events</p>
              <p className="text-3xl font-bold text-foreground">{stats.activeEvents}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
              <p className="text-3xl font-bold text-foreground">{stats.completedEvents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/explore"
          className="bg-primary text-primary-foreground rounded-lg p-6 hover:shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Explore Events</h3>
              <p className="text-sm opacity-90">Discover new hackathons to join</p>
            </div>
            <span className="text-2xl">🔍</span>
          </div>
        </Link>

        <Link
          href="/dashboard/profile"
          className="bg-secondary text-secondary-foreground rounded-lg p-6 hover:shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">View Profile</h3>
              <p className="text-sm opacity-90">Update your information</p>
            </div>
            <span className="text-2xl">👤</span>
          </div>
        </Link>
      </div>

      {/* Recent Hackathons Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Recent Events</h2>
            <p className="text-sm text-muted-foreground mt-1">Your latest registered hackathons</p>
          </div>
          <Link href="/dashboard/my-hackathons" className="text-primary hover:underline font-medium text-sm">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">No hackathons registered yet</p>
            <Link
              href="/dashboard/explore"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:shadow-md transition-shadow"
            >
              Explore Events
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
