"use client"

import { useState } from "react"
import axios from "axios"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TeamEditorProps {
  teamId: string
  initialBio: string | null
  initialSkills: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTeamUpdate: () => void
}

export default function TeamEditor({
  teamId,
  initialBio,
  initialSkills,
  open,
  onOpenChange,
  onTeamUpdate,
}: TeamEditorProps) {
  const [bio, setBio] = useState(initialBio || "")
  const [skills, setSkills] = useState(initialSkills || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await axios.put(`/api/teams/${teamId}`, { bio, skills })
      onTeamUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update team", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Team Profile</DialogTitle>
          <DialogDescription className="text-base">
            Share your team's mission and showcase your strengths.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label htmlFor="bio" className="text-base font-semibold">
              Team Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us about your team's mission, vision, and what makes you unique..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">Share your team's story and goals</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="skills" className="text-base font-semibold">
              Team Skills
            </Label>
            <Input
              id="skills"
              placeholder="e.g., Web Dev, AI, Mobile, Design, DevOps"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Enter skills separated by commas for better visibility</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="min-w-[120px]">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
