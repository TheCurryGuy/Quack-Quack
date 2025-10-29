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
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">My Hackathons</h1>
        <p className="text-lg text-muted-foreground">All the events you&apos;ve registered for, in one place.</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t registered for any hackathons yet. Head over to the &quot;Explore&quot; page to find one!
          </p>
        </div>
      )}
    </div>
  )
}
