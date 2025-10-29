"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Navbar() {
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
          <Button 
            onClick={() => window.location.href = '/login'} 
            size="default"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 text-base"
          >
            Admin Dashboard
          </Button>
        </div>
      </nav>
    </header>
  )
}
