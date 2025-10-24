// apps/participant-client/app/components/IndividualRegistrationWizard.tsx
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Step1Skills from './Step1Skills';
import Step2Details from './Step2Details';
import axios from 'axios';


interface FormData {
    name: string;
    skills: string[];
    githubUrl: string;
    portfolioUrl: string;
    college: string;
    year: number;
}

interface ScoreData {
    score: number;
    eligible_to: string;
}

export default function IndividualRegistrationWizard({ hackathonId, open, onOpenChange }: { hackathonId: string, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<FormData>>({});
    const [scoreData, setScoreData] = useState<ScoreData | null>(null);

    const handleFinish = async (finalData: FormData) => {
        try {
            await axios.post(`/api/hackathons/${hackathonId}/register-individual`, finalData);
            alert('Registration successful!');
            handleReset();
        } catch (error) {
            console.error(error);
            alert('Registration failed.');
        }
    };

    const handleNextStep = (data: Partial<FormData>, scoreInfo?: ScoreData) => {
        setFormData(prev => ({ ...prev, ...data }));
        if (scoreInfo) {
            setScoreData(scoreInfo);
        }
        setStep(step + 1);
    };

    const handlePreviousStep = () => {
        setStep(step - 1);
    };
    
    const handleReset = () => {
        setStep(1);
        setFormData({});
        setScoreData(null);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register for Hackathon</DialogTitle>
                    <DialogDescription>
                        {step === 1 ? "Step 1: Tell us about your skills." : "Step 2: Complete your profile."}
                    </DialogDescription>
                </DialogHeader>
                {step === 1 && <Step1Skills onNext={handleNextStep} />}
            {step === 2 && scoreData && <Step2Details onFinish={handleFinish} initialData={formData} scoreData={scoreData} />}
                
            </DialogContent>
        </Dialog>
    );
}