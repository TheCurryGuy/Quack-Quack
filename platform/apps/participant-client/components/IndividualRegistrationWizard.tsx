"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Step1Skills from "./Step1Skills"
import Step2Details from "./Step2Details"
import axios from "axios"

interface FormData {
  name: string
  skills: string[]
  githubUrl: string
  portfolioUrl: string
  college: string
  year: number
}

interface ScoreData {
  score: number
  eligible_to: string
}

export default function IndividualRegistrationWizard({
  hackathonId,
  open,
  onOpenChange,
}: {
  hackathonId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)

  const handleFinish = async (finalData: FormData) => {
    try {
      await axios.post(`/api/hackathons/${hackathonId}/register-individual`, finalData)
      alert("Registration successful!")
      handleReset()
    } catch (error) {
      console.error(error)
      alert("Registration failed.")
    }
  }

  const handleNextStep = (data: Partial<FormData>, scoreInfo?: ScoreData) => {
    setFormData((prev) => ({ ...prev, ...data }))
    if (scoreInfo) {
      setScoreData(scoreInfo)
    }
    setStep(step + 1)
  }

  const handlePreviousStep = () => {
    setStep(step - 1)
  }

  const handleReset = () => {
    setStep(1)
    setFormData({})
    setScoreData(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {step}
            </div>
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Step {step} of 2</span>
          </div>
          <div>
            <DialogTitle className="text-xl">
              {step === 1 ? "Tell us about your skills" : "Complete your profile"}
            </DialogTitle>
            <DialogDescription className="text-sm mt-1">
              {step === 1
                ? "Share your technical expertise and interests"
                : "Provide your contact and educational information"}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {step === 1 && <Step1Skills onNext={handleNextStep} />}
          {step === 2 && scoreData && (
            <Step2Details
              onFinish={handleFinish}
              initialData={formData}
              scoreData={scoreData}
              onPrevious={handlePreviousStep}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
