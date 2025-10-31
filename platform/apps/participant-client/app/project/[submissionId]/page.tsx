"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Github, Award } from "lucide-react"

export default function PublicProjectPage() {
  const { submissionId } = useParams()
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (submissionId) {
      axios
        .get(`/api/projects/${submissionId}`)
        .then((res) => {
          setProject(res.data)
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    }
  }, [submissionId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <div className="rounded-lg border-2 border-border/60 bg-card/50 backdrop-blur-sm p-8 text-center">
          <p className="text-muted-foreground">Project not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      {/* Header Section */}
      <div className="space-y-4 text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wide">{project.team.hackathon.name}</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{project.title}</h1>
        <p className="text-lg text-muted-foreground">
          by Team <span className="font-semibold text-foreground">"{project.team.name}"</span>
        </p>
      </div>

      {/* Score Card */}
      <Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
        <CardContent className="pt-8">
          <div className="flex items-center justify-center gap-4">
            <Award className="h-8 w-8 text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">AI-Evaluated Score</p>
              <p className="text-5xl md:text-6xl font-bold">
                {project.aiScore}
                <span className="text-2xl text-muted-foreground ml-2">/100</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About This Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{project.about}</p>
          </CardContent>
        </Card>

        {/* Problem */}
        <Card>
          <CardHeader>
            <CardTitle>Problem It Solves</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{project.problem}</p>
          </CardContent>
        </Card>
      </div>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {project.techStacks.map((tech: string) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex justify-center pt-4">
        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2">
            <Github className="h-5 w-5" />
            View on GitHub
          </Button>
        </a>
      </div>
    </div>
  )
}
