// apps/participant-client/app/components/MyTeamCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Member { name: string | null; image: string | null; }
interface TeamData { name: string; members: Member[]; }

export default function MyTeamCard({ team }: { team: TeamData | null }) {
    if (!team) {
        // This component will only be shown if team data exists, but as a fallback.
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Team: {team.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {team.members.map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={member.image || ''} alt={member.name || 'Member'} />
                            <AvatarFallback>{member.name?.charAt(0) || 'M'}</AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}