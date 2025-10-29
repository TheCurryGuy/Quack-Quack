"use client"

import { useState } from "react"
import CreateHackathonForm from "@/components/dashboard/CreateHackathonForm"
import HackathonList from "@/components/HackathonList"

export default function MyHackathonsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleHackathonCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">My Hackathons</h1>
        <p className="text-lg text-muted-foreground">Create new events or manage your existing hackathons.</p>
      </div>

      <CreateHackathonForm onSuccess={handleHackathonCreated} />

      <div className="border-t border-border"></div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Events</h2>
        <HackathonList key={refreshTrigger} />
      </div>
    </div>
  )
}
