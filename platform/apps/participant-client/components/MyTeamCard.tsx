// apps/participant-client/app/components/MyTeamCard.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import TeamEditor from './TeamEditor';

interface Member { name: string | null; image: string | null; }
interface TeamData {
    id: string; // We need the ID now
    name: string;
    bio: string | null;
    skills: string | null;
    members: Member[];
}

export default function MyTeamCard({ team, onTeamUpdate }: { team: TeamData | null, onTeamUpdate: () => void }) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    if (!team) return null;

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>My Team: {team.name}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditorOpen(true)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {team.bio && <p className="text-sm text-gray-600 italic">"{team.bio}"</p>}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Members:</h4>
                        {team.members.map((member, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={member.image || ''} alt={member.name || 'Member'} />
                                    <AvatarFallback>{member.name?.charAt(0) || 'M'}</AvatarFallback>
                                </Avatar>
                                <span>{member.name}</span>
                            </div>
                        ))}
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
    );
}