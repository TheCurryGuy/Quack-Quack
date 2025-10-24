// apps/participant-client/app/components/SubmissionCard.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SubmissionWizard from './SubmissionWizard';

// The prop shape now includes the full submission details
interface Submission {
    id: string;
    title: string;
    about: string;
    problem: string;
    aiScore: number;
}

export default function SubmissionCard({ hackathonId, hackathonStatus, submission, onSubmissionSuccess }: { hackathonId: string, hackathonStatus: string, submission: Submission | null, onSubmissionSuccess: () => void }) {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const canSubmit = hackathonStatus === 'LIVE';

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Project Submission</CardTitle>
                    {submission && <CardDescription>Your project has been submitted!</CardDescription>}
                </CardHeader>
                <CardContent>
                    {submission ? (
                        <div className="space-y-4">
                            {/* The "Nicely Rendered" Preview */}
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="font-semibold">{submission.title}</AccordionTrigger>
                                    <AccordionContent className="space-y-4">
                                        <div>
                                            <h4 className="font-bold">About This Project</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{submission.about}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold">Problem It Solves</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{submission.problem}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            
                            {/* AI Score and Share Button */}
                            <div className="text-center pt-4">
                                <p className="text-sm text-gray-500">AI Score</p>
                                <p className="text-3xl font-bold">{submission.aiScore}/100</p>
                            </div>
                            <Link href={`/project/${submission.id}`} legacyBehavior>
                                <a target="_blank" rel="noopener noreferrer" className="block">
                                    <Button variant="outline" className="w-full">Share Your Project</Button>
                                </a>
                            </Link>
                        </div>
                    ) : canSubmit ? (
                        <Button className="w-full" onClick={() => setIsWizardOpen(true)}>Submit Your Project</Button>
                    ) : (
                        <p className="text-sm text-gray-500 text-center">Submissions will open when the hackathon is live.</p>
                    )}
                </CardContent>
            </Card>
            {/* The wizard is only rendered if there is no submission yet */}
            {!submission && <SubmissionWizard 
                hackathonId={hackathonId}
                open={isWizardOpen}
                onOpenChange={setIsWizardOpen}
                onSubmissionSuccess={onSubmissionSuccess}
            />}
        </>
    );
}