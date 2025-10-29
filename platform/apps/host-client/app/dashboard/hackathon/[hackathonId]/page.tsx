"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { useAuth } from "@/app/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, Mail, Edit, BarChart3, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

type HackathonDataType = {
  id: string
  name: string
  body: string
  teamSize: number
  startDate: string
  durationHours: number
  registrationDeadline: string
  supportEmail: string
  actualStartTime: string | null
  isRegistrationOpen: boolean
  status: "UPCOMING" | "LIVE" | "ENDED"
}

type HackathonStats = {
  totalRegistrations: number
  approvedTeams: number
  pendingApprovals: number
  submissions: number
}

export default function HackathonDetailPage() {
  const { token } = useAuth()
  const router = useRouter()
  const { hackathonId } = useParams()

  const [hackathonData, setHackathonData] = useState<HackathonDataType | null>(null)
  const [stats, setStats] = useState<HackathonStats>({
    totalRegistrations: 0,
    approvedTeams: 0,
    pendingApprovals: 0,
    submissions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHackathonData = async () => {
      if (!token || !hackathonId) return
      try {
        const [hackathonRes, statsRes] = await Promise.all([
          axios.get(`/api/protected/hackathons/${hackathonId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios
            .get(`/api/protected/hackathons/${hackathonId}/stats`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: { totalRegistrations: 0, approvedTeams: 0, pendingApprovals: 0, submissions: 0 } })),
        ])
        setHackathonData(hackathonRes.data)
        setStats(statsRes.data)
      } catch (err) {
        setError("Failed to load hackathon details. You may not have access.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchHackathonData()
  }, [token, hackathonId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "LIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "ENDED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "LIVE":
        return <CheckCircle className="h-4 w-4" />
      case "UPCOMING":
        return <Clock className="h-4 w-4" />
      case "ENDED":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isRegistrationClosed = new Date() > new Date(hackathonData?.registrationDeadline || "")
  const isHackathonStarted = hackathonData?.actualStartTime
    ? new Date() > new Date(hackathonData.actualStartTime)
    : false

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading hackathon details...</p>
      </div>
    )
  }

  if (error || !hackathonData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 dark:text-red-400">{error || "Hackathon not found"}</p>
      </div>
    )
  }

  return (
    <main className="p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{hackathonData.name}</h1>
            <Badge className={`${getStatusColor(hackathonData.status)} flex items-center gap-1`}>
              {getStatusIcon(hackathonData.status)}
              {hackathonData.status}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage and monitor your hackathon event</p>
        </div>
        <Link href={`/dashboard/hackathon/${hackathonId}/edit`}>
          <Button className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Event
          </Button>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Registrations</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRegistrations}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved Teams</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.approvedTeams}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingApprovals}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Submissions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.submissions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Start Date & Time</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDate(hackathonData.startDate)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Registration Deadline</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDate(hackathonData.registrationDeadline)}
                  </p>
                  {isRegistrationClosed && (
                    <p className="text-xs text-red-600 dark:text-red-400">Registration closed</p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {hackathonData.durationHours} hours
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Size</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {hackathonData.teamSize} participants
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Support Email
                  </p>
                  <a
                    href={`mailto:${hackathonData.supportEmail}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {hackathonData.supportEmail}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{hackathonData.body}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your hackathon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/dashboard/hackathon/${hackathonId}/edit`} className="block">
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  <span>Edit Details</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/dashboard/hackathon/${hackathonId}/submissions`} className="block">
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  <span>View Submissions</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/my-hackathons" className="block">
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  <span>Back to Hackathons</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Registration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registration Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <Badge variant={hackathonData.isRegistrationOpen ? "default" : "secondary"}>
                  {hackathonData.isRegistrationOpen ? "Open" : "Closed"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Event Status</span>
                <Badge className={getStatusColor(hackathonData.status)}>{hackathonData.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
