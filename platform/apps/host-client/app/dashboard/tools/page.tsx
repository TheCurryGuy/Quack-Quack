"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/app/context/AuthContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Zap, Users, Home } from "lucide-react"
import axios from "axios"

const downloadFile = (data: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(data)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function AiToolsPage() {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const model1FileRef = useRef<HTMLInputElement>(null)
  const model2FileRef = useRef<HTMLInputElement>(null)
  const roomsAvailableRef = useRef<HTMLInputElement>(null)
  const roomCapacityRef = useRef<HTMLInputElement>(null)
  const model3FileRef = useRef<HTMLInputElement>(null)
  const [hackathons, setHackathons] = useState<{ id: string; name: string }[]>([])
  const [selectedHackathon, setSelectedHackathon] = useState<string>("")

  useEffect(() => {
    const fetchHackathons = async () => {
      if (!token) return
      try {
        const response = await axios.get("/api/protected/hackathons", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setHackathons(response.data)
      } catch (error) {
        console.error("Failed to fetch hackathons for tool page", error)
      }
    }
    fetchHackathons()
  }, [token])

  const handleModel1Submit = async () => {
    const file = model1FileRef.current?.files?.[0]
    if (!file) {
      setError("Please select the individuals CSV file first.")
      return
    }
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post("/api/protected/tools/form-teams", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      })

      downloadFile(response.data, "formed-teams-by-id.csv")
      setSuccess("Teams formed successfully! Download started.")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate teams.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleModel2Submit = async () => {
    const file = model2FileRef.current?.files?.[0]
    if (!file || !selectedHackathon) {
      setError("Please select a hackathon and the formed teams CSV file.")
      return
    }
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("hackathonId", selectedHackathon)

    try {
      const response = await axios.post("/api/protected/tools/register-teams", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      setSuccess(response.data.message)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register teams.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleModel3Submit = async () => {
    const file = model3FileRef.current?.files?.[0]
    const roomsAvailable = roomsAvailableRef.current?.value
    const roomCapacity = roomCapacityRef.current?.value

    if (!file || !roomsAvailable || !roomCapacity) {
      setError("Please provide all room details and the approved teams CSV file.")
      return
    }
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("roomsAvailable", roomsAvailable)
    formData.append("roomCapacity", roomCapacity)

    try {
      const response = await axios.post("/api/protected/tools/allocate-rooms", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      })

      downloadFile(response.data, "room-allocations.csv")
      setSuccess("Room allocations generated successfully! Download started.")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate room allocations.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="p-6 md:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">AI Administrative Tools</h1>
        <p className="text-lg text-muted-foreground">
          Leverage AI to automate team formation, registration, and room allocation.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-secondary shrink-0" />
          <p className="text-sm text-secondary">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model 1: AI Team Formation */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1 flex-1">
                <CardTitle>Team Formation</CardTitle>
                <CardDescription className="text-xs">
                  Upload individuals CSV to generate optimized teams.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model1-file" className="text-sm">
                Individuals CSV File
              </Label>
              <Input
                id="model1-file"
                type="file"
                accept=".csv"
                ref={model1FileRef}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">Required: id, profileScore, eligibility</p>
            </div>
            <Button
              onClick={handleModel1Submit}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Processing..." : "Generate Teams"}
            </Button>
          </CardContent>
        </Card>

        {/* Model 2: Automatic Team Registration */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Zap className="h-5 w-5 text-secondary" />
              </div>
              <div className="space-y-1 flex-1">
                <CardTitle>Auto-Register Teams</CardTitle>
                <CardDescription className="text-xs">Register formed teams in the database.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Select Hackathon</Label>
              <Select onValueChange={setSelectedHackathon} value={selectedHackathon}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Choose a hackathon..." />
                </SelectTrigger>
                <SelectContent>
                  {hackathons.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model2-file" className="text-sm">
                Formed Teams CSV File
              </Label>
              <Input
                id="model2-file"
                type="file"
                accept=".csv"
                ref={model2FileRef}
                className="bg-input border-border"
              />
            </div>
            <Button
              onClick={handleModel2Submit}
              disabled={isLoading || !selectedHackathon}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              {isLoading ? "Registering..." : "Register Teams"}
            </Button>
          </CardContent>
        </Card>

        {/* Model 3: Room Allocation */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Home className="h-5 w-5 text-accent" />
              </div>
              <div className="space-y-1 flex-1">
                <CardTitle>Room Allocation</CardTitle>
                <CardDescription className="text-xs">Generate room allocation plan.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rooms-available" className="text-sm">
                Number of Rooms
              </Label>
              <Input
                id="rooms-available"
                type="number"
                placeholder="e.g., 10"
                ref={roomsAvailableRef}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-capacity" className="text-sm">
                Teams per Room
              </Label>
              <Input
                id="room-capacity"
                type="number"
                placeholder="e.g., 5"
                ref={roomCapacityRef}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model3-file" className="text-sm">
                Approved Teams CSV File
              </Label>
              <Input
                id="model3-file"
                type="file"
                accept=".csv"
                ref={model3FileRef}
                className="bg-input border-border"
              />
            </div>
            <Button
              onClick={handleModel3Submit}
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoading ? "Processing..." : "Generate Allocations"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
