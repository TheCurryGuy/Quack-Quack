// apps/participant-client/app/components/StatusCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

interface StatusCardProps {
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

export default function StatusCard({ status }: StatusCardProps) {
    const statusConfig = {
        PENDING: {
            icon: <HelpCircle className="h-8 w-8 text-yellow-500" />,
            title: "Application Pending",
            description: "Your application is under review by the hackathon organizers. Check back soon for an update!",
            badge: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
        },
        APPROVED: {
            icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
            title: "You're In!",
            description: "Congratulations! Your application has been approved. Get ready to build something amazing.",
            badge: <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>
        },
        REJECTED: {
            icon: <XCircle className="h-8 w-8 text-red-500" />,
            title: "Application Update",
            description: "Unfortunately, we were unable to offer you a spot at this time. We encourage you to apply for future events!",
            badge: <Badge variant="destructive">Rejected</Badge>
        },
    };

    if (!status) return null;
    const config = statusConfig[status];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Your Status</span>
                    {config.badge}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                {config.icon}
                <div>
                    <h3 className="font-semibold">{config.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{config.description}</p>
                </div>
            </CardContent>
        </Card>
    );
}