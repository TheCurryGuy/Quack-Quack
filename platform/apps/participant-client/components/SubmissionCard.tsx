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
      <Card className="bg-card/50 backdrop-blur-sm border-2 border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Project Submission</CardTitle>
              {submission && <CardDescription className="text-base mt-1">Your project has been successfully submitted!</CardDescription>}
            </div>
            {submission && <Zap className="h-7 w-7 text-accent" />}
          </div>
        </CardHeader>

        <CardContent>
          {submission ? (
            <div className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-2 border-border/60 rounded-xl px-5 bg-muted/20">
                  <AccordionTrigger className="font-bold text-xl hover:no-underline py-5 hover:text-primary transition-colors">
                    {submission.title}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-6 pb-5">
                    <div>
                      <h4 className="font-bold text-lg mb-3 text-foreground">About This Project</h4>
                      <p className="text-base text-muted-foreground leading-relaxed">{submission.about}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-3 text-foreground">Problem It Solves</h4>
                      <p className="text-base text-muted-foreground leading-relaxed">{submission.problem}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="p-8 bg-linear-to-br from-primary/10 to-primary/20 rounded-xl border-2 border-primary/40 text-center space-y-3">
                <p className="text-base font-semibold text-muted-foreground">AI Evaluation Score</p>
                <p className="text-6xl font-bold text-primary">
                  {submission.aiScore}
                </p>
                <p className="text-sm text-muted-foreground">out of 100</p>
              </div>

              <Link href={`/project/${submission.id}`} legacyBehavior>
                <a target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full gap-2 bg-transparent border-2 border-border/60 hover:bg-primary/10 hover:border-primary/50 hover:text-primary py-6 text-base font-semibold">
                    <ExternalLink className="h-5 w-5" />
                    Share Your Project
                  </Button>
                </a>
              </Link>
            </div>
          ) : canSubmit ? (
            <div className="space-y-5">
              <p className="text-base text-muted-foreground">Ready to showcase your project? Submit it now!</p>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30 py-6 text-base font-semibold" onClick={() => setIsWizardOpen(true)}>
                Submit Your Project
              </Button>
            </div>
          ) : (
            <div className="p-6 bg-muted/30 border-2 border-border/60 rounded-xl text-center">
              <p className="text-base text-muted-foreground">Submissions will open when the hackathon goes live.</p>
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
