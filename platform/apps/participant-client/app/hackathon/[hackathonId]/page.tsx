"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, Users, ShieldCheck, Loader2 } from "lucide-react"
import IndividualRegistrationWizard from "@/components/IndividualRegistrationWizard"
import TeamRegistrationWizard from "@/components/TeamRegistrationWizard"

interface HackathonData {
  id: string
  name: string
  body: string
  bannerUrl: string
  startDate: string
  registrationDeadline: string
  durationHours: number
  teamSize: number
  isRegistrationOpen: boolean
  status: "UPCOMING" | "LIVE" | "ENDED"
}

export default function HackathonDetailPage() {
  const { hackathonId } = useParams()
  const { data: session } = useSession()

  const [hackathon, setHackathon] = useState<HackathonData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isIndividualWizardOpen, setIsIndividualWizardOpen] = useState(false)
  const [isTeamWizardOpen, setIsTeamWizardOpen] = useState(false)
  const [joinToken, setJoinToken] = useState("")
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([])
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)

  useEffect(() => {
    if (hackathonId) {
      const fetchHackathon = async () => {
        try {
          const response = await axios.get(`/api/hackathons/${hackathonId}`)
          setHackathon(response.data)
        } catch (_err) {
          setError("Failed to load hackathon details. It might not exist.")
        } finally {
          setIsLoading(false)
        }
      }
      fetchHackathon()
    }
  }, [hackathonId])

  // --- HANDLER FUNCTIONS ---
  const handleIndividualRegisterClick = () => {
    if (!session) {
      alert("Please sign in with GitHub to register.")
      return
    }
    setIsIndividualWizardOpen(true)
  }

  const handleTeamRegisterClick = () => {
    if (!session) {
      alert("Please sign in with GitHub to register.")
      return
    }
    setIsTeamWizardOpen(true)
  }

  const handleJoinTeam = async () => {
    if (!session) {
      alert("Please sign in to join a team.")
      return
    }
    if (!joinToken.trim()) {
      alert("Please enter a join token.")
      return
    }
    try {
      await axios.post("/api/teams/join", { token: joinToken })
      alert("Successfully joined team!")
      setJoinToken("")
    } catch (error) {
      alert(`Failed to join team: ${(error as any).response?.data?.message}`)
    }
  }

  const onTeamRegistrationComplete = (tokens: string[]) => {
    setIsTeamWizardOpen(false)
    setGeneratedTokens(tokens)
    setIsTokenModalOpen(true)
  }

  // --- RENDER LOGIC ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-5xl p-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (!hackathon) {
    return null
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8">
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{hackathon.name}</h1>
          </div>
          <article className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{hackathon.body}</ReactMarkdown>
          </article>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem icon={Calendar} label="Starts on" value={new Date(hackathon.startDate).toLocaleDateString()} />
              <InfoItem icon={Clock} label="Duration" value={`${hackathon.durationHours} Hours`} />
              <InfoItem icon={Users} label="Team Size" value={`Up to ${hackathon.teamSize} members`} />
              <InfoItem
                icon={ShieldCheck}
                label="Registration Deadline"
                value={new Date(hackathon.registrationDeadline).toLocaleDateString()}
              />
            </CardContent>
          </Card>

          {/* Registration Card */}
          {hackathon.isRegistrationOpen && hackathon.status !== "ENDED" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Join the Challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg" onClick={handleIndividualRegisterClick}>
                  Register as Individual
                </Button>
                <Button className="w-full" size="lg" variant="secondary" onClick={handleTeamRegisterClick}>
                  Register as Team
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter team join token..."
                    value={joinToken}
                    onChange={(e) => setJoinToken(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleJoinTeam} variant="outline">
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground font-medium">
                  Registration for this event is now closed.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Wizards and Modals */}
      {hackathon && (
        <IndividualRegistrationWizard
          hackathonId={hackathon.id}
          open={isIndividualWizardOpen}
          onOpenChange={setIsIndividualWizardOpen}
        />
      )}
      {hackathon && (
        <TeamRegistrationWizard
          hackathonId={hackathon.id}
          teamSize={hackathon.teamSize}
          open={isTeamWizardOpen}
          onOpenChange={setIsTeamWizardOpen}
          onRegistrationComplete={onTeamRegistrationComplete}
        />
      )}

      <AlertDialog open={isTokenModalOpen} onOpenChange={setIsTokenModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Team Registration Initiated!</AlertDialogTitle>
            <AlertDialogDescription>
              Your spot is confirmed. Share these unique tokens with your teammates for them to join.
              <div className="mt-4 space-y-2 p-3 bg-muted rounded-lg border border-border">
                {generatedTokens.map((token, i) => (
                  <p key={i} className="font-mono text-sm break-all text-foreground">
                    {token}
                  </p>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Button onClick={() => setIsTokenModalOpen(false)} className="w-full">
            Close
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
    <div className="space-y-0.5">
      <p className="font-semibold text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
)
