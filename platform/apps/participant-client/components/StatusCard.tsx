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
      icon: <HelpCircle className="h-12 w-12 text-chart-2" />,
      title: "Application Pending",
      description: "Your application is under review by the hackathon organizers. Check back soon for an update!",
      badge: <Badge className="bg-chart-2/20 text-chart-2 hover:bg-chart-2/30 border-2 border-chart-2/40 text-sm font-semibold px-3 py-1">Pending</Badge>,
      bgColor: "bg-chart-2/10 border-2 border-chart-2/30",
      borderColor: "border-l-chart-2",
    },
    APPROVED: {
      icon: <CheckCircle2 className="h-12 w-12 text-chart-4" />,
      title: "You're In!",
      description: "Congratulations! Your application has been approved. Get ready to build something amazing.",
      badge: <Badge className="bg-chart-4/20 text-chart-4 hover:bg-chart-4/30 border-2 border-chart-4/40 text-sm font-semibold px-3 py-1">Approved</Badge>,
      bgColor: "bg-chart-4/10 border-2 border-chart-4/30",
      borderColor: "border-l-chart-4",
    },
    REJECTED: {
      icon: <XCircle className="h-12 w-12 text-destructive" />,
      title: "Application Update",
      description:
        "Unfortunately, we were unable to offer you a spot at this time. We encourage you to apply for future events!",
      badge: <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30 border-2 border-destructive/40 text-sm font-semibold px-3 py-1">Rejected</Badge>,
      bgColor: "bg-destructive/10 border-2 border-destructive/30",
      borderColor: "border-l-destructive",
    },
  }

  if (!status) return null
  const config = statusConfig[status]

  return (
    <Card
      className={`border-l-4 ${config.borderColor} bg-card/50 backdrop-blur-sm border-2`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center text-xl font-bold">
          <span>Your Status</span>
          {config.badge}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`rounded-xl p-5 ${config.bgColor} flex items-start gap-5`}>
          <div className="shrink-0 pt-1">{config.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 text-foreground">{config.title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed">{config.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
