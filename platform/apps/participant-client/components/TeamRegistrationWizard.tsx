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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Users } from "lucide-react"

interface MemberData {
  name: string
  email: string
  githubUrl: string
  portfolioUrl: string
  college: string
  year: number
}

export default function TeamRegistrationWizard({
  hackathonId,
  teamSize,
  open,
  onOpenChange,
  onRegistrationComplete,
}: {
  hackathonId: string
  teamSize: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegistrationComplete: (tokens: string[]) => void
}) {
  const [teamName, setTeamName] = useState("")
  const [members, setMembers] = useState<MemberData[]>([
    { name: "", email: "", githubUrl: "", portfolioUrl: "", college: "", year: new Date().getFullYear() },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMemberChange = (index: number, field: keyof MemberData, value: string | number) => {
    const updatedMembers = [...members]
    updatedMembers[index] = { ...updatedMembers[index], [field]: value } as MemberData
    setMembers(updatedMembers)
  }

  const addMember = () => {
    if (members.length < teamSize) {
      setMembers([
        ...members,
        { name: "", email: "", githubUrl: "", portfolioUrl: "", college: "", year: new Date().getFullYear() },
      ])
    }
  }

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.post(`/api/hackathons/${hackathonId}/register-team`, {
        teamName: teamName,
        members: members,
      })
      onRegistrationComplete(response.data.joinTokens)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register team.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6" />
            Register Your Team
          </DialogTitle>
          <DialogDescription className="text-base">
            Enter your team's name and details for each member. You'll receive join tokens to share.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[65vh] overflow-y-auto pr-4">
          <div className="space-y-3">
            <Label htmlFor="team-name" className="text-base font-semibold">
              Team Name
            </Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter your awesome team name"
              className="h-10"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Team Members ({members.length}/{teamSize})
              </Label>
            </div>

            {members.map((member, index) => (
              <div
                key={index}
                className="p-4 border-2 border-primary/30 rounded-lg space-y-3 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Member {index + 1}</h4>
                  {members.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeMember(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Full Name"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                    className="h-9"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                    className="h-9"
                  />
                  <Input
                    placeholder="GitHub URL"
                    value={member.githubUrl}
                    onChange={(e) => handleMemberChange(index, "githubUrl", e.target.value)}
                    className="h-9"
                  />
                  <Input
                    placeholder="Portfolio URL (Optional)"
                    value={member.portfolioUrl}
                    onChange={(e) => handleMemberChange(index, "portfolioUrl", e.target.value)}
                    className="h-9"
                  />
                  <Input
                    placeholder="College"
                    value={member.college}
                    onChange={(e) => handleMemberChange(index, "college", e.target.value)}
                    className="h-9"
                  />
                  <Input
                    placeholder="Year of Graduation"
                    type="number"
                    value={member.year}
                    onChange={(e) => handleMemberChange(index, "year", Number.parseInt(e.target.value))}
                    className="h-9"
                  />
                </div>
              </div>
            ))}
          </div>

          {members.length < teamSize && (
            <Button variant="outline" onClick={addMember} className="w-full bg-transparent">
              + Add Another Member
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !teamName} className="min-w-[140px]">
            {isLoading ? "Registering..." : "Register Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
