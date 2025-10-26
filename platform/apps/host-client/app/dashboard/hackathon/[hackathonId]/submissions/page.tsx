// apps/host-client/app/dashboard/hackathon/[hackathonId]/submissions/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';

// Helper function to trigger download
const downloadCsv = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default function ViewSubmissionsPage() {
    const { token } = useAuth();
    const { hackathonId } = useParams();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token && hackathonId) {
            // We can reuse the JSON submissions endpoint we built for the WinnerAnnouncer
            const fetchSubmissions = async () => {
                try {
                    // This is a placeholder for a more detailed endpoint if needed,
                    // for now we get the full details from the CSV export endpoint itself.
                    // This is a temporary measure, a dedicated JSON endpoint is better.
                    const response = await axios.get(`/api/protected/hackathons/${hackathonId}/submissions`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                     // A temporary hack to parse the CSV for UI display
                    const Papa = (await import('papaparse')).default;
                    const parsed = Papa.parse(response.data.submissionsCsv, { header: true });
                    setSubmissions(parsed.data);
                } catch (error) {
                    console.error("Failed to fetch submissions", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSubmissions();
        }
    }, [token, hackathonId]);

    const handleExport = async () => {
        try {
            const response = await axios.get(`/api/protected/hackathons/${hackathonId}/submissions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            downloadCsv(response.data.submissionsCsv, `submissions-${hackathonId}.csv`);
        } catch (error) {
            console.error("Failed to export submissions", error);
        }
    };
    
    if (isLoading) return <p>Loading submissions...</p>;

    return (
        <main className="p-4 md:p-8">
            <Button variant="outline" onClick={() => router.push(`/dashboard/hackathon/${hackathonId}/edit`)} className="mb-4">
                &larr; Back to Management
            </Button>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-bold">Project Submissions</h1>
                <Button onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Export as CSV</Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Review Projects ({submissions.length})</CardTitle>
                    <CardDescription>Expand each project to see the full details provided by the team.</CardDescription>
                </CardHeader>
                <CardContent>
                     {submissions.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {submissions.map((sub: any, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-4">
                                            <span>{sub.project_title}</span>
                                            <Badge variant="outline">{sub.team_name}</Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4">
                                        <div><strong>About:</strong><p className="text-sm text-gray-600">{sub.about_project}</p></div>
                                        <div><strong>Problem Solved:</strong><p className="text-sm text-gray-600">{sub.problem_statement}</p></div>
                                        <div><strong>Tech Stack:</strong><p className="text-sm">{sub.tech_stack}</p></div>
                                        <div><strong>AI Score:</strong><p className="font-bold">{sub.ai_score}/100</p></div>
                                        <a href={sub.github_url} target="_blank" rel="noopener noreferrer"><Button variant="link">View on GitHub</Button></a>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : <p>No submissions found for this hackathon yet.</p>}
                </CardContent>
            </Card>
        </main>
    );
}