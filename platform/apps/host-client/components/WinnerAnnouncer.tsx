"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/app/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trophy, Github, Loader2 } from "lucide-react"

interface Submission {
  title: string
  team: {
    id: string
    name: string
  }
  githubUrl: string
}

export default function WinnerAnnouncer({
  hackathonId,
  onWinnersAnnounced,
}: { hackathonId: string; onWinnersAnnounced: () => void }) {
  const { token } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selections, setSelections] = useState<{ [teamId: string]: string }>({})

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!token) return
      setIsLoading(true)
      try {
        const response = await axios.get(`/api/protected/hackathons/${hackathonId}/submissions/json`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSubmissions(response.data)
      } catch (error) {
        console.error("Failed to fetch submissions for winner selection", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubmissions()
  }, [token, hackathonId])

  const handleSelectionChange = (teamId: string, rank: string) => {
    setSelections((prev) => {
      const newSelections = { ...prev }
      Object.keys(newSelections).forEach((key) => {
        if (newSelections[key] === rank) {
          delete newSelections[key]
        }
      })
      if (rank !== "none") {
        newSelections[teamId] = rank
      } else {
        delete newSelections[teamId]
      }
      return newSelections
    })
  }

  const handleSubmitWinners = async () => {
    setIsSaving(true)
    const winners = Object.entries(selections).map(([teamId, rank]) => ({
      teamId,
      rank: Number.parseInt(rank),
    }))

    try {
      await axios.post(
        `/api/protected/hackathons/${hackathonId}/winners`,
        { winners },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      onWinnersAnnounced()
    } catch (error) {
      console.error("Failed to announce winners", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="mt-8 border-slate-200 dark:border-slate-800">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-slate-600 dark:text-slate-400">Loading submissions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-8 border-slate-200 dark:border-slate-800">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle>Announce Winners</CardTitle>
            <CardDescription>Review submissions and assign winning ranks</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400">No project submissions found for this hackathon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.team.id}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{sub.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{sub.team.name}</p>
                  <a
                    href={sub.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </a>
                </div>

                <div className="ml-4 shrink-0">
                  <Select
                    onValueChange={(value) => handleSelectionChange(sub.team.id, value)}
                    value={selections[sub.team.id] || "none"}
                  >
                    <SelectTrigger className="w-[140px] border-slate-200 dark:border-slate-800">
                      <SelectValue placeholder="Select Rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Rank</SelectItem>
                      <SelectItem value="1">🥇 1st Place</SelectItem>
                      <SelectItem value="2">🥈 2nd Place</SelectItem>
                      <SelectItem value="3">🥉 3rd Place</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            <Button
              onClick={handleSubmitWinners}
              disabled={isSaving || Object.keys(selections).length === 0}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving Winners...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Save & Announce Winners
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
