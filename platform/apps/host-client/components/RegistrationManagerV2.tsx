"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Check, X, Users, User, Loader2, Info, AlertCircle, CheckCircle2 } from "lucide-react"

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

interface TeamVerification {
  teamRegistration: {
    id: string
    teamName: string
    status: string
    hackathonName: string
  }
  memberStats: {
    total: number
    claimed: number
    unclaimed: number
  }
  claimedMemberDetails: Array<{
    name: string
    email: string
    userId: string | null
    userName: string | null
    userEmail: string | null
  }>
  unclaimedMemberDetails: Array<{
    name: string
    email: string
    joinToken: string
  }>
  isFullyClaimed: boolean
  isFinalized: boolean
}

export default function RegistrationManagerV2({ hackathonId }: { hackathonId: string }) {
  const { token } = useAuth()
  const [individualApps, setIndividualApps] = useState<IndividualApp[]>([])
  const [teamApps, setTeamApps] = useState<TeamApp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [verificationData, setVerificationData] = useState<TeamVerification | null>(null)
  const [isVerificationOpen, setIsVerificationOpen] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

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
      setIsVerificationOpen(false) // Close dialog after approval
    } catch (error) {
      console.error("Failed to update team registration", error)
    }
  }

  const handleVerifyTeam = async (regId: string) => {
    setIsVerifying(true)
    try {
      const response = await axios.get(
        `/api/protected/team-registrations/${regId}/verify`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setVerificationData(response.data)
      setIsVerificationOpen(true)
    } catch (error) {
      console.error("Failed to verify team", error)
      alert("Failed to load team details")
    } finally {
      setIsVerifying(false)
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
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-2 border-primary/30 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
        <CardHeader className="pb-6 border-b border-border/40">
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
                          className="flex-1 gap-1 bg-transparent"
                          onClick={() => handleVerifyTeam(app.id)}
                          disabled={isVerifying}
                        >
                          <Info size={16} /> Details
                        </Button>
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

      <Card className="border-2 border-accent/30 bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-all">
        <CardHeader className="pb-6 border-b border-border/40">
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

    <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Team Verification Details</DialogTitle>
          <DialogDescription>
            Review team registration status and member claims before approval
          </DialogDescription>
        </DialogHeader>
        
        {verificationData && (
          <div className="space-y-6">
            {/* Team Info */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h3 className="font-bold text-lg">{verificationData.teamRegistration.teamName}</h3>
              <p className="text-sm text-muted-foreground">
                Hackathon: {verificationData.teamRegistration.hackathonName}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  verificationData.teamRegistration.status === 'PENDING' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {verificationData.teamRegistration.status}
                </span>
              </div>
            </div>

            {/* Member Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-card border-2 border-border rounded-lg text-center">
                <p className="text-2xl font-bold">{verificationData.memberStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Spots</p>
              </div>
              <div className="p-4 bg-card border-2 border-green-500/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{verificationData.memberStats.claimed}</p>
                <p className="text-sm text-muted-foreground">Claimed</p>
              </div>
              <div className="p-4 bg-card border-2 border-orange-500/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">{verificationData.memberStats.unclaimed}</p>
                <p className="text-sm text-muted-foreground">Unclaimed</p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {verificationData.isFullyClaimed ? (
                  <CheckCircle2 className="text-green-600" size={20} />
                ) : (
                  <AlertCircle className="text-orange-600" size={20} />
                )}
                <span className="text-sm font-medium">
                  {verificationData.isFullyClaimed 
                    ? "All members have claimed their spots" 
                    : "Some members haven't claimed their spots yet"}
                </span>
              </div>
              {verificationData.isFinalized && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-600" size={20} />
                  <span className="text-sm font-medium">Team is finalized in database</span>
                </div>
              )}
            </div>

            {/* Claimed Members */}
            {verificationData.claimedMemberDetails.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="text-green-600" size={18} />
                  Claimed Members ({verificationData.claimedMemberDetails.length})
                </h4>
                <div className="space-y-2">
                  {verificationData.claimedMemberDetails.map((member, i) => (
                    <div key={i} className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                          {member.userName && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Linked to: {member.userName} ({member.userEmail})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unclaimed Members */}
            {verificationData.unclaimedMemberDetails.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="text-orange-600" size={18} />
                  Unclaimed Members ({verificationData.unclaimedMemberDetails.length})
                </h4>
                <div className="space-y-2">
                  {verificationData.unclaimedMemberDetails.map((member, i) => (
                    <div key={i} className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-orange-600 mt-1">⚠ Has not claimed their spot yet</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {verificationData.teamRegistration.status === 'PENDING' && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleTeamUpdate(verificationData.teamRegistration.id, "APPROVED")}
                >
                  <Check className="mr-2" size={16} />
                  Approve Team
                  {!verificationData.isFullyClaimed && " (with claimed members)"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleTeamUpdate(verificationData.teamRegistration.id, "REJECTED")}
                >
                  <X className="mr-2" size={16} />
                  Reject Team
                </Button>
              </div>
            )}

            {!verificationData.isFullyClaimed && (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> You can approve this team now, and only the members who have claimed their spots will be added to the finalized team.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}

