"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { LogOut } from "lucide-react"

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <svg
            viewBox="0 0 24 24"
            width={24}
            height={24}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={1} />
            <path d="M2 17L12 22L22 17" stroke="#FFFFFF" strokeWidth={1} />
            <path d="M2 12L12 17L22 12" stroke="#FFFFFF" strokeWidth={1} />
          </svg>
          <span className="font-bold text-2xl bg-linear-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            HACKVERSE
          </span>
        </Link>
        <div>
          {status === "loading" ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : session ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-foreground">{session.user?.name}</span>
                <span className="text-xs text-muted-foreground">{session.user?.email}</span>
              </div>
              <Button 
                onClick={() => signOut()} 
                variant="outline" 
                size="default" 
                className="gap-2 border-border/60 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors px-5 py-2.5 text-base font-medium"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => signIn("github")} 
              size="default"
              className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 text-base"
            >
              Sign in with GitHub
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
