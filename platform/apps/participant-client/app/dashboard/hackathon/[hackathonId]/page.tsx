// apps/participant-client/app/dashboard/hackathon/[hackathonId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Users, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import StatusCard from '@/components/StatusCard';
import MyTeamCard from '@/components/MyTeamCard';

import { Button } from '@/components/ui/button';


interface StatusData {
    registrationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    teamDetails: { name: string; members: any[] } | null;
}
interface HackathonData {
    id: string;
    name: string;
    body: string;
    bannerUrl: string;
    startDate: string;
    durationHours: number;
    teamSize: number;
}

export default function ParticipantHackathonPage() {
    const { hackathonId } = useParams();
    const [statusData, setStatusData] = useState<StatusData | null>(null);
    const [hackathon, setHackathon] = useState<HackathonData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (hackathonId) {
            // We can reuse the public API to get the hackathon's base details
            const fetchHackathon = async () => {
                try {
                    const response = await axios.get(`/api/hackathons/${hackathonId}`);
                    setHackathon(response.data);
                } catch (err) {
                    console.error("Failed to load hackathon details");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchHackathon();
            const fetchMyStatus = async () => {
                try {
                    const response = await axios.get(`/api/hackathons/${hackathonId}/my-status`);
                    setStatusData(response.data);
                } catch (error) {
                    console.log("User may not be registered yet.");
                }
            };
            fetchMyStatus();
        }
    }, [hackathonId]);

    if (isLoading) {
        return <div>Loading your hackathon dashboard...</div>;
    }

    if (!hackathon) {
        return <div>Could not load hackathon details.</div>;
    }

    return (
        <div>
            <div className="relative w-full h-48 rounded-lg overflow-hidden mb-8">
                <Image src={hackathon.bannerUrl} alt={`${hackathon.name} banner`} layout="fill" objectFit="cover" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side with user-specific sections */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-2xl font-bold">Your Dashboard</h2>
                    <StatusCard status={statusData?.registrationStatus || null} />
                    
                    {/* Conditionally render the team card */}
                    {statusData?.teamDetails && <MyTeamCard team={statusData.teamDetails} />}
                    
                    {/* Placeholders for future components */}
                    <Card><CardContent className="pt-6">Submission section coming soon...</CardContent></Card>
                </div>

                {/* Main Content with hackathon details */}
                <div className="lg:col-span-2">
                     <Link href={`/hackathon/${hackathon.id}`} legacyBehavior>
                        <a target="_blank" rel="noopener noreferrer"><Button variant="outline">View Public Page</Button></a>
                    </Link>
                    <h1 className="text-4xl font-extrabold tracking-tight mt-4 mb-4">{hackathon.name}</h1>
                    <article className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{hackathon.body}</ReactMarkdown>
                    </article>
                </div>
            </div>
        </div>
    );
}