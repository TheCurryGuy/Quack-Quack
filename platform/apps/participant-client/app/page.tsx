"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import TypingEffect from "@/components/TypingEffect"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "authenticated") {
    return null
  }

  const handleSignIn = () => {
    signIn("github", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,oklch(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-tight">
            <span className="text-foreground">The </span>
            <span className="bg-linear-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Ultimate
            </span>
            <span className="text-foreground"> Arena</span>
            <br />
            <TypingEffect 
              text="for Developers" 
              speed={80}
              className="text-foreground"
            />
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Discover, compete, and showcase your skills in the world's most exciting hackathons. Your next big project
            starts here.
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          {status === "loading" ? (
            <p className="text-muted-foreground">Loading session...</p>
          ) : (
            <Button 
              onClick={handleSignIn} 
              size="lg" 
              className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
            >
              Get Started with GitHub
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Floating Shapes Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Gradient Blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-1/4 left-1/4 w-20 h-20 border-2 border-primary/20 rounded-lg rotate-12 animate-float" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 border-2 border-accent/20 rounded-full animate-float-delayed" />
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 border-2 border-primary/15 rotate-45 animate-float" style={{animationDelay: '0.5s'}} />
        <div className="absolute top-2/3 right-1/3 w-12 h-12 bg-primary/10 rounded animate-float-delayed" style={{animationDelay: '1.5s'}} />
        <div className="absolute bottom-1/3 right-1/4 w-14 h-14 border-2 border-accent/15 rounded-lg rotate-45 animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 left-1/6 w-10 h-10 bg-accent/10 rounded-full animate-float-delayed" style={{animationDelay: '0.8s'}} />
        <div className="absolute bottom-1/2 right-1/6 w-18 h-18 border-2 border-primary/20 rounded-full animate-float" style={{animationDelay: '1.2s'}} />
      </div>
    </div>
  )
}
