// apps/participant-client/app/components/TeamRegistrationWizard.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

// Define the shape for one member's data
interface MemberData {
    name: string;
    email: string;
    githubUrl: string;
    portfolioUrl: string;
    college: string;
    year: number;
}

export default function TeamRegistrationWizard({ hackathonId, teamSize, open, onOpenChange, onRegistrationComplete }: { hackathonId: string, teamSize: number, open: boolean, onOpenChange: (open: boolean) => void, onRegistrationComplete: (tokens: string[]) => void }) {
    const [teamName, setTeamName] = useState('');
    const [members, setMembers] = useState<MemberData[]>([
        // Pre-fill one empty member for the leader to start with
        { name: '', email: '', githubUrl: '', portfolioUrl: '', college: '', year: new Date().getFullYear() }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMemberChange = (index: number, field: keyof MemberData, value: string | number) => {
        const updatedMembers = [...members];
        updatedMembers[index] = { ...updatedMembers[index], [field]: value } as MemberData;
        setMembers(updatedMembers);
    };

    const addMember = () => {
        if (members.length < teamSize) {
            setMembers([...members, { name: '', email: '', githubUrl: '', portfolioUrl: '', college: '', year: new Date().getFullYear() }]);
        }
    };

    const removeMember = (index: number) => {
        if (members.length > 1) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };
    
    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`/api/hackathons/${hackathonId}/register-team`, {
                teamName: teamName,
                members: members,
            });
            onRegistrationComplete(response.data.joinTokens); // Pass tokens to parent
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register team.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Register Your Team</DialogTitle>
                    <DialogDescription>
                        Enter your team's name and the details for each member. You will receive join tokens to share with them.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-2">
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                    </div>
                    {members.map((member, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-2 relative">
                            <h4 className="font-semibold">Member {index + 1}</h4>
                            {members.length > 1 && <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeMember(index)}><X className="h-4 w-4" /></Button>}
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Full Name" value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} />
                                <Input placeholder="Email" type="email" value={member.email} onChange={(e) => handleMemberChange(index, 'email', e.target.value)} />
                                <Input placeholder="GitHub URL" value={member.githubUrl} onChange={(e) => handleMemberChange(index, 'githubUrl', e.target.value)} />
                                <Input placeholder="Portfolio URL (Optional)" value={member.portfolioUrl} onChange={(e) => handleMemberChange(index, 'portfolioUrl', e.target.value)} />
                                <Input placeholder="College" value={member.college} onChange={(e) => handleMemberChange(index, 'college', e.target.value)} />
                                <Input placeholder="Year of Grad" type="number" value={member.year} onChange={(e) => handleMemberChange(index, 'year', parseInt(e.target.value))} />
                            </div>
                        </div>
                    ))}
                    {members.length < teamSize && <Button variant="outline" onClick={addMember}>Add Another Member</Button>}
                </div>
                 {error && <p className="text-sm text-destructive">{error}</p>}
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Registering...' : 'Register Team'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}