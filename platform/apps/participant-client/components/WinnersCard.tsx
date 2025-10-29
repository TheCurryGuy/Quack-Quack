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
      return { label: "1st Place", icon: Trophy, color: "text-accent", bg: "bg-accent/10 border-2 border-accent/40" }
    if (rank === 2)
      return { label: "2nd Place", icon: Medal, color: "text-muted-foreground", bg: "bg-muted/20 border-2 border-border/60" }
    if (rank === 3)
      return { label: "3rd Place", icon: Medal, color: "text-chart-2", bg: "bg-chart-2/10 border-2 border-chart-2/40" }
    return { label: `${rank}th Place`, icon: Medal, color: "text-primary", bg: "bg-primary/10 border-2 border-primary/40" }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-2 border-border/60">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <Trophy className="h-7 w-7 text-accent" />
          Hackathon Winners
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {winners.map((winner) => {
          const rankInfo = getRankDisplay(winner.rank)
          const IconComponent = rankInfo.icon

          return (
            <div
              key={winner.rank}
              className={`p-5 rounded-xl transition-all hover:border-primary/50 hover:shadow-lg ${rankInfo.bg}`}
            >
              <div className="flex items-center gap-5">
                <div className={`p-3 rounded-xl bg-background/50 border-2 border-border/60 ${rankInfo.color}`}>
                  <IconComponent className={`h-7 w-7 ${rankInfo.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-foreground">{rankInfo.label}</p>
                  <p className="text-base text-muted-foreground font-medium">{winner.name}</p>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
