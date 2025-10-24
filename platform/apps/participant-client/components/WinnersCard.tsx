// apps/participant-client/app/components/WinnersCard.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default function WinnersCard({ hackathonId }: { hackathonId: string }) {
    const [winners, setWinners] = useState<{name: string, rank: number}[]>([]);

    useEffect(() => {
        axios.get(`/api/hackathons/${hackathonId}/winners`).then(res => setWinners(res.data));
    }, [hackathonId]);

    if (winners.length === 0) return null; // Don't show the card if no winners are announced

    const rankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-500';
        if (rank === 2) return 'text-gray-400';
        if (rank === 3) return 'text-orange-400';
    };
    
    return (
        <Card>
            <CardHeader><CardTitle>🏆 Winners</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                {winners.map(winner => (
                    <div key={winner.rank} className="flex items-center gap-4">
                        <Trophy className={`h-6 w-6 ${rankColor(winner.rank!)}`} />
                        <div>
                            <p className="font-bold">{winner.rank === 1 ? '1st' : winner.rank === 2 ? '2nd' : '3rd'} Place</p>
                            <p className="text-sm text-gray-500">{winner.name}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}