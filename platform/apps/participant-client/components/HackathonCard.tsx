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
        <Badge variant="secondary" className="bg-chart-3/20 text-chart-3 border-chart-3/30 font-semibold text-xs px-3 py-1">
          Upcoming
        </Badge>
      ),
      borderColor: "border-chart-3/40",
      glow: "hover:shadow-chart-3/20",
    },
    LIVE: {
      badge: <Badge className="bg-accent text-accent-foreground font-semibold shadow-sm text-xs px-3 py-1">Live Now</Badge>,
      borderColor: "border-accent/40",
      glow: "hover:shadow-accent/30",
    },
    ENDED: {
      badge: (
        <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30 font-semibold text-xs px-3 py-1">
          Ended
        </Badge>
      ),
      borderColor: "border-destructive/40",
      glow: "hover:shadow-destructive/20",
    },
  }[status]

  return (
    <Link href={href} className="block group">
      <Card
        className={`h-full transition-all duration-300 bg-card/50 backdrop-blur-sm border-2 ${statusConfig.borderColor} hover:border-primary/50 ${statusConfig.glow} hover:shadow-xl hover:scale-[1.02]`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-4 flex-1">
              <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-muted/50 border-2 border-border/50">
                <Image
                  src={logoUrl || "/placeholder.svg"}
                  alt={`${name} logo`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors truncate">
                  {name}
                </h3>
                <div className="mt-2">{statusConfig.badge}</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed">{shortDescription}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
