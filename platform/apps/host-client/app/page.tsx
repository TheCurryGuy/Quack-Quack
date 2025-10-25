// apps/host-client/app/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function HostRootPage() {
    const { token, isLoading } = useAuth();
    const router = useRouter();

    // This effect handles the core logic.
    // It runs when the authentication status is determined.
    useEffect(() => {
        // If loading is finished and we have a token, the user is logged in.
        // Redirect them straight to the dashboard.
        if (!isLoading && token) {
            router.push('/dashboard');
        }
    }, [isLoading, token, router]);

    // While we're checking for a session, show a loading spinner.
    // This prevents a "flash" of the login prompt for an already authenticated user.
    if (isLoading || token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="mt-4 text-lg">Loading your session...</p>
            </div>
        );
    }

    // If loading is finished and there's no token, we know the user is logged out.
    // Show them the welcome/login prompt.
    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md mx-4 text-center">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Host Administration Panel</CardTitle>
                    <CardDescription className="pt-2">
                        Welcome. Please sign in to manage your hackathons.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        size="lg" 
                        className="w-full" 
                        onClick={() => router.push('/login')}
                    >
                        Go to Login Page
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}