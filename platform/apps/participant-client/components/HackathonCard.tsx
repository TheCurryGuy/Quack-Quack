"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Calendar, ArrowRight } from "lucide-react"

export interface HackathonCardProps {
  id: string
  name: string
  description: string
  logoUrl: string
  startDate: string
  status: "UPCOMING" | "LIVE" | "ENDED"
  href: string
}

export function HackathonCard({ id, name, description, logoUrl, startDate, status, href }: HackathonCardProps) {
  const shortDescription = description.length > 100 ? `${description.substring(0, 100)}...` : description

  const statusConfig = {
    UPCOMING: {
      badge: (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
          Upcoming
        </Badge>
      ),
      color: "border-blue-200 dark:border-blue-800",
    },
    LIVE: {
      badge: <Badge className="bg-green-600 text-white dark:bg-green-700">Live Now</Badge>,
      color: "border-green-200 dark:border-green-800",
    },
    ENDED: {
      badge: (
        <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
          Ended
        </Badge>
      ),
      color: "border-red-200 dark:border-red-800",
    },
  }[status]

  return (
    <Link href={href} className="block group">
      <Card
        className={`h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 ${statusConfig.color}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={logoUrl || "/placeholder.svg"}
                  alt={`${name} logo`}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight text-foreground group-hover:text-primary transition-colors truncate">
                  {name}
                </h3>
                <div className="mt-2">{statusConfig.badge}</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{shortDescription}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
