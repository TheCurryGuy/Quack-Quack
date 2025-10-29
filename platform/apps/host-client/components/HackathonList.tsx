"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/app/context/AuthContext"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Download, ArrowRight, Loader2 } from "lucide-react"

interface Hackathon {
  id: string
  name: string
  startDate: string
  registrationDeadline: string
}

export default function HackathonList() {
  const { token } = useAuth()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHackathons = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await axios.get("/api/protected/hackathons", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setHackathons(response.data)
      } catch (err) {
        console.error("Failed to fetch hackathons:", err)
        setError("Could not load your hackathons. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHackathons()
  }, [token])

  const handleDownloadTeamNames = async (hackathonId: string) => {
    try {
      const response = await axios.get(`/api/protected/hackathons/${hackathonId}/team-names`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `team-names-${hackathonId}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Failed to download team names", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive text-center py-8">{error}</p>
  }

  return (
    <div className="mt-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">My Hackathons</h2>
        <p className="text-muted-foreground mt-2">Manage and monitor your hackathon events</p>
      </div>

      {hackathons.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users size={48} className="text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No hackathons yet</p>
            <p className="text-muted-foreground text-sm">Fill out the form above to create your first hackathon</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => (
            <Card
              key={hackathon.id}
              className="flex flex-col justify-between hover:shadow-lg transition-shadow border-0 shadow-md"
            >
              <div>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl line-clamp-2">{hackathon.name}</CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(hackathon.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Registration closes:</span>
                      <span className="font-medium">
                        {new Date(hackathon.registrationDeadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      Upcoming
                    </Badge>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="flex flex-col gap-2 items-stretch pt-4 border-t">
                <Button variant="default" className="w-full gap-2" asChild>
                  <Link href={`/dashboard/hackathon/${hackathon.id}/edit`}>
                    Manage <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 bg-transparent"
                  onClick={() => handleDownloadTeamNames(hackathon.id)}
                >
                  <Download size={14} /> Team Names
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
