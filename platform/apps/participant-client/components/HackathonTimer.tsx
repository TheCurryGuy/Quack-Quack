"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock } from "lucide-react"

interface HackathonTimerProps {
  status: "UPCOMING" | "LIVE" | "ENDED"
  startDate: string
  actualStartTime: string | null
  durationHours: number
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

export default function HackathonTimer({ status, startDate, actualStartTime, durationHours }: HackathonTimerProps) {
  const [timeLeft, setTimeLeft] = useState("")
  const [title, setTitle] = useState("")

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()

      if (status === "UPCOMING") {
        setTitle("Starts In")
        const startTime = new Date(startDate).getTime()
        const distance = startTime - now
        setTimeLeft(distance > 0 ? formatTime(distance) : "Starting soon...")
      } else if (status === "LIVE" && actualStartTime) {
        setTitle("Ends In")
        const endTime = new Date(actualStartTime).getTime() + durationHours * 60 * 60 * 1000
        const distance = endTime - now
        // Show countdown even if negative - hackathon is LIVE until host ends it
        setTimeLeft(distance > 0 ? formatTime(distance) : "Time's up! Awaiting host to end...")
      } else {
        setTimeLeft("")
        setTitle("")
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [status, startDate, actualStartTime, durationHours])

  // Only show "Event Completed" when status is actually ENDED
  if (status === "ENDED") {
    return (
      <Card className="border-2 border-destructive/40 bg-destructive/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-destructive text-xl font-bold">
            <CheckCircle2 className="h-6 w-6" />
            <span>Event Completed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-destructive/90 font-medium">
            This hackathon has ended. Thank you for participating!
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!title) {
    return null
  }

  return (
    <Card className="border-2 border-primary/40 bg-linear-to-br from-primary/10 to-transparent backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-foreground text-xl font-bold">
          <Clock className="h-6 w-6 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-5xl font-bold font-mono tracking-tight text-primary">{timeLeft}</p>
          <p className="text-sm text-muted-foreground font-medium">
            {status === "UPCOMING" ? "Until the hackathon begins" : "Until the hackathon ends"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
