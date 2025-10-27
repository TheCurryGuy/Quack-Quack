"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { useAuth } from "@/app/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ArrowLeft, AlertCircle } from "lucide-react"

const downloadCsv = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function ViewSubmissionsPage() {
  const { token } = useAuth()
  const { hackathonId } = useParams()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token && hackathonId) {
      const fetchSubmissions = async () => {
        try {
          const response = await axios.get(`/api/protected/hackathons/${hackathonId}/submissions`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const Papa = (await import("papaparse")).default
          const parsed = Papa.parse(response.data.submissionsCsv, { header: true })
          setSubmissions(parsed.data)
        } catch (error) {
          console.error("Failed to fetch submissions", error)
          setError("Failed to load submissions")
        } finally {
          setIsLoading(false)
        }
      }
      fetchSubmissions()
    }
  }, [token, hackathonId])

  const handleExport = async () => {
    try {
      const response = await axios.get(`/api/protected/hackathons/${hackathonId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      downloadCsv(response.data.submissionsCsv, `submissions-${hackathonId}.csv`)
    } catch (error) {
      console.error("Failed to export submissions", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading submissions...</p>
      </div>
    )
  }

  return (
    <main className="p-6 md:p-8 space-y-8">
      <Button
        variant="ghost"
        onClick={() => router.push(`/dashboard/hackathon/${hackathonId}/edit`)}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Management
      </Button>

      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Project Submissions</h1>
          <p className="text-lg text-muted-foreground">Review and manage all project submissions from teams.</p>
        </div>
        <Button
          onClick={handleExport}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto"
        >
          <Download className="h-4 w-4" />
          Export as CSV
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Review Projects</CardTitle>
          <CardDescription>
            {submissions.length > 0
              ? `Expand each project to see the full details provided by the team.`
              : `No submissions found for this hackathon yet.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {submissions.map((sub: any, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="hover:no-underline hover:text-primary">
                    <div className="flex items-center gap-4 text-left">
                      <span className="font-semibold">{sub.project_title}</span>
                      <Badge variant="outline" className="border-border">
                        {sub.team_name}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">About Project</p>
                      <p className="text-sm text-muted-foreground">{sub.about_project}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Problem Solved</p>
                      <p className="text-sm text-muted-foreground">{sub.problem_statement}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Tech Stack</p>
                      <p className="text-sm text-muted-foreground">{sub.tech_stack}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">AI Score</p>
                      <p className="text-lg font-bold text-primary">{sub.ai_score}/100</p>
                    </div>
                    <a href={sub.github_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="border-border hover:bg-card bg-transparent">
                        View on GitHub →
                      </Button>
                    </a>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No submissions found for this hackathon yet.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
