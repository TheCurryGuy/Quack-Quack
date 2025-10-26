// apps/participant-client/app/dashboard/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function MyProfilePage() {
    const { data: session, status } = useSession();

    // Show a loading state while the session is being fetched
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // This should ideally not happen if the page is protected, but it's a good fallback
    if (status === "unauthenticated" || !session?.user) {
        return <p>You must be logged in to view your profile.</p>;
    }

    const { user } = session;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">My Profile</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Your account details and settings.
                </p>
            </div>

            {/* Profile Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>This is the information linked to your GitHub account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.image || ''} alt={user.name || 'User Avatar'} />
                            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-2xl font-bold">{user.name}</p>
                            <p className="text-md text-gray-500">{user.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Actions Card */}
            <Card>
                 <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                    <CardDescription>Manage your account settings and data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" disabled>
                        Delete Account (Functionality Pending)
                    </Button>
                     <p className="text-xs text-gray-500 mt-2">
                        Note: Deleting your account is permanent and will remove all your registration data.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}