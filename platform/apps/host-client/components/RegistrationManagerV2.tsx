"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, X, Users, User, Loader2 } from "lucide-react"

interface IndividualApp {
  id: string
  profileScore: number
  eligibility: string
  githubUrl: string
  college: string
  year: number
  user: { name: string | null; email: string }
}

interface TeamApp {
  id: string
  teamName: string
  pendingMembers: {
    name: string
    email: string
    githubUrl: string
    claimedByUserId: string | null
  }[]
}

export default function RegistrationManagerV2({ hackathonId }: { hackathonId: string }) {
  const { token } = useAuth()
  const [individualApps, setIndividualApps] = useState<IndividualApp[]>([])
  const [teamApps, setTeamApps] = useState<TeamApp[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRegistrations = async () => {
    if (!token) return
    try {
      const response = await axios.get(`/api/protected/hackathons/${hackathonId}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setIndividualApps(response.data.individualApps)
      setTeamApps(response.data.teamApps)
    } catch (error) {
      console.error("Failed to fetch registrations", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [token, hackathonId])

  const handleIndividualUpdate = async (regId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await axios.put(
        `/api/protected/individual-registrations/${regId}/update`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setIndividualApps((prev) => prev.filter((app) => app.id !== regId))
    } catch (error) {
      console.error("Failed to update individual registration", error)
    }
  }

  const handleTeamUpdate = async (regId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await axios.put(
        `/api/protected/team-registrations/${regId}/update`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setTeamApps((prev) => prev.filter((app) => app.id !== regId))
    } catch (error) {
      console.error("Failed to update team registration", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6 border-b">
          <div className="flex items-center gap-2">
            <Users size={24} className="text-primary" />
            <div>
              <CardTitle className="text-xl">Team Applications</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{teamApps.length} pending</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {teamApps.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {teamApps.map((app) => (
                <AccordionItem key={app.id} value={app.id} className="border-b last:border-0">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{app.teamName}</p>
                        <p className="text-sm text-muted-foreground">{app.pendingMembers.length} members</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4">
                      {app.pendingMembers.map((member, i) => (
                        <div key={i} className="p-3 bg-muted rounded-lg space-y-2">
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={member.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              GitHub Profile
                            </a>
                            <span className="text-xs text-muted-foreground">
                              {member.claimedByUserId ? "✓ Claimed" : "○ Pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 bg-transparent"
                          onClick={() => handleTeamUpdate(app.id, "APPROVED")}
                        >
                          <Check size={16} /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                          onClick={() => handleTeamUpdate(app.id, "REJECTED")}
                        >
                          <X size={16} /> Reject
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users size={32} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No pending team applications</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6 border-b">
          <div className="flex items-center gap-2">
            <User size={24} className="text-primary" />
            <div>
              <CardTitle className="text-xl">Individual Applications</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{individualApps.length} pending</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {individualApps.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {individualApps.map((app) => (
                <AccordionItem key={app.id} value={app.id} className="border-b last:border-0">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{app.user.name || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground">Score: {app.profileScore}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Email</p>
                          <p className="font-medium">{app.user.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">College</p>
                          <p className="font-medium">{app.college}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Year</p>
                          <p className="font-medium">{app.year}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">AI Eligibility</p>
                          <p className="font-medium">{app.eligibility}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">GitHub</p>
                        <a
                          href={app.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {app.githubUrl}
                        </a>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 bg-transparent"
                          onClick={() => handleIndividualUpdate(app.id, "APPROVED")}
                        >
                          <Check size={16} /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                          onClick={() => handleIndividualUpdate(app.id, "REJECTED")}
                        >
                          <X size={16} /> Reject
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User size={32} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No pending individual applications</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
