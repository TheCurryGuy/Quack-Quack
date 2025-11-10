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
      <Card className="border-2 border-primary/30 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10">
        <CardHeader className="pb-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl font-bold truncate">{team.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
                  {team.members.length} {team.members.length === 1 ? "member" : "members"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditorOpen(true)}
              className="shrink-0 hover:bg-primary/10 hover:text-primary h-10 w-10"
            >
              <Pencil className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {team.bio && (
            <div className="p-4 rounded-xl bg-muted/30 border-2 border-border/60">
              <p className="text-base text-foreground italic leading-relaxed">"{team.bio}"</p>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Team Members
            </h4>
            <div className="space-y-2">
              {team.members.length > 0 ? (
                team.members.map((member, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors border border-border/30">
                    <Avatar className="h-10 w-10 shrink-0 border-2 border-border/60">
                      <AvatarImage src={member.image || ""} alt={member.name || "Member"} />
                      <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">{member.name?.charAt(0) || "M"}</AvatarFallback>
                    </Avatar>
                    <span className="text-base font-semibold text-foreground truncate">{member.name}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-center">
                  <p className="text-sm text-muted-foreground">No members have joined yet</p>
                </div>
              )}
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
