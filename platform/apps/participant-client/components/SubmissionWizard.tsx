"use client"

import { useState } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandList, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { ChevronsUpDown, X, Zap } from "lucide-react"

const ALL_TECHS = [
  "React",
  "Next.js",
  "Javascript/Typescript",
  "Express.js",
  "Python",
  "Flask/FastAPI",
  "PostgreSQL/MongoDB",
  "AWS",
  "GCP",
  "Azure",
  "Tensorflow/Pytorch",
  "OpenCV",
  "Prisma",
  "TailwindCss",
  "Recoil",
  "Redux",
  "TanStack Query",
  "Zustand",
  "Socket.io",
  "Hono.js",
]

interface Step1Data {
  projectName: string
  techStacks: string[]
}
interface ScoreData {
  score: number
}

export default function SubmissionWizard({
  hackathonId,
  open,
  onOpenChange,
  onSubmissionSuccess,
}: { hackathonId: string; open: boolean; onOpenChange: (open: boolean) => void; onSubmissionSuccess: () => void }) {
  const [step, setStep] = useState(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [projectName, setProjectName] = useState("")
  const [techs, setTechs] = useState<string[]>([])
  const [popoverOpen, setPopoverOpen] = useState(false)

  const handleNextStep = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const tech_stack_used = techs.join(" ")
      const response = await axios.post("/api/project-score", { name: projectName, tech_stack_used })
      setStep1Data({ projectName, techStacks: techs })
      setScoreData(response.data)
      setStep(2)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get project score.")
    } finally {
      setIsLoading(false)
    }
  }

  const [details, setDetails] = useState({ about: "", problem: "", githubUrl: "" })

  const handleFinalSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await axios.post(`/api/hackathons/${hackathonId}/submit`, {
        title: step1Data?.projectName,
        techStacks: step1Data?.techStacks,
        aiScore: scoreData?.score,
        about: details.about,
        problem: details.problem,
        githubUrl: details.githubUrl,
      })
      onSubmissionSuccess()
      resetAndClose()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit project.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetAndClose = () => {
    setStep(1)
    setProjectName("")
    setTechs([])
    setDetails({ about: "", problem: "", githubUrl: "" })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Submit Your Project</DialogTitle>
          <DialogDescription className="text-base">
            {step === 1 ? "Step 1 of 2: Project Identity" : "Step 2 of 2: Project Details"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        </div>

        <div className="space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-3">
                <label className="text-sm font-semibold">Project Name</label>
                <Input
                  placeholder="Enter your project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">Technologies Used</label>
                <div className="border rounded-lg p-3 min-h-12 flex flex-wrap gap-2 items-start content-start bg-card">
                  {techs.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      {t}
                      <X
                        className="h-3 w-3 cursor-pointer hover:opacity-70"
                        onClick={() => setTechs(techs.filter((s) => s !== t))}
                      />
                    </Badge>
                  ))}
                </div>

                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-10 bg-transparent">
                      Select technologies...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[550px] p-0">
                    <Command>
                      <CommandInput placeholder="Search technologies..." />
                      <CommandList>
                        <CommandEmpty>No technology found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto">
                          {ALL_TECHS.filter((t) => !techs.includes(t)).map((t) => (
                            <CommandItem
                              key={t}
                              value={t}
                              onSelect={() => {
                                setTechs([...techs, t])
                                setPopoverOpen(false)
                              }}
                            >
                              {t}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={handleNextStep}
                disabled={isLoading || !projectName || techs.length === 0}
                className="w-full h-10"
              >
                {isLoading ? "Evaluating..." : "Next"}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="p-5 bg-linear-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm font-medium text-muted-foreground">AI-Evaluated Score</p>
                </div>
                <p className="text-4xl font-bold">{scoreData?.score}/100</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">About Your Project</label>
                <Textarea
                  placeholder="Describe what your project does and its key features..."
                  value={details.about}
                  onChange={(e) => setDetails((p) => ({ ...p, about: e.target.value }))}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">Problem It Solves</label>
                <Textarea
                  placeholder="What problem does your project address?"
                  value={details.problem}
                  onChange={(e) => setDetails((p) => ({ ...p, problem: e.target.value }))}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">GitHub Repository URL</label>
                <Input
                  placeholder="https://github.com/username/project"
                  value={details.githubUrl}
                  onChange={(e) => setDetails((p) => ({ ...p, githubUrl: e.target.value }))}
                  className="h-10"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleFinalSubmit} disabled={isLoading} className="flex-1">
                  {isLoading ? "Submitting..." : "Submit Project"}
                </Button>
              </div>
            </>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
