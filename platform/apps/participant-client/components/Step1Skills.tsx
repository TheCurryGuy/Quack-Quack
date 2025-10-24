// apps/participant-client/app/components/Step1Skills.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { ChevronsUpDown, X } from 'lucide-react';

// The list of skills you provided
const ALL_SKILLS = [
    "React", "Next.js", "Javascript/Typescript", "Express.js", "Python",
    "Flask/FastAPI", "PostgreSQL/MongoDB", "AWS", "GCP", "Azure",
    "Tensorflow/Pytorch", "OpenCV", "Prisma", "TailwindCss", "Recoil",
    "Redux", "TanStack Query", "Zustand", "Socket.io", "Hono.js"
];

export default function Step1Skills({ onNext }: { onNext: (data: any, scoreData: any) => void }) {
    const [name, setName] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [open, setOpen] = useState(false); // State for the popover
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handler to add a skill
    const handleSelect = (skill: string) => {
        if (!selectedSkills.includes(skill)) {
            setSelectedSkills([...selectedSkills, skill]);
        }
        setOpen(false); // Close the popover after selection
    };

    // Handler to remove a skill by clicking the badge's 'X'
    const handleDeselect = (skillToRemove: string) => {
        setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
    };
    
    // Handler for the "Next" button
    const handleNext = async () => {
        if (!name || selectedSkills.length === 0) {
            setError('Please enter your name and select at least one skill.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Format the skills array into the required space-separated string
            const tech_stack_used = selectedSkills.join(' ');
            
            const response = await axios.post('/api/profile-score', {
                name: name,
                tech_stack_used: tech_stack_used,
            });
            
            // Pass both the form data and the score data to the parent wizard
            onNext({ name, skills: selectedSkills }, response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to get profile score. Please try again.");
            console.error("Failed to get profile score", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter out already selected skills from the dropdown list
    const availableSkills = ALL_SKILLS.filter(skill => !selectedSkills.includes(skill));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                <Input id="name" placeholder="Ada Lovelace" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
                 <label className="text-sm font-medium">Your Skills</label>
                 {/* Area to display selected skills as badges */}
                 <div className="border rounded-md min-h-10 p-2 flex flex-wrap gap-2">
                    {selectedSkills.map(skill => (
                        <Badge key={skill} variant="secondary">
                            {skill}
                            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleDeselect(skill)} />
                        </Badge>
                    ))}
                 </div>
            </div>

            {/* The Popover and Command component for skill selection */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                        {selectedSkills.length > 0 ? "Select more skills..." : "Select skills..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[375px] p-0">
                    <Command>
                        <CommandInput placeholder="Search skills..." />
                        <CommandEmpty>No skill found.</CommandEmpty>
                        <CommandGroup>
                            {availableSkills.map((skill) => (
                                <CommandItem key={skill} value={skill} onSelect={() => handleSelect(skill)}>
                                    {skill}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            {error && <p className="text-sm text-destructive">{error}</p>}
            
            <Button onClick={handleNext} disabled={isLoading || !name || selectedSkills.length === 0} className="w-full">
                {isLoading ? 'Analyzing Profile...' : 'Next'}
            </Button>
        </div>
    );
}