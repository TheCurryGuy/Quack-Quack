import type React from "react"
import Sidebar from "@/components/Sidebar"
import Navbar from "@/components/Navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar/>
      <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 lg:p-10">{children}</div>
      </main>
      </div>
    </div>
  )
}
