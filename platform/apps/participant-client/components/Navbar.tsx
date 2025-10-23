"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming you've added Shadcn Button

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="p-4 border-b">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">HackVerse</Link>
        <div>
          {status === "loading" ? (
            <div>Loading...</div>
          ) : session ? (
            <div className="flex items-center gap-4">
              <span>{session.user?.name}</span>
              <Button onClick={() => signOut()}>Sign Out</Button>
            </div>
          ) : (
            <Button onClick={() => signIn("github")}>Sign in with GitHub</Button>
          )}
        </div>
      </nav>
    </header>
  );
}