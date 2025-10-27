"use client"

import { useState } from "react"
import axios from "axios"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Download, AlertTriangle } from "lucide-react"

const downloadCsv = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export default function CloseRegistrationControl({
  hackathonId,
  isRegistrationOpen,
  onRegistrationClosed,
}: { hackathonId: string; isRegistrationOpen: boolean; onRegistrationClosed: () => void }) {
  const { token } = useAuth()
  const [isClosing, setIsClosing] = useState(false)

  const handleCloseRegistration = async () => {
    setIsClosing(true)
    try {
      const response = await axios.post(
        `/api/protected/hackathons/${hackathonId}/close-registration`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      const { teamsCsv, individualsCsv } = response.data

      downloadCsv(teamsCsv, `approved-teams-${hackathonId}.csv`)
      downloadCsv(individualsCsv, `approved-individuals-${hackathonId}.csv`)

      onRegistrationClosed()
    } catch (error: any) {
      console.error("Failed to close registration", error)
      alert(`Error: ${error.response?.data?.message || "Could not close registration."}`)
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <div className="flex justify-end">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant={isRegistrationOpen ? "destructive" : "outline"}
            disabled={!isRegistrationOpen || isClosing}
            className="gap-2"
          >
            <Download size={18} />
            {isClosing ? "Processing..." : isRegistrationOpen ? "Close Registration & Export" : "Registration Closed"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-destructive" size={24} />
              <AlertDialogTitle>Close Registration?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              This will permanently close registration for this event. You will receive two CSV files with approved
              teams and individuals. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseRegistration} className="bg-destructive hover:bg-destructive/90">
              Close Registration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
