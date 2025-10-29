"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal } from "lucide-react"

export default function WinnersCard({ hackathonId }: { hackathonId: string }) {
  const [winners, setWinners] = useState<{ name: string; rank: number }[]>([])

  useEffect(() => {
    axios.get(`/api/hackathons/${hackathonId}/winners`).then((res) => setWinners(res.data))
  }, [hackathonId])

  if (winners.length === 0) return null

  const getRankDisplay = (rank: number) => {
    if (rank === 1)
      return { label: "1st Place", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950" }
    if (rank === 2)
      return { label: "2nd Place", icon: Medal, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-900" }
    if (rank === 3)
      return { label: "3rd Place", icon: Medal, color: "text-orange-400", bg: "bg-orange-50 dark:bg-orange-950" }
    return { label: `${rank}th Place`, icon: Medal, color: "text-primary", bg: "bg-primary/5" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Hackathon Winners
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {winners.map((winner) => {
          const rankInfo = getRankDisplay(winner.rank)
          const IconComponent = rankInfo.icon

          return (
            <div
              key={winner.rank}
              className={`p-4 rounded-lg border transition-colors hover:border-primary/50 ${rankInfo.bg}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-background border ${rankInfo.color}`}>
                  <IconComponent className={`h-6 w-6 ${rankInfo.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base">{rankInfo.label}</p>
                  <p className="text-sm text-muted-foreground">{winner.name}</p>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
