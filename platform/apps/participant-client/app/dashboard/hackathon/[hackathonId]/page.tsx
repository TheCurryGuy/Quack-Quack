"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import StatusCard from "@/components/StatusCard"
import MyTeamCard from "@/components/MyTeamCard"
import { Button } from "@/components/ui/button"
import SubmissionCard from "@/components/SubmissionCard"
import WinnersCard from "@/components/WinnersCard"
import HackathonTimer from "@/components/HackathonTimer"
import { Loader2, ExternalLink } from "lucide-react"

interface StatusData {
  registrationStatus: "PENDING" | "APPROVED" | "REJECTED" | null
  teamDetails: {
    id: string
    name: string
    bio: string | null
    skills: string | null
    members: { name: string | null; image: string | null }[]
  } | null
  submissionDetails: { id: string; title: string; aiScore: number; about: string; problem: string } | null
}

interface HackathonData {
  id: string
  name: string
  body: string
  bannerUrl: string
  startDate: string
  durationHours: number
  teamSize: number
  status: "UPCOMING" | "LIVE" | "ENDED"
  actualStartTime: string | null
}

export default function ParticipantHackathonPage() {
  const { hackathonId } = useParams()
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [hackathon, setHackathon] = useState<HackathonData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMyStatus = useCallback(async () => {
    try {
      const response = await axios.get(`/api/hackathons/${hackathonId}/my-status`)
      setStatusData(response.data)
    } catch {
      console.log("User may not be registered yet.")
    }
  }, [hackathonId])

  useEffect(() => {
    if (hackathonId) {
      const fetchHackathon = async () => {
        try {
          const response = await axios.get(`/api/hackathons/${hackathonId}`)
          setHackathon(response.data)
        } catch (_error) {
          console.error("Failed to load hackathon details", _error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchHackathon()
      fetchMyStatus()
    }
  }, [hackathonId, fetchMyStatus])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Could not load hackathon details.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden border border-border shadow-lg">
        <Image
          src={hackathon.bannerUrl || "/placeholder.svg"}
          alt={`${hackathon.name} banner`}
          layout="fill"
          objectFit="cover"
          className="object-center"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - User Specific */}
        <div className="lg:col-span-1 space-y-6">
          <HackathonTimer
            status={hackathon.status}
            startDate={hackathon.startDate}
            actualStartTime={hackathon.actualStartTime}
            durationHours={hackathon.durationHours}
          />

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Your Dashboard</h2>
          </div>

          <StatusCard status={statusData?.registrationStatus || null} />

          {statusData?.teamDetails && <MyTeamCard team={statusData.teamDetails} onTeamUpdate={fetchMyStatus} />}

          {hackathon.status === "LIVE" && statusData?.registrationStatus === "APPROVED" && (
            <SubmissionCard
              hackathonId={hackathon.id}
              hackathonStatus={hackathon.status}
              submission={statusData?.submissionDetails}
              onSubmissionSuccess={fetchMyStatus}
            />
          )}

          {hackathon?.status === "ENDED" && <WinnersCard hackathonId={hackathon.id} />}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{hackathon.name}</h1>
            </div>
            <Link href={`/hackathon/${hackathon.id}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <ExternalLink className="h-4 w-4" />
                Public Page
              </Button>
            </Link>
          </div>

          <article className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{hackathon.body}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  )
}
