"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Play, Download, FileText, CheckCircle2, AlertCircle, StopCircle } from "lucide-react"

const downloadCsv = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

interface Hackathon {
  id: string
  status: "UPCOMING" | "LIVE" | "ENDED"
  actualStartTime: string | null
  durationHours: number
}

export default function EventControls({
  hackathon,
  onHackathonStart,
}: { hackathon: Hackathon; onHackathonStart: (updatedHackathon: Hackathon) => void }) {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleStartHackathon = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post(
        `/api/protected/hackathons/${hackathon.id}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      onHackathonStart(response.data.hackathon)
    } catch (error) {
      console.error("Failed to start hackathon", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndHackathon = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post(
        `/api/protected/hackathons/${hackathon.id}/end`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      onHackathonStart(response.data.hackathon)
    } catch (error) {
      console.error("Failed to end hackathon", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-end hackathon when timer expires
  useEffect(() => {
    if (hackathon.status !== 'LIVE' || !hackathon.actualStartTime) return

    const endTime = new Date(new Date(hackathon.actualStartTime).getTime() + hackathon.durationHours * 60 * 60 * 1000)
    const now = new Date()
    
    if (now >= endTime) {
      // Timer already expired, end immediately
      handleEndHackathon()
      return
    }

    // Set timeout to auto-end when timer expires
    const timeUntilEnd = endTime.getTime() - now.getTime()
    const timeout = setTimeout(() => {
      handleEndHackathon()
    }, timeUntilEnd)

    return () => clearTimeout(timeout)
  }, [hackathon.status, hackathon.actualStartTime, hackathon.durationHours])

  const handleGetSubmissions = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/protected/hackathons/${hackathon.id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      downloadCsv(response.data.submissionsCsv, `submissions-${hackathon.id}.csv`)
    } catch (error) {
      console.error("Failed to get submissions", error)
    } finally {
      setIsLoading(false)
    }
  }

  const endTime = hackathon.actualStartTime
    ? new Date(new Date(hackathon.actualStartTime).getTime() + hackathon.durationHours * 60 * 60 * 1000)
    : null
  const isHackathonOver = endTime ? new Date() > endTime : false

  return (
    <Card className="border-2 border-chart-2/30 bg-card/50 backdrop-blur-sm hover:border-chart-2/50 transition-all">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl">Event Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hackathon.status === "UPCOMING" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
                disabled={isLoading}
              >
                <Play size={18} />
                {isLoading ? "Starting..." : "Start Hackathon Now"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertCircle className="text-yellow-600" size={24} />
                  Ready to go live?
                </AlertDialogTitle>
                <AlertDialogDescription className="pt-2">
                  This will officially start the hackathon for all participants. The timer will begin immediately, and
                  project submissions will be enabled. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Not yet</AlertDialogCancel>
                <AlertDialogAction onClick={handleStartHackathon} className="bg-green-600 hover:bg-green-700">
                  Yes, Go Live
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {hackathon.status === "LIVE" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
              <CheckCircle2 className="text-green-600 mt-0.5 shrink-0 dark:text-green-400" size={20} />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">Hackathon is Live!</p>
                {isHackathonOver ? (
                  <p className="text-sm text-green-700 mt-1 dark:text-green-300">
                    The scheduled duration is over. You can now export submissions and announce winners.
                  </p>
                ) : (
                  <p className="text-sm text-green-700 mt-1 dark:text-green-300">Ends on: {endTime?.toLocaleString()}</p>
                )}
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold gap-2"
                  disabled={isLoading}
                >
                  <StopCircle size={18} />
                  {isLoading ? "Ending..." : "End Hackathon Now"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={24} />
                    End this hackathon?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="pt-2">
                    This will immediately end the hackathon for all participants. Submissions will be locked, and you'll be able to review and announce winners. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndHackathon} className="bg-red-600 hover:bg-red-700">
                    Yes, End Now
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {((hackathon.status === "LIVE" && isHackathonOver) || hackathon.status === "ENDED") && (
          <Button
            variant="outline"
            onClick={handleGetSubmissions}
            disabled={isLoading}
            className="w-full h-10 gap-2 bg-transparent"
          >
            <Download size={18} />
            {isLoading ? "Exporting..." : "Export Submissions CSV"}
          </Button>
        )}

        {hackathon.status === "LIVE" && (
          <Link href={`/dashboard/hackathon/${hackathon.id}/submissions`} className="block">
            <Button variant="secondary" className="w-full h-10 gap-2">
              <FileText size={18} />
              View & Export Submissions
            </Button>
          </Link>
        )}

        {hackathon.status === "ENDED" && (
          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <CheckCircle2 className="text-muted-foreground" size={20} />
            <p className="font-semibold text-muted-foreground">This hackathon has ended.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
