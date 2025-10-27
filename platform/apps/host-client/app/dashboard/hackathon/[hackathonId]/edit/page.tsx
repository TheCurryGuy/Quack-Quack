"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { useAuth } from "@/app/context/AuthContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import EventControls from "@/components/EventControls"
import WinnerAnnouncer from "@/components/WinnerAnnouncer"
import CloseRegistrationControl from "@/components/CloseRegistrationControl"
import RegistrationManagerV2 from "@/components/RegistrationManagerV2"
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"

const formatDateForInput = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  const timezoneOffset = date.getTimezoneOffset() * 60000
  const localDate = new Date(date.getTime() - timezoneOffset)
  return localDate.toISOString().slice(0, 16)
}

type HackathonDataType = {
  id: string
  name: string
  body: string
  teamSize: number
  startDate: string
  durationHours: number
  registrationDeadline: string
  supportEmail: string
  actualStartTime: string | null
  isRegistrationOpen: boolean
  status: "UPCOMING" | "LIVE" | "ENDED"
}

export default function EditHackathonPage() {
  const { token } = useAuth()
  const router = useRouter()
  const { hackathonId } = useParams()

  const [hackathonData, setHackathonData] = useState<HackathonDataType>({
    id: "",
    name: "",
    body: "",
    teamSize: 0,
    startDate: "",
    durationHours: 0,
    registrationDeadline: "",
    supportEmail: "",
    isRegistrationOpen: true,
    actualStartTime: null,
    status: "UPCOMING",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchHackathon = async () => {
      if (!token || !hackathonId) return
      try {
        const response = await axios.get(`/api/protected/hackathons/${hackathonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setHackathonData(response.data)
      } catch (err) {
        setError("Failed to load hackathon data. You may not have access or it may not exist.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchHackathon()
  }, [token, hackathonId])

  const handleRegistrationClosed = () => {
    setHackathonData((prev) => ({ ...prev, isRegistrationOpen: false }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setHackathonData((prev) => ({ ...prev, [name]: type === "number" ? Number.parseInt(value, 10) || 0 : value }))
  }

  const handleHackathonStateChange = (updatedHackathon: Partial<HackathonDataType>) => {
    setHackathonData((prev) => ({ ...prev, ...updatedHackathon }))
  }

  const handleWinnersAnnounced = () => {
    setHackathonData((prev) => ({ ...prev, status: "ENDED" }))
  }

  const isHackathonOver = hackathonData.actualStartTime
    ? new Date() >
      new Date(new Date(hackathonData.actualStartTime).getTime() + hackathonData.durationHours * 60 * 60 * 1000)
    : false

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdating(true)
    setError(null)
    setSuccess(null)
    try {
      await axios.put(`/api/protected/hackathons/${hackathonId}`, hackathonData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess("Hackathon updated successfully!")
    } catch (err) {
      setError("Failed to update hackathon.")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading Hackathon Manager...</p>
      </div>
    )
  }

  if (error && !hackathonData.name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="p-6 md:p-8 space-y-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard")}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Manage Hackathon</CardTitle>
              <CardDescription>Editing: {hackathonData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hackathon Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={hackathonData.name}
                      onChange={handleChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      name="supportEmail"
                      type="email"
                      value={hackathonData.supportEmail}
                      onChange={handleChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Participants per Team</Label>
                    <Input
                      id="teamSize"
                      name="teamSize"
                      type="number"
                      value={hackathonData.teamSize}
                      onChange={handleChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="durationHours">Duration (in hours)</Label>
                    <Input
                      id="durationHours"
                      name="durationHours"
                      type="number"
                      value={hackathonData.durationHours}
                      onChange={handleChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date and Time</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      value={formatDateForInput(hackathonData.startDate)}
                      onChange={handleChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                    <Input
                      id="registrationDeadline"
                      name="registrationDeadline"
                      type="datetime-local"
                      value={formatDateForInput(hackathonData.registrationDeadline)}
                      onChange={handleChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Body/Description (Markdown supported)</Label>
                  <Textarea
                    id="body"
                    name="body"
                    value={hackathonData.body}
                    onChange={handleChange}
                    className="bg-input border-border"
                    required
                    rows={8}
                  />
                </div>
                {success && (
                  <div className="flex items-center gap-2 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-secondary shrink-0" />
                    <p className="text-sm text-secondary">{success}</p>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving Changes..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <EventControls hackathon={hackathonData} onHackathonStart={handleHackathonStateChange} />
        </div>
      </div>

      <div className="border-t border-border"></div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Registration Management</h2>
          <CloseRegistrationControl
            hackathonId={hackathonId as string}
            isRegistrationOpen={hackathonData.isRegistrationOpen}
            onRegistrationClosed={handleRegistrationClosed}
          />
        </div>
        <RegistrationManagerV2 hackathonId={hackathonId as string} />
      </div>

      {(hackathonData.status === "LIVE" && isHackathonOver) || hackathonData.status === "ENDED" ? (
        <WinnerAnnouncer hackathonId={hackathonId as string} onWinnersAnnounced={handleWinnersAnnounced} />
      ) : null}
    </main>
  )
}
