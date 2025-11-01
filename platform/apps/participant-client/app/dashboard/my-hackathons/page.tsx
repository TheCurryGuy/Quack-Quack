"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { HackathonCard, type HackathonCardProps } from "@/components/HackathonCard"
import { Loader2 } from "lucide-react"

type HackathonFromApi = Omit<HackathonCardProps, "description" | "href"> & { body: string }

export default function MyHackathonsPage() {
  const [hackathons, setHackathons] = useState<HackathonFromApi[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMyHackathons = async () => {
      try {
        const response = await axios.get("/api/my-hackathons")
        setHackathons(response.data)
      } catch (error) {
        console.error("Failed to fetch user's hackathons", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMyHackathons()

    // Poll for hackathon status updates every 15 seconds
    // This ensures the status updates when host ends a hackathon
    const pollInterval = setInterval(() => {
      fetchMyHackathons()
    }, 15000) // Poll every 15 seconds

    return () => clearInterval(pollInterval)
  }, [])

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">My Hackathons</h1>
        <p className="text-xl text-muted-foreground">All the events you&apos;ve registered for, in one place.</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : hackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => (
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
        <div className="rounded-xl border-2 border-border/60 bg-card/50 backdrop-blur-sm p-16 text-center">
          <p className="text-muted-foreground text-lg">
            You haven&apos;t registered for any hackathons yet. Head over to the &quot;Explore&quot; page to find one!
          </p>
        </div>
      )}
    </div>
  )
}
