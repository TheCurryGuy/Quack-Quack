// apps/host-client/app/dashboard/my-hackathons/page.tsx
"use client";

import { useState } from "react";
import CreateHackathonForm from "@/components/dashboard/CreateHackathonForm";
import HackathonList from "@/components/HackathonList";

export default function MyHackathonsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleHackathonCreated = () => {
    // Increment the trigger to cause HackathonList to refetch
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">My Hackathons</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Create a new event or manage your existing ones below.
        </p>
      </div>
      
      {/* The component to create a new hackathon */}
      <CreateHackathonForm onSuccess={handleHackathonCreated} />

      {/* A divider for style */}
      <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>
      
      {/* The component that lists all existing hackathons */}
      <HackathonList key={refreshTrigger} />
    </div>
  );
}