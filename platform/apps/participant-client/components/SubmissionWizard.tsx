// apps/participant-client/app/components/SubmissionWizard.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { ChevronsUpDown, X } from 'lucide-react';

const ALL_TECHS = [
    "React", "Next.js", "Javascript/Typescript", "Express.js", "Python", "Flask/FastAPI",
    "PostgreSQL/MongoDB", "AWS", "GCP", "Azure", "Tensorflow/Pytorch", "OpenCV",
    "Prisma", "TailwindCss", "Recoil", "Redux", "TanStack Query", "Zustand", "Socket.io", "Hono.js"
];

interface Step1Data { projectName: string; techStacks: string[]; }
interface ScoreData { score: number; }

export default function SubmissionWizard({ hackathonId, open, onOpenChange, onSubmissionSuccess }: { hackathonId: string, open: boolean, onOpenChange: (open: boolean) => void, onSubmissionSuccess: () => void }) {
    const [step, setStep] = useState(1);
    const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
    const [scoreData, setScoreData] = useState<ScoreData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Step 1 States & Handlers ---
    const [projectName, setProjectName] = useState('');
    const [techs, setTechs] = useState<string[]>([]);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const handleNextStep = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const tech_stack_used = techs.join(' ');
            const response = await axios.post('/api/project-score', { name: projectName, tech_stack_used });
            setStep1Data({ projectName, techStacks: techs });
            setScoreData(response.data);
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to get project score.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Step 2 States & Handlers ---
    const [details, setDetails] = useState({ about: '', problem: '', githubUrl: '' });
    
    const handleFinalSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(`/api/hackathons/${hackathonId}/submit`, {
                title: step1Data?.projectName,
                techStacks: step1Data?.techStacks,
                aiScore: scoreData?.score,
                about: details.about,
                problem: details.problem,
                githubUrl: details.githubUrl,
            });
            onSubmissionSuccess();
            resetAndClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit project.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setProjectName('');
        setTechs([]);
        setDetails({ about: '', problem: '', githubUrl: '' });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit Your Project</DialogTitle>
                    <DialogDescription>{step === 1 ? "Step 1: Project Identity" : "Step 2: Project Details"}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {step === 1 && (
                        <>
                            <Input placeholder="Project Name" value={projectName} onChange={e => setProjectName(e.target.value)} />
                            <div className="border rounded-md min-h-[40px] p-2 flex flex-wrap gap-2">
                                {techs.map(t => <Badge key={t} variant="secondary">{t}<X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setTechs(techs.filter(s => s !== t))} /></Badge>)}
                            </div>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}><PopoverTrigger asChild><Button variant="outline" className="w-full justify-between">Select technologies...<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-[375px] p-0"><Command><CommandInput placeholder="Search tech..." /><CommandEmpty>No tech found.</CommandEmpty><CommandGroup>{ALL_TECHS.filter(t => !techs.includes(t)).map(t => (<CommandItem key={t} value={t} onSelect={() => {setTechs([...techs, t]); setPopoverOpen(false);}}>{t}</CommandItem>))}</CommandGroup></Command></PopoverContent></Popover>
                            <Button onClick={handleNextStep} disabled={isLoading || !projectName || techs.length === 0} className="w-full">
                                {isLoading ? 'Evaluating...' : 'Next'}
                            </Button>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <div className="p-3 text-center bg-gray-100 rounded-md">
                                <p className="text-sm text-gray-600">Your AI-Evaluated Score</p>
                                <p className="text-4xl font-bold">{scoreData?.score}/100</p>
                            </div>
                            <Textarea placeholder="About your project..." value={details.about} onChange={e => setDetails(p => ({...p, about: e.target.value}))} />
                            <Textarea placeholder="What problem does it solve?" value={details.problem} onChange={e => setDetails(p => ({...p, problem: e.target.value}))} />
                            <Input placeholder="GitHub Repository URL" value={details.githubUrl} onChange={e => setDetails(p => ({...p, githubUrl: e.target.value}))} />
                             <Button onClick={handleFinalSubmit} disabled={isLoading} className="w-full">
                                {isLoading ? 'Submitting...' : 'Submit Project'}
                            </Button>
                        </>
                    )}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
}