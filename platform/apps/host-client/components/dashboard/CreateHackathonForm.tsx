"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/app/context/AuthContext"
import type { PutBlobResult } from "@vercel/blob"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Upload } from "lucide-react"

interface CreateHackathonFormProps {
  onSuccess?: () => void
}

export default function CreateHackathonForm({ onSuccess }: CreateHackathonFormProps) {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    const logoFile = logoInputRef.current?.files?.[0]
    const bannerFile = bannerInputRef.current?.files?.[0]

    if (!logoFile || !bannerFile) {
      setError("Logo and Banner images are required.")
      setIsLoading(false)
      return
    }

    try {
      const [logoBlob, bannerBlob] = await Promise.all([
        fetch("/api/upload?filename=" + logoFile.name, {
          method: "POST",
          body: logoFile,
        }).then((res) => res.json() as Promise<PutBlobResult>),
        fetch("/api/upload?filename=" + bannerFile.name, {
          method: "POST",
          body: bannerFile,
        }).then((res) => res.json() as Promise<PutBlobResult>),
      ])

      const hackathonData = {
        name: formData.get("name") as string,
        body: formData.get("body") as string,
        teamSize: Number.parseInt(formData.get("teamSize") as string, 10),
        startDate: new Date(formData.get("startDate") as string).toISOString(),
        durationHours: Number.parseInt(formData.get("durationHours") as string, 10),
        registrationDeadline: new Date(formData.get("registrationDeadline") as string).toISOString(),
        supportEmail: formData.get("supportEmail") as string,
        logoUrl: logoBlob.url,
        bannerUrl: bannerBlob.url,
      }

      const response = await fetch("/api/protected/hackathons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(hackathonData),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Failed to create hackathon")
      }

      setSuccess("Hackathon created successfully!")
      ;(event.target as HTMLFormElement).reset()

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl">Create a New Hackathon</CardTitle>
        <CardDescription className="text-base">Fill in the details to launch your next event.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  Hackathon Name
                </Label>
                <Input id="name" name="name" placeholder="e.g., TechFest 2025" required className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail" className="text-sm font-semibold">
                  Support Email
                </Label>
                <Input
                  id="supportEmail"
                  name="supportEmail"
                  type="email"
                  placeholder="support@example.com"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSize" className="text-sm font-semibold">
                  Participants per Team
                </Label>
                <Input id="teamSize" name="teamSize" type="number" placeholder="4" required className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationHours" className="text-sm font-semibold">
                  Duration (hours)
                </Label>
                <Input
                  id="durationHours"
                  name="durationHours"
                  type="number"
                  placeholder="24"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold">
                  Start Date & Time
                </Label>
                <Input id="startDate" name="startDate" type="datetime-local" required className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationDeadline" className="text-sm font-semibold">
                  Registration Deadline
                </Label>
                <Input
                  id="registrationDeadline"
                  name="registrationDeadline"
                  type="datetime-local"
                  required
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-sm font-semibold flex items-center gap-2">
                  <Upload size={16} /> Logo Image
                </Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  ref={logoInputRef}
                  required
                  accept="image/*"
                  className="h-10 cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner" className="text-sm font-semibold flex items-center gap-2">
                  <Upload size={16} /> Banner Image
                </Label>
                <Input
                  id="banner"
                  name="banner"
                  type="file"
                  ref={bannerInputRef}
                  required
                  accept="image/*"
                  className="h-10 cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="body" className="text-sm font-semibold">
              Description (Markdown supported)
            </Label>
            <Textarea
              id="body"
              name="body"
              placeholder="Describe your hackathon, rules, prizes, and more..."
              required
              rows={8}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle size={18} className="text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
            {isLoading ? "Creating Hackathon..." : "Create Hackathon"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
