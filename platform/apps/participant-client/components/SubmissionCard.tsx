"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ExternalLink, Zap } from "lucide-react"
import SubmissionWizard from "./SubmissionWizard"

interface Submission {
  id: string
  title: string
  about: string
  problem: string
  aiScore: number
}

export default function SubmissionCard({
  hackathonId,
  hackathonStatus,
  submission,
  onSubmissionSuccess,
}: { hackathonId: string; hackathonStatus: string; submission: Submission | null; onSubmissionSuccess: () => void }) {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const canSubmit = hackathonStatus === "LIVE"

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Project Submission</CardTitle>
              {submission && <CardDescription>Your project has been successfully submitted!</CardDescription>}
            </div>
            {submission && <Zap className="h-6 w-6 text-yellow-500" />}
          </div>
        </CardHeader>

        <CardContent>
          {submission ? (
            <div className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border rounded-lg px-4">
                  <AccordionTrigger className="font-semibold text-lg hover:no-underline py-4">
                    {submission.title}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-5 pb-4">
                    <div>
                      <h4 className="font-bold text-base mb-2">About This Project</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{submission.about}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-2">Problem It Solves</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{submission.problem}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="p-6 bg-linear-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">AI Evaluation Score</p>
                <p className="text-5xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {submission.aiScore}
                </p>
                <p className="text-xs text-muted-foreground">out of 100</p>
              </div>

              <Link href={`/project/${submission.id}`} legacyBehavior>
                <a target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <ExternalLink className="h-4 w-4" />
                    Share Your Project
                  </Button>
                </a>
              </Link>
            </div>
          ) : canSubmit ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Ready to showcase your project? Submit it now!</p>
              <Button className="w-full" onClick={() => setIsWizardOpen(true)}>
                Submit Your Project
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Submissions will open when the hackathon goes live.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!submission && (
        <SubmissionWizard
          hackathonId={hackathonId}
          open={isWizardOpen}
          onOpenChange={setIsWizardOpen}
          onSubmissionSuccess={onSubmissionSuccess}
        />
      )}
    </>
  )
}
