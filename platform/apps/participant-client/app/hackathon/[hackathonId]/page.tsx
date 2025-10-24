// apps/participant-client/app/hackathon/[hackathonId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { useSession } from 'next-auth/react';

// Import all UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Calendar, Clock, Users, ShieldCheck } from 'lucide-react';

// Import our custom wizard components
import IndividualRegistrationWizard from '@/components/IndividualRegistrationWizard';
import TeamRegistrationWizard from '@/components/TeamRegistrationWizard';

// Define the shape of the hackathon data we expect
interface HackathonData {
    id: string;
    name: string;
    body: string;
    bannerUrl: string;
    startDate: string;
    registrationDeadline: string;
    durationHours: number;
    teamSize: number;
    isRegistrationOpen: boolean;
    status: 'UPCOMING' | 'LIVE' | 'ENDED';
}

export default function HackathonDetailPage() {
    const { hackathonId } = useParams();
    const { data: session } = useSession();
    
    // State for data fetching
    const [hackathon, setHackathon] = useState<HackathonData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for UI interactivity
    const [isIndividualWizardOpen, setIsIndividualWizardOpen] = useState(false);
    const [isTeamWizardOpen, setIsTeamWizardOpen] = useState(false);
    const [joinToken, setJoinToken] = useState('');
    const [generatedTokens, setGeneratedTokens] = useState<string[]>([]);
    const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

    // Fetch hackathon data on component mount
    useEffect(() => {
        if (hackathonId) {
            const fetchHackathon = async () => {
                try {
                    const response = await axios.get(`/api/hackathons/${hackathonId}`);
                    setHackathon(response.data);
                } catch (err) {
                    setError('Failed to load hackathon details. It might not exist.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchHackathon();
        }
    }, [hackathonId]);

    // --- HANDLER FUNCTIONS ---

    const handleIndividualRegisterClick = () => {
        if (!session) { alert('Please sign in with GitHub to register.'); return; }
        setIsIndividualWizardOpen(true);
    };

    const handleTeamRegisterClick = () => {
        if (!session) { alert('Please sign in with GitHub to register.'); return; }
        setIsTeamWizardOpen(true);
    };

    const handleJoinTeam = async () => {
        if (!session) { alert('Please sign in to join a team.'); return; }
        if (!joinToken.trim()) { alert('Please enter a join token.'); return; }
        try {
            await axios.post('/api/teams/join', { token: joinToken });
            alert('Successfully joined team!');
            setJoinToken('');
        } catch (error: any) {
            alert(`Failed to join team: ${error.response?.data?.message}`);
        }
    };
    
    // This is called when the team registration wizard successfully completes
    const onTeamRegistrationComplete = (tokens: string[]) => {
        setIsTeamWizardOpen(false);
        setGeneratedTokens(tokens);
        setIsTokenModalOpen(true); // Show the modal with the generated tokens
    };

    // --- RENDER LOGIC ---

    if (isLoading) {
        return <div className="text-center p-12">Loading Hackathon...</div>;
    }

    if (error) {
        return <div className="text-center p-12 text-destructive">{error}</div>;
    }

    if (!hackathon) {
        return null; // or a more graceful empty state
    }

    return (
        <div className="container mx-auto max-w-5xl p-4">
            <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden mb-8">
                <Image src={hackathon.bannerUrl} alt={`${hackathon.name} banner`} layout="fill" objectFit="cover" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">{hackathon.name}</h1>
                    <article className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{hackathon.body}</ReactMarkdown>
                    </article>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <InfoItem icon={Calendar} label="Starts on" value={new Date(hackathon.startDate).toLocaleDateString()} />
                            <InfoItem icon={Clock} label="Duration" value={`${hackathon.durationHours} Hours`} />
                            <InfoItem icon={Users} label="Team Size" value={`Up to ${hackathon.teamSize} members`} />
                            <InfoItem icon={ShieldCheck} label="Registration Deadline" value={new Date(hackathon.registrationDeadline).toLocaleDateString()} />
                        </CardContent>
                    </Card>

                    {hackathon.isRegistrationOpen && hackathon.status !== 'ENDED' ? (
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="font-bold text-lg text-center">Join the Challenge!</h3>
                                <Button className="w-full" size="lg" onClick={handleIndividualRegisterClick}>Register as an Individual</Button>
                                <Button className="w-full" size="lg" variant="secondary" onClick={handleTeamRegisterClick}>Register as a Team</Button>
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <Input placeholder="Enter team join token..." value={joinToken} onChange={e => setJoinToken(e.target.value)} />
                                    <Button onClick={handleJoinTeam}>Join</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                         <Card>
                            <CardContent className="pt-6"><p className="text-center font-semibold">Registration for this event is now closed.</p></CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* --- WIZARDS AND MODALS (Rendered but hidden) --- */}
            {hackathon && <IndividualRegistrationWizard hackathonId={hackathon.id} open={isIndividualWizardOpen} onOpenChange={setIsIndividualWizardOpen} />}
            {hackathon && <TeamRegistrationWizard hackathonId={hackathon.id} teamSize={hackathon.teamSize} open={isTeamWizardOpen} onOpenChange={setIsTeamWizardOpen} onRegistrationComplete={onTeamRegistrationComplete} />}
            
            <AlertDialog open={isTokenModalOpen} onOpenChange={setIsTokenModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Team Registration Initiated!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your spot is confirmed. Share these unique tokens with your teammates for them to join.
                            <div className="mt-4 space-y-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                {generatedTokens.map((token, i) => <p key={i} className="font-mono text-sm break-all">{token}</p>)}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Button onClick={() => setIsTokenModalOpen(false)}>Close</Button>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// A small helper component for the info items
const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-gray-500 mt-1" />
        <div>
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
        </div>
    </div>
);