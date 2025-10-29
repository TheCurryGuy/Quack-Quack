"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, CheckCircle2, XCircle } from "lucide-react"

interface StatusCardProps {
  status: "PENDING" | "APPROVED" | "REJECTED" | null
}

export default function StatusCard({ status }: StatusCardProps) {
  const statusConfig = {
    PENDING: {
      icon: <HelpCircle className="h-10 w-10 text-yellow-500" />,
      title: "Application Pending",
      description: "Your application is under review by the hackathon organizers. Check back soon for an update!",
      badge: <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>,
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    APPROVED: {
      icon: <CheckCircle2 className="h-10 w-10 text-green-500" />,
      title: "You're In!",
      description: "Congratulations! Your application has been approved. Get ready to build something amazing.",
      badge: <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>,
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    REJECTED: {
      icon: <XCircle className="h-10 w-10 text-red-500" />,
      title: "Application Update",
      description:
        "Unfortunately, we were unable to offer you a spot at this time. We encourage you to apply for future events!",
      badge: <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>,
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
  }

  if (!status) return null
  const config = statusConfig[status]

  return (
    <Card
      className={`border-l-4 ${status === "PENDING" ? "border-l-yellow-500" : status === "APPROVED" ? "border-l-green-500" : "border-l-red-500"}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center text-lg">
          <span>Your Status</span>
          {config.badge}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`rounded-lg p-4 ${config.bgColor} flex items-start gap-4`}>
          <div className="shrink-0 pt-1">{config.icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">{config.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{config.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
