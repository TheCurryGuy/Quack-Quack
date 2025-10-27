"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Mail } from "lucide-react"

export default function MyProfilePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">You must be logged in to view your profile.</p>
      </div>
    )
  }

  const { user } = session

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">My Profile</h1>
        <p className="text-lg text-muted-foreground">Your account details and settings.</p>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>This is the information linked to your GitHub account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-border">
              <AvatarImage src={user.image || ""} alt={user.name || "User Avatar"} />
              <AvatarFallback className="text-lg font-semibold">{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{user.name}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <p className="text-sm">{user.email}</p>
              </div>
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
        <CardContent className="space-y-4">
          <Button variant="destructive" disabled className="w-full">
            Delete Account (Functionality Pending)
          </Button>
          <p className="text-xs text-muted-foreground">
            Note: Deleting your account is permanent and will remove all your registration data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
