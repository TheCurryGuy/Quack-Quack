"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { HackathonCard, type HackathonCardProps } from "@/components/HackathonCard"
import { Loader2 } from "lucide-react"

type HackathonFromApi = Omit<HackathonCardProps, "description" | "href"> & { body: string }

export default function DashboardExplorePage() {
  const [hackathons, setHackathons] = useState<HackathonFromApi[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await axios.get("/api/hackathons")
        setHackathons(response.data)
      } catch (err) {
        setError("Could not fetch hackathons. Please try again later.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHackathons()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Explore Hackathons</h1>
        <p className="text-lg text-muted-foreground">Find your next challenge and build something extraordinary.</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
          <p className="text-destructive font-medium">{error}</p>
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
              href={`/hackathon/${hackathon.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No active hackathons at the moment. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
