// apps/participant-client/app/components/TeamEditor.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TeamEditorProps {
    teamId: string;
    initialBio: string | null;
    initialSkills: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTeamUpdate: () => void; // Callback to refresh parent data
}

export default function TeamEditor({ teamId, initialBio, initialSkills, open, onOpenChange, onTeamUpdate }: TeamEditorProps) {
    const [bio, setBio] = useState(initialBio || '');
    const [skills, setSkills] = useState(initialSkills || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await axios.put(`/api/teams/${teamId}`, { bio, skills });
            onTeamUpdate(); // Trigger data refresh
            onOpenChange(false); // Close the modal
        } catch (error) {
            console.error("Failed to update team", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Your Team Profile</DialogTitle>
                    <DialogDescription>
                        Share more about your team's identity and strengths.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="bio">Team Bio</Label>
                        <Textarea id="bio" placeholder="Tell us about your team's mission..." value={bio} onChange={e => setBio(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="skills">Team Skills</Label>
                        <Input id="skills" placeholder="e.g., Web Dev, AI, Mobile, Design" value={skills} onChange={e => setSkills(e.target.value)} />
                        <p className="text-xs text-gray-500">Enter skills separated by commas.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}