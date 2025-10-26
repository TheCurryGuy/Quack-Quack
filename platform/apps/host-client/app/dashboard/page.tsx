// apps/host-client/app/dashboard/page.tsx
"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { List, Wrench } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  if (isLoading || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  // A proper overview dashboard
  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Welcome, Host!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Here's a quick overview of your administrative panel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/my-hackathons">
            <Card className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <List className="h-8 w-8 text-blue-500" />
                        <div>
                            <CardTitle>Manage My Hackathons</CardTitle>
                            <CardDescription>View, create, and edit your events. This is where you'll manage participant approvals.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </Link>
        <Link href="/dashboard/tools">
            <Card className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                 <CardHeader>
                    <div className="flex items-center gap-4">
                        <Wrench className="h-8 w-8 text-green-500" />
                        <div>
                            <CardTitle>Access AI Tools</CardTitle>
                            <CardDescription>Use powerful AI models for team formation and room allocation.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </Link>
      </div>
    </div>
  );
}