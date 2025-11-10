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
import WinnersCard from "@/components/WinnersCard"
import HackathonTimer from "@/components/HackathonTimer"

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
  actualStartTime: string | null
}

interface TokenInfo {
  token: string
  memberName: string
  memberEmail: string
}

interface TeamRegistrationResponse {
  message: string
  teamName: string
  leaderName: string
  leaderEmail: string
  joinTokens: TokenInfo[]
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
  const [teamRegResponse, setTeamRegResponse] = useState<TeamRegistrationResponse | null>(null)
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

      // Poll for hackathon status updates every 10 seconds
      // This ensures the page updates when host ends the hackathon
      const pollInterval = setInterval(() => {
        if (hackathonId) {
          fetchHackathon()
        }
      }, 10000) // Poll every 10 seconds

      return () => clearInterval(pollInterval)
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
      const response = await axios.post("/api/teams/join", { token: joinToken })
      const data = response.data
      alert(`Successfully joined team "${data.teamName}" for ${data.hackathonName}!`)
      setJoinToken("")
      // Redirect to the hackathon dashboard page
      window.location.href = `/dashboard/hackathon/${data.hackathonId}`
    } catch (error) {
      alert(`Failed to join team: ${(error as any).response?.data?.message}`)
    }
  }

  const onTeamRegistrationComplete = (response: TeamRegistrationResponse) => {
    setIsTeamWizardOpen(false)
    setTeamRegResponse(response)
    setIsTokenModalOpen(true)
  }

  // --- RENDER LOGIC ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-5xl p-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 backdrop-blur-sm p-8 text-center">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (!hackathon) {
    return null
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8 py-8">
      {/* Banner */}
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden border border-border/50 shadow-xl shadow-primary/5">
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{hackathon.name}</h1>
          </div>
          <article className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{hackathon.body}</ReactMarkdown>
          </article>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Timer Card */}
          <HackathonTimer
            status={hackathon.status}
            startDate={hackathon.startDate}
            actualStartTime={hackathon.actualStartTime}
            durationHours={hackathon.durationHours}
          />

          {/* Info Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 hover:border-primary/50 transition-all">
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
            <Card className="bg-card/50 backdrop-blur-sm border-2 border-accent/30 hover:border-accent/50 transition-all">
              <CardHeader>
                <CardTitle className="text-lg">Join the Challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" size="lg" onClick={handleIndividualRegisterClick}>
                  Register as Individual
                </Button>
                <Button className="w-full" size="lg" variant="secondary" onClick={handleTeamRegisterClick}>
                  Register as Team
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
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
                    className="flex-1 bg-background/50 border-border/50"
                  />
                  <Button onClick={handleJoinTeam} variant="outline" className="border-border/50 hover:bg-primary/10 hover:border-primary/50">
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 backdrop-blur-sm border-2 border-border/60">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground font-medium">
                  Registration for this event is now closed.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Winners Card - Show when hackathon has ended */}
          {hackathon.status === "ENDED" && <WinnersCard hackathonId={hackathon.id} />}
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
        <AlertDialogContent className="bg-card/95 backdrop-blur-sm border-border/50 max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Team Registration Successful! 🎉</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              {teamRegResponse && (
                <>
                  <div className="space-y-2">
                    <p className="text-foreground font-semibold">Team: {teamRegResponse.teamName}</p>
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">✓ Leader (Already Registered)</p>
                      <p className="text-sm text-foreground mt-1">{teamRegResponse.leaderName}</p>
                      <p className="text-xs text-muted-foreground">{teamRegResponse.leaderEmail}</p>
                    </div>
                  </div>
                  
                  {teamRegResponse.joinTokens.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Share these tokens with your team members:</p>
                      <div className="space-y-3">
                        {teamRegResponse.joinTokens.map((tokenInfo, i) => (
                          <div key={i} className="p-4 bg-muted/50 rounded-lg border border-border/50 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground">{tokenInfo.memberName}</p>
                                <p className="text-xs text-muted-foreground">{tokenInfo.memberEmail}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(tokenInfo.token)
                                }}
                                className="shrink-0"
                              >
                                Copy Token
                              </Button>
                            </div>
                            <div className="p-2 bg-background/60 rounded border border-border/30">
                              <p className="font-mono text-xs break-all text-foreground">{tokenInfo.token}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        💡 Each member should use their specific token to claim their spot on the team.
                      </p>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Button onClick={() => setIsTokenModalOpen(false)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
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
