// apps/participant-client/app/explore/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { HackathonCard, HackathonCardProps } from '@/components/HackathonCard';

type HackathonFromApi = Omit<HackathonCardProps, 'description' | 'href'> & { body: string };

export default function DashboardExplorePage() {
  const [hackathons, setHackathons] = useState<HackathonFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await axios.get('/api/hackathons');
        setHackathons(response.data);
      } catch (err) {
        setError('Could not fetch hackathons. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-2">Explore Hackathons</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Find your next challenge and build something extraordinary.
      </p>
      {isLoading && <p>Loading events...</p>}
      {error && <p className="text-destructive">{error}</p>}
      {!isLoading && !error && (
        hackathons.length > 0 ? (
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
                href={`/hackathon/${hackathon.id}`}
              />
            ))}
          </div>
        ) : (
          <p>No active hackathons at the moment. Check back soon!</p>
        )
      )}
    </div>
  );
}