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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="rounded-lg border-2 border-border/60 bg-card/50 backdrop-blur-sm p-8 text-center">
        <p className="text-muted-foreground">You must be logged in to view your profile.</p>
      </div>
    )
  }

  const { user } = session

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-xl text-muted-foreground">Your account details and settings.</p>
      </div>

      {/* Profile Information Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile Information</CardTitle>
          <CardDescription className="text-base">This is the information linked to your GitHub account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-8">
            <Avatar className="h-28 w-28 border-4 border-primary/40 shadow-xl shadow-primary/20">
              <AvatarImage src={user.image || ""} alt={user.name || "User Avatar"} />
              <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-foreground">{user.name}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-5 w-5" />
                <p className="text-base">{user.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-2 border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Account Actions</CardTitle>
          <CardDescription className="text-base">Manage your account settings and data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button variant="destructive" disabled className="w-full opacity-50 cursor-not-allowed py-6 text-lg font-semibold">
            Delete Account (Functionality Pending)
          </Button>
          <p className="text-sm text-muted-foreground">
            Note: Deleting your account is permanent and will remove all your registration data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
