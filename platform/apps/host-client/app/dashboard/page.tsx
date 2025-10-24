// apps/host-client/app/dashboard/page.tsx
"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CreateHackathonForm from "@/components/dashboard/CreateHackathonForm";
import HackathonList from "@/components/HackathonList";

export default function DashboardPage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  // This is the same protection logic we had before.
  // It ensures unauthenticated users can't access this page.
  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  // While the auth state is being determined, show a loading indicator.
  if (isLoading || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  // Once authenticated, render the main dashboard content.
  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Create a new event or manage your existing ones.
        </p>
      </div>
      
      {/* The component to create a new hackathon */}
      <CreateHackathonForm />

      {/* A divider for style */}
      <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>
      
      {/* The component that lists all existing hackathons */}
      <HackathonList />
    </div>
  );
}