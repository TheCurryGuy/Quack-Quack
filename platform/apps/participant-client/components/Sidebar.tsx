"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, ListChecks, User } from "lucide-react"

const navItems = [
  { name: "Explore", href: "/dashboard", icon: Compass },
  { name: "My Hackathons", href: "/dashboard/my-hackathons", icon: ListChecks },
  { name: "My Profile", href: "/dashboard/profile", icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 border-r bg-background h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold text-foreground">Dashboard</h2>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
                                ${
                                  isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
