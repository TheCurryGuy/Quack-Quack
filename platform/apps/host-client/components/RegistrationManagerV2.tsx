// apps/host-client/app/components/RegistrationManagerV2.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, X } from 'lucide-react';

// Define types to match our new API response
interface IndividualApp {
    id: string;
    profileScore: number;
    eligibility: string;
    githubUrl: string;
    college: string;
    year: number;
    user: { name: string | null; email: string; };
}
interface TeamApp {
    id: string;
    teamName: string;
    pendingMembers: {
        name: string;
        email: string;
        githubUrl: string;
        claimedByUserId: string | null;
    }[];
}

export default function RegistrationManagerV2({ hackathonId }: { hackathonId: string }) {
    const { token } = useAuth();
    const [individualApps, setIndividualApps] = useState<IndividualApp[]>([]);
    const [teamApps, setTeamApps] = useState<TeamApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRegistrations = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`/api/protected/hackathons/${hackathonId}/registrations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setIndividualApps(response.data.individualApps);
            setTeamApps(response.data.teamApps);
        } catch (error) {
            console.error("Failed to fetch registrations", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, [token, hackathonId]);

    const handleIndividualUpdate = async (regId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await axios.put(`/api/protected/individual-registrations/${regId}/update`, { status }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Remove the processed application from the UI for instant feedback
            setIndividualApps(prev => prev.filter(app => app.id !== regId));
        } catch (error) {
            console.error("Failed to update individual registration", error);
        }
    };

    const handleTeamUpdate = async (regId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await axios.put(`/api/protected/team-registrations/${regId}/update`, { status }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTeamApps(prev => prev.filter(app => app.id !== regId));
        } catch (error) {
            console.error("Failed to update team registration", error);
        }
    };
    
    if (isLoading) return <p>Loading applications...</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Team Applications Section */}
            <Card>
                <CardHeader><CardTitle>Pending Team Applications ({teamApps.length})</CardTitle></CardHeader>
                <CardContent>
                    {teamApps.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {teamApps.map(app => (
                                <AccordionItem key={app.id} value={app.id}>
                                    <AccordionTrigger>{app.teamName} ({app.pendingMembers.length} members)</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3">
                                            {app.pendingMembers.map((member, i) => (
                                                <div key={i} className="text-sm p-2 border-b">
                                                    <p><strong>Name:</strong> {member.name} ({member.email})</p>
                                                    <p><strong>GitHub:</strong> <a href={member.githubUrl} target="_blank" className="text-blue-500">{member.githubUrl}</a></p>
                                                    <p><strong>Status:</strong> {member.claimedByUserId ? 'Claimed' : 'Pending Invite'}</p>
                                                </div>
                                            ))}
                                            <div className="flex gap-2 mt-4">
                                                <Button size="icon" variant="outline" className="text-green-500" onClick={() => handleTeamUpdate(app.id, 'APPROVED')}><Check size={16} /></Button>
                                                <Button size="icon" variant="outline" className="text-red-500" onClick={() => handleTeamUpdate(app.id, 'REJECTED')}><X size={16} /></Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : <p>No pending team applications.</p>}
                </CardContent>
            </Card>

            {/* Individual Applications Section */}
            <Card>
                <CardHeader><CardTitle>Pending Individual Applications ({individualApps.length})</CardTitle></CardHeader>
                <CardContent>
                    {individualApps.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {individualApps.map(app => (
                                <AccordionItem key={app.id} value={app.id}>
                                    <AccordionTrigger>{app.user.name} (Score: {app.profileScore})</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Email:</strong> {app.user.email}</p>
                                            <p><strong>GitHub:</strong> <a href={app.githubUrl} target="_blank" className="text-blue-500">{app.githubUrl}</a></p>
                                            <p><strong>College:</strong> {app.college} ({app.year})</p>
                                            <p><strong>AI Eligibility:</strong> {app.eligibility}</p>
                                            <div className="flex gap-2 mt-4">
                                                <Button size="icon" variant="outline" className="text-green-500" onClick={() => handleIndividualUpdate(app.id, 'APPROVED')}><Check size={16} /></Button>
                                                <Button size="icon" variant="outline" className="text-red-500" onClick={() => handleIndividualUpdate(app.id, 'REJECTED')}><X size={16} /></Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : <p>No pending individual applications.</p>}
                </CardContent>
            </Card>
        </div>
    );
}