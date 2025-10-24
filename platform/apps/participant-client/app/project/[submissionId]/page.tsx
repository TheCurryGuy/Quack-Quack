// apps/participant-client/app/project/[submissionId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function PublicProjectPage() {
    const { submissionId } = useParams();
    const [project, setProject] = useState<any>(null);

    useEffect(() => {
        if (submissionId) {
            axios.get(`/api/projects/${submissionId}`).then(res => setProject(res.data));
        }
    }, [submissionId]);

    if (!project) return <div>Loading Project...</div>;

    return (
        <div className="container mx-auto max-w-4xl p-8">
            <p className="text-center text-blue-600 font-semibold">{project.team.hackathon.name}</p>
            <h1 className="text-5xl font-extrabold text-center mt-2">{project.title}</h1>
            <p className="text-center text-xl text-gray-500 mt-2">by Team "{project.team.name}"</p>
            
            <div className="my-8 text-center">
                <p className="text-lg text-gray-600">AI-Evaluated Score</p>
                <p className="text-7xl font-bold">{project.aiScore}<span className="text-3xl text-gray-400">/100</span></p>
            </div>
            
            <div className="space-y-6 prose dark:prose-invert max-w-none">
                <h2>About This Project</h2>
                <p>{project.about}</p>
                <h2>Problem It Solves</h2>
                <p>{project.problem}</p>
                <h2>Technology Stack</h2>
                <div className="flex flex-wrap gap-2">
                    {project.techStacks.map((tech: string) => <Badge key={tech}>{tech}</Badge>)}
                </div>
            </div>
            <div className="text-center mt-12">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg">View on GitHub</Button>
                </a>
            </div>
        </div>
    );
}