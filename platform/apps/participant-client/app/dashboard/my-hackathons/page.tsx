// apps/participant-client/app/dashboard/my-hackathons/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import {HackathonCard, HackathonCardProps } from '@/components/HackathonCard';

type HackathonFromApi = Omit<HackathonCardProps, 'description' | 'href'> & { body: string };

export default function MyHackathonsPage() {
    const [hackathons, setHackathons] = useState<HackathonFromApi[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyHackathons = async () => {
            try {
                const response = await axios.get('/api/my-hackathons');
                setHackathons(response.data);
            } catch (error) {
                console.error("Failed to fetch user's hackathons", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyHackathons();
    }, []);

    return (
        <div>
            <h1 className="text-4xl font-bold mb-2">My Hackathons</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                All the events you've registered for, in one place.
            </p>

            {isLoading ? (
                <p>Loading your events...</p>
            ) : hackathons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hackathons.map((hackathon) => (
                        <HackathonCard
                            key={hackathon.id}
                            id={hackathon.id}
                            name={hackathon.name}
                            logoUrl={hackathon.logoUrl}
                            startDate={hackathon.startDate}
                            status={hackathon.status}
                            description={hackathon.body}
                            // This now links to our new authenticated dashboard page
                            href={`/dashboard/hackathon/${hackathon.id}`} 
                        />
                    ))}
                </div>
            ) : (
                <p>You haven't registered for any hackathons yet. Head over to the "Explore" page to find one!</p>
            )}
        </div>
    );
}