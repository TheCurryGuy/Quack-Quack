// apps/participant-client/app/components/HackathonTimer.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer } from 'lucide-react';

interface HackathonTimerProps {
    status: 'UPCOMING' | 'LIVE' | 'ENDED';
    startDate: string;
    actualStartTime: string | null;
    durationHours: number;
}

// Helper function to format the remaining time
const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export default function HackathonTimer({ status, startDate, actualStartTime, durationHours }: HackathonTimerProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [title, setTitle] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            
            if (status === 'UPCOMING') {
                setTitle('Starts In');
                const startTime = new Date(startDate).getTime();
                const distance = startTime - now;
                setTimeLeft(distance > 0 ? formatTime(distance) : 'Starting soon...');
            } else if (status === 'LIVE' && actualStartTime) {
                setTitle('Ends In');
                const endTime = new Date(actualStartTime).getTime() + durationHours * 60 * 60 * 1000;
                const distance = endTime - now;
                setTimeLeft(distance > 0 ? formatTime(distance) : 'Ending now!');
            } else {
                setTimeLeft('');
                setTitle('');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [status, startDate, actualStartTime, durationHours]);

    if (status === 'ENDED' || !title) {
        return (
            <Card>
                <CardHeader><CardTitle>Event Status</CardTitle></CardHeader>
                <CardContent>
                    <p className="font-semibold text-center text-red-600">This hackathon has ended.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    <span>{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center font-mono tracking-tighter">
                    {timeLeft}
                </p>
            </CardContent>
        </Card>
    );
}