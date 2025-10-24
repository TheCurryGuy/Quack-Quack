// apps/participant-client/app/components/Step2Details.tsx
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Step2Details({ onFinish, initialData, scoreData }: { onFinish: (data: any) => void, initialData: any, scoreData: any }) {
    const [details, setDetails] = useState({ githubUrl: '', portfolioUrl: '', college: '', year: new Date().getFullYear() });

    const handleSubmit = () => {
        onFinish({ ...initialData, ...details, profileScore: scoreData.score, eligibility: scoreData.eligible_to });
    };

    return (
        <div className="space-y-4">
            <p>Profile Score: <strong>{scoreData.score}</strong> | Eligibility: <strong>{scoreData.eligible_to}</strong></p>
            <Input placeholder="GitHub Profile URL" value={details.githubUrl} onChange={e => setDetails(prev => ({ ...prev, githubUrl: e.target.value }))} />
            <Input placeholder="Portfolio URL (Optional)" value={details.portfolioUrl} onChange={e => setDetails(prev => ({ ...prev, portfolioUrl: e.target.value }))} />
            <Input placeholder="College Name" value={details.college} onChange={e => setDetails(prev => ({ ...prev, college: e.target.value }))} />
            <Input type="number" placeholder="Year of Graduation" value={details.year} onChange={e => setDetails(prev => ({ ...prev, year: parseInt(e.target.value) }))} />
            <Button onClick={handleSubmit}>Submit Registration</Button>
        </div>
    );
}