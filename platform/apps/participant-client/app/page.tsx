"use client"

import { LandPlotIcon, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import HeroImage from "@/components/landing/hero-image"
import FeatureVideo from "@/components/landing/feature-video"
import Navbar from "@/components/landing/navbar"
import InstallModal from "@/components/landing/install-modal"
import Footer from "@/components/landing/footer"
import FAQSection from "@/components/landing/faq-section"
import SaveReviewRestoreSection from "@/components/landing/save-review-restore-section"
import AgenticAISearchSection from "@/components/landing/agentic-ai-search-section"
import WhyNotGitSection from "@/components/landing/why-not-git-section"
import TestimonialsSection from "@/components/landing/testimonials-section"
import VibeCodingTweetsSection from "@/components/landing/vibe-coding-tweets-section"
import { useState } from "react"
import AnnouncementBanner from "@/components/landing/announcement-banner"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Direct Vercel Blob URLs for videos
const VIDEO_URLS = {
  savePreview:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/save-review-restore-g3BK0sricXTSPMzxK4iGrmXBUwPt11.mp4",
  crossIde: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cross-ides-PZyN9x34tNJsgQrbFkY3UUaatEaePh.mp4",
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBannerVisible, setIsBannerVisible] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  const handleSignIn = () => {
    signIn("github", { callbackUrl: "/dashboard" })
  }

  const openInstallModal = () => {
    setIsModalOpen(true)
  }


  if (status === "authenticated") {
    return null
  }

  return (
    <div
      className={`min-h-screen bg-black text-white font-geist transition-all duration-300 ${isBannerVisible ? "pt-[108px] sm:pt-28" : "pt-20"}`}
    >
      {/* Announcement Banner */}
      <AnnouncementBanner onVisibilityChange={setIsBannerVisible} />

      {/* Navigation */}
      <Navbar isBannerVisible={isBannerVisible} />

      {/* Rest of the content remains the same... */}
      <div className="max-w-[1920px] mx-auto relative px-6 mt-10 md:px-8">
        {/* Hero Section */}
        <section className="relative rounded-2xl rounded-all-devices mt-2 mb-6 md:h-[calc(100vh-144px)] font-geist text-white flex flex-col overflow-hidden">
          {/* Gradient Background Image */}
          <div className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl pointer-events-none">
            <div
              className="absolute inset-0 w-full h-full rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #22D3EE 0%, #FF5C28 50%, #FF5C9D 100%)",
              }}
            />
            <div
              className="absolute inset-0 w-full h-full rounded-2xl"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.35)",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative w-full px-4 sm:px-6 lg:px-8 text-center pt-[38px] sm:pt-[50px] pb-8 md:pt-[70px] md:pb-12 z-10 flex flex-col h-full overflow-hidden">
            {/* Mobile Layout (Stack: Text -> Image -> Buttons) */}
            <div className="flex flex-col md:hidden overflow-hidden">
              <div className="mb-4">
                <h1
                  className="font-semibold mb-2 overflow-visible select-text heading-with-selection"
                  style={{
                    fontSize: "clamp(36px, 8vw, 154px)",
                    lineHeight: "1.1",
                    letterSpacing: "clamp(-2px, -0.04em, -5.18998px)",
                    fontFamily: 'var(--font-geist-sans), "GeistSans Fallback", sans-serif',
                    height: "auto",
                    maxWidth: "100%",
                    paddingBottom: "0",
                    marginBottom: "0.2em",
                    color: "#FFFFFF",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                  aria-label="AI Version Control"
                >
                  AI Version
                  <br />
                  Control
                </h1>
                <p
                  className="mx-auto h-auto select-text mb-3"
                  style={{
                    fontFamily:
                      'GeistMono, ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
                    fontSize: "clamp(14px, 4vw, 22px)",
                    lineHeight: "1.3",
                    fontWeight: "400",
                    letterSpacing: "normal",
                    maxWidth: "2xl",
                    color: "#FFFFFF",
                    backgroundColor: "transparent",
                  } as React.CSSProperties & {
                    "--selection-text-color": string;
                    "--selection-background-color": string;
                  }}
                >
                  Undo AI mistakes instantly. Preview safely. Roll back with one click.
                </p>
              </div>

              {/* Image in the middle for mobile */}
              <div className="flex items-center justify-center mb-6 px-4">
                <div className="w-full max-w-full overflow-hidden rounded-2xl">
                  <HeroImage />
                </div>
              </div>

              <div>
                <div className="flex flex-col gap-3 sm:gap-4 mb-4">
                  {status === "loading" ? (
                    <p className="text-white/80">Loading...</p>
                  ) : (
                    <>
                      <Button
                        className="bg-white hover:bg-gray-100 flex items-center justify-center px-4 sm:px-6 w-full rounded-lg shadow-lg font-mono text-xs sm:text-sm md:text-base font-semibold tracking-wider text-black h-[50px] sm:h-[60px]"
                        onClick={handleSignIn}
                      >
                         GET STARTED WITH GITHUB
                      </Button>
                      <a
                        href="https://x.com/jackjack_eth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-black hover:bg-black/80 flex items-center justify-center px-4 sm:px-6 w-full rounded-lg shadow-lg font-mono text-xs sm:text-sm md:text-base font-semibold tracking-wider text-white h-[50px] sm:h-[60px] border border-white/10"
                      >
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        DM FOUNDER
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Layout (Original) */}
            <div className="hidden md:flex md:flex-col md:grow">
              <h1
                className="font-semibold mb-2 whitespace-nowrap overflow-visible select-text heading-with-selection"
                style={{
                  fontSize: "clamp(36px, 8vw, 154px)",
                  lineHeight: "1.1",
                  letterSpacing: "clamp(-2px, -0.04em, -5.18998px)",
                  fontFamily: 'var(--font-geist-sans), "GeistSans Fallback", sans-serif',
                  height: "auto",
                  maxWidth: "100%",
                  paddingBottom: "0",
                  marginBottom: "0.2em",
                  color: "#FFFFFF",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}
                aria-label="AI Version Control"
              >
                Code Your Reality
              </h1>
              <p
                className="mb-6 sm:mb-8 mx-auto h-auto select-text"
                style={{
                  fontFamily:
                    'GeistMono, ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
                  fontSize: "clamp(16px, 4vw, 24px)",
                  lineHeight: "1.3",
                  fontWeight: "400",
                  letterSpacing: "normal",
                  maxWidth: "2xl",
                  color: "#FFFFFF",
                  backgroundColor: "transparent",
                } as React.CSSProperties & {
                  "--selection-text-color": string;
                  "--selection-background-color": string;
                }}
              >
              
                Host, Join, Collaborate, and Innovate — All in One Platform
              </p>
              <div className="flex flex-row justify-center gap-3 md:gap-4 mb-8">
                {status === "loading" ? (
                  <p className="text-white/80">Loading...</p>
                ) : (
                  <>
                    <Button
                      className="bg-white hover:bg-gray-100 flex items-center justify-center px-4 md:px-6 lg:px-8 rounded-lg shadow-lg font-mono text-sm md:text-base font-semibold tracking-wider text-black h-[50px] md:h-[60px] min-w-[180px] md:min-w-[220px]"
                      onClick={() => window.location.href = 'http://localhost:3000/login'}
                    >
                      <LandPlotIcon className="mr-2 h-4 w-4" /> LAUNCH HACKATHON
                    </Button>
                    <Button
                      className="bg-black hover:bg-black/80 flex items-center justify-center px-4 md:px-6 lg:px-8 rounded-lg shadow-lg font-mono text-sm md:text-base font-semibold tracking-wider text-white h-[50px] md:h-[60px] min-w-[180px] md:min-w-[220px] border border-white/10"
                      onClick={handleSignIn}
                    >
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      JOIN HACKATHON
                    </Button>
                  </>
                )}
              </div>
              <div className="relative w-full grow flex items-center justify-center rounded-2xl overflow-hidden">
                <div className="w-full sm:w-[85%] md:max-w-[1200px] mx-auto overflow-hidden rounded-2xl">
                  <HeroImage />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rest of sections remain the same... */}
        <section className="pb-12 md:pb-16 bg-black mt-[60px] md:mt-28">
          <div className="container mx-auto px-4 text-center">
            <p
              className="uppercase mb-6 md:mb-8 tracking-widest font-serif"
              style={{
                fontFamily:
                  'GeistMono, ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
                fontSize: "14px",
                lineHeight: "18px",
                fontWeight: "400",
                letterSpacing: "0.5px",
                color: "#999999",
              }}
            >
              Tools Used to Build Hackverse
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-y-8 sm:gap-y-12 gap-x-6 md:gap-x-8 mb-8 md:mb-12 max-w-6xl mx-auto">
              <CompanyName name="Next JS" />
              <CompanyName name="ShadCn" />
              <CompanyName name="TailwindCSS" />
              <CompanyName name="Prisma" />
              <CompanyName name="PostgreSQL" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-y-8 sm:gap-y-12 gap-x-6 md:gap-x-8 max-w-6xl mx-auto">
              <CompanyName name="AWS" />
              <CompanyName name="TypeScript" />
              <CompanyName name="Python" />
              <CompanyName name="FastAPI" />
              <CompanyName name="Docker" />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center mb-12">
            <h2
              className="mb-4 font-semibold"
              style={{
                backgroundImage: "linear-gradient(rgb(245, 245, 245), rgb(245, 245, 245) 29%, rgb(153, 153, 153))",
                color: "transparent",
                fontFamily: "GeistSans, sans-serif",
                fontSize: "clamp(32px, 6vw, 52px)",
                fontWeight: 600,
                letterSpacing: "clamp(-1.5px, -0.04em, -2.08px)",
                lineHeight: "1.15",
                textAlign: "center",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              A Community Of 5,000+ Devs
            </h2>
            <p
              className="max-w-3xl mx-auto text-white/80"
              style={{
                fontFamily: "GeistMono, monospace",
                fontSize: "clamp(16px, 3vw, 22px)",
                lineHeight: "1.4",
                textAlign: "center",
              }}
            >
              Connecting talent from local campuses to major tech hubs for world-class competitions.
            </p>
          </div>

          <div className="space-y-8 overflow-hidden">
            <div className="relative">
              <div className="flex animate-scroll-left whitespace-nowrap">
                <div className="flex">
                  {[
                    "Bengaluru",
                    "Hyderabad",
                    "Pune",
                    "Chennai",
                    "Gurugram",
                    "Noida",
                    "Mumbai",
                    "Delhi",
                    "Kochi",
                    "Ahmedabad",
                    "Jaipur",
                    "Indore",
                    "Chandigarh",
                    "Kolkata",
                    "Trivandrum",
                    "Nagpur",
                    "Surat",
                    "Coimbatore",
                    "Bhubaneswar",
                    "Mysuru",
                  ]
                    .concat([
                      "Bengaluru",
                      "Hyderabad",
                      "Pune",
                      "Chennai",
                      "Gurugram",
                      "Noida",
                      "Mumbai",
                      "Delhi",
                      "Kochi",
                      "Ahmedabad",
                      "Jaipur",
                      "Indore",
                      "Chandigarh",
                      "Kolkata",
                      "Trivandrum",
                      "Nagpur",
                      "Surat",
                      "Coimbatore",
                      "Bhubaneswar",
                      "Mysuru",
                    ])
                    .map((city, index) => (
                      <span
                        key={index}
                        style={{
                          fontFamily: 'GeistSans, "GeistSans Fallback", sans-serif',
                          fontSize: "20px",
                          lineHeight: "28px",
                          fontWeight: "700",
                          letterSpacing: "normal",
                          color: "#999999",
                          whiteSpace: "nowrap",
                          padding: "0 1rem",
                        }}
                      >
                        {city}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex animate-scroll-right whitespace-nowrap">
                <div className="flex">
                  {[
                    "Bengaluru",
                    "Hyderabad",
                    "Pune",
                    "Chennai",
                    "Gurugram",
                    "Noida",
                    "Mumbai",
                    "Delhi",
                    "Kolkata",
                    "Ahmedabad",
                    "Jaipur",
                    "Indore",
                    "Kochi",
                    "Trivandrum",
                    "Coimbatore",
                    "Nagpur",
                    "Surat",
                    "Bhubaneswar",
                    "Chandigarh",
                    "Mysuru",
                    "Visakhapatnam",
                    "Lucknow",
                    "Vadodara",
                    "Rajkot",
                    "Patna",
                    "Ludhiana",
                    "Dehradun",
                    "Guwahati",
                    "Madurai",
                    "Vijayawada",
                  ]
                    .concat([
                      "Bengaluru",
                      "Hyderabad",
                      "Pune",
                      "Chennai",
                      "Gurugram",
                      "Noida",
                      "Mumbai",
                      "Delhi",
                      "Kolkata",
                      "Ahmedabad",
                      "Jaipur",
                      "Indore",
                      "Kochi",
                      "Trivandrum",
                      "Coimbatore",
                      "Nagpur",
                      "Surat",
                      "Bhubaneswar",
                      "Chandigarh",
                      "Mysuru",
                      "Visakhapatnam",
                      "Lucknow",
                      "Vadodara",
                      "Rajkot",
                      "Patna",
                      "Ludhiana",
                      "Dehradun",
                      "Guwahati",
                      "Madurai",
                      "Vijayawada",
                    ])
                    .map((city, index) => (
                      <span
                        key={index}
                        style={{
                          fontFamily: 'GeistSans, "GeistSans Fallback", sans-serif',
                          fontSize: "20px",
                          lineHeight: "28px",
                          fontWeight: "700",
                          letterSpacing: "normal",
                          color: "#999999",
                          whiteSpace: "nowrap",
                          padding: "0 1rem",
                        }}
                      >
                        {city}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <SaveReviewRestoreSection onOpenInstall={openInstallModal} />
        <AgenticAISearchSection onOpenInstall={openInstallModal} />
        <FeatureVideoSection
          title="The Verse Warden"
          description="Guarantees a level playing field where winning ideas are the result of genuine skill, not shortcuts."
          videoSrc="/videos/cross-ides.mp4"
          fallbackVideoSrc={VIDEO_URLS.crossIde}
          gradientClass="gradient-yellow-red-diagonal"
        />
        <WhyNotGitSection onOpenInstall={openInstallModal} />
        <VibeCodingTweetsSection onOpenInstall={openInstallModal} />
        <TestimonialsSection />
        <FAQSection onOpenInstall={openInstallModal} />
        <Footer />
      </div>

      <InstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

function CompanyName({
  name,
  noWrapDesktop = false,
  className = "",
}: { name: string; noWrapDesktop?: boolean; className?: string }) {
  return (
    <div className={`flex justify-center items-center h-10 px-2 ${className}`}>
      <span
        className={`text-[#999999] text-center ${noWrapDesktop ? "md:whitespace-nowrap" : ""}`}
        style={{
          fontFamily: 'GeistSans, "GeistSans Fallback", sans-serif',
          fontSize: "20px",
          lineHeight: "28px",
          fontWeight: "700",
          letterSpacing: "normal",
        }}
      >
        {name}
      </span>
    </div>
  )
}

function FeatureVideoSection({
  title,
  description,
  videoSrc,
  fallbackVideoSrc,
  gradientClass,
}: {
  title: string
  description: string
  videoSrc: string
  fallbackVideoSrc?: string
  gradientClass: string
}) {
  return (
    <div className="my-24">
      <div className="text-center mb-6 md:mb-12 px-4">
        <h2
          className="mb-4 font-semibold"
          style={{
            backgroundImage: "linear-gradient(rgb(245, 245, 245), rgb(245, 245, 245) 29%, rgb(153, 153, 153))",
            color: "transparent",
            fontFamily: "GeistSans, sans-serif",
            fontSize: "clamp(32px, 6vw, 52px)",
            fontWeight: 600,
            letterSpacing: "clamp(-1.5px, -0.04em, -2.08px)",
            lineHeight: "1.15",
            textAlign: "center",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          {title}
        </h2>
        <p
          className="max-w-2xl mx-auto"
          style={{
            color: "#f5f5f5",
            fontFamily: "GeistMono, monospace",
            fontSize: "clamp(16px, 3vw, 22px)",
            lineHeight: "1.3",
            textAlign: "center",
          }}
        >
          {description}
        </p>
      </div>

      <div className="flex justify-center">
        <div className={`gradient-container ${gradientClass} max-w-[1296px] w-full`}>
          <div className="absolute inset-0 bg-black/35 rounded-2xl pointer-events-none"></div>
          <div className="noise-texture"></div>
          <div className="relative z-10 pt-4 sm:pt-12 md:pt-16 pb-0 px-4 sm:px-6 md:px-12">
            <div className="rounded-t-lg overflow-hidden shadow-2xl max-w-4xl mx-auto border border-white/10 border-b-0">
              <FeatureVideo src={videoSrc} alt={title} fallbackSrc={fallbackVideoSrc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
