import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/AuthProvider"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HackVerse",
  description: "Join and compete in the next big hackathon.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <main className="min-h-screen bg-background">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
