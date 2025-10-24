// apps/participant-client/app/page.tsx
"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.push('/dashboard'); // <-- UPDATED
    return null; 
  }

  const handleSignIn = () => {
    signIn('github', { callbackUrl: '/dashboard' }); // <-- UPDATED
  };


  return (
    <div className="container mx-auto flex flex-col items-center justify-center text-center p-8" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
        The Ultimate Arena for Developers
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
        Discover, compete, and showcase your skills in the world's most exciting hackathons. Your next big project starts here.
      </p>
      
      {status === "loading" ? (
        <p>Loading session...</p>
      ) : (
        <Button onClick={handleSignIn} size="lg">
          Get Started with GitHub
        </Button>
      )}
    </div>
  );
}