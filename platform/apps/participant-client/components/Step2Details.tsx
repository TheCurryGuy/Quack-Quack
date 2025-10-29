"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

export default function Step2Details({
  onFinish,
  initialData,
  scoreData,
  onPrevious, // Added onPrevious prop
}: {
  onFinish: (data: any) => void
  initialData: any
  scoreData: any
  onPrevious?: () => void // Added optional onPrevious prop
}) {
  const [details, setDetails] = useState({
    githubUrl: "",
    portfolioUrl: "",
    college: "",
    year: new Date().getFullYear(),
  })

  const handleSubmit = () => {
    onFinish({ ...initialData, ...details, profileScore: scoreData.score, eligibility: scoreData.eligible_to })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Profile Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Profile Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{scoreData.score}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Eligible For</p>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {scoreData.eligible_to}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">GitHub Profile URL</label>
          <Input
            placeholder="https://github.com/username"
            value={details.githubUrl}
            onChange={(e) => setDetails((prev) => ({ ...prev, githubUrl: e.target.value }))}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Portfolio URL (Optional)</label>
          <Input
            placeholder="https://yourportfolio.com"
            value={details.portfolioUrl}
            onChange={(e) => setDetails((prev) => ({ ...prev, portfolioUrl: e.target.value }))}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">College Name</label>
          <Input
            placeholder="Your College"
            value={details.college}
            onChange={(e) => setDetails((prev) => ({ ...prev, college: e.target.value }))}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Year of Graduation</label>
          <Input
            type="number"
            placeholder="2025"
            value={details.year}
            onChange={(e) => setDetails((prev) => ({ ...prev, year: Number.parseInt(e.target.value) }))}
            className="h-10"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onPrevious && (
          <Button onClick={onPrevious} variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
        )}
        <Button onClick={handleSubmit} className="flex-1">
          Submit Registration
        </Button>
      </div>
    </div>
  )
}
