"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, List, Wrench, LogOut } from "lucide-react"
import { useAuth } from "@/app/context/AuthContext"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Hackathons", href: "/dashboard/my-hackathons", icon: List },
  { name: "AI Tools", href: "/dashboard/tools", icon: Wrench },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <aside className="w-64 shrink-0 border-r border-border/40 bg-card/50 backdrop-blur-sm h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-2 mb-1 hover:opacity-80 transition-opacity">
          <svg
            viewBox="0 0 24 24"
            width={20}
            height={20}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={1} />
            <path d="M2 17L12 22L22 17" stroke="#FFFFFF" strokeWidth={1} />
            <path d="M2 12L12 17L22 12" stroke="#FFFFFF" strokeWidth={1} />
          </svg>
          <h2 className="text-lg font-bold bg-linear-to-r from-primary via-primary to-accent bg-clip-text text-transparent">HACKVERSE</h2>
        </Link>
        <p className="text-xs text-muted-foreground ml-7">Admin Dashboard</p>
      </div>

      <nav className="flex flex-col gap-1 p-4 grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
                                ${
                                  isActive
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-card hover:text-foreground border border-transparent"
                                }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/40">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
