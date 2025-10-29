"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Pencil, Users } from "lucide-react"
import TeamEditor from "./TeamEditor"

interface Member {
  name: string | null
  image: string | null
}

interface TeamData {
  id: string
  name: string
  bio: string | null
  skills: string | null
  members: Member[]
}

export default function MyTeamCard({
  team,
  onTeamUpdate,
}: {
  team: TeamData | null
  onTeamUpdate: () => void
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  if (!team) return null

  return (
    <>
      <Card className="border-primary/10 hover:border-primary/30 transition-colors">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg truncate">{team.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {team.members.length} {team.members.length === 1 ? "member" : "members"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditorOpen(true)}
              className="shrink-0 hover:bg-primary/10"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {team.bio && (
            <div className="p-3 rounded-lg bg-muted/50 border border-muted">
              <p className="text-sm text-foreground italic">"{team.bio}"</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary"></span>
              Team Members
            </h4>
            <div className="space-y-2">
              {team.members.map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={member.image || ""} alt={member.name || "Member"} />
                    <AvatarFallback className="text-xs">{member.name?.charAt(0) || "M"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground truncate">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <TeamEditor
        teamId={team.id}
        initialBio={team.bio}
        initialSkills={team.skills}
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onTeamUpdate={onTeamUpdate}
      />
    </>
  )
}
