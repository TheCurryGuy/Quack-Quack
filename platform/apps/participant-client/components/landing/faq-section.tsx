"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

const faqs = [
  {
    question: "I already use other tools. Why would I need this?",
    answer: (
      <>
        HackVerse combines event management, AI-powered team formation, and intelligent project scoring in one platform.
        <br />
        <br />
        Unlike scattered tools, HackVerse gives you a unified dashboard for everything — from participant vetting to
        winner announcement.
      </>
    ),
  },
  {
    question: "Is it free?",
    answer: (
      <>
        Yes — HackVerse offers a free tier for small to medium hackathons.
        <br />
        <br />
        Premium plans with advanced features coming soon.
      </>
    ),
  },
  {
    question: "Will it mess up existing projects or Git repos?",
    answer: (
      <>
        Not at all.
        <br />
        <br />
        HackVerse integrates seamlessly with GitHub and doesn't modify your repositories.
        <br />
        <br />
        Your projects stay exactly as they are — we just help you manage and evaluate them.
      </>
    ),
  },
  {
    question: "Where is my event history stored?",
    answer: (
      <>
        Your event data is securely stored in our encrypted cloud database with full compliance to data protection
        standards.
        <br />
        <br />
        You have complete access and can export your data anytime.
      </>
    ),
  },
  {
    question: "How does the AI ensure fair team formation and scoring?",
    answer: (
      <>
        Our AI analyzes participant skills, experience levels, and tech stack preferences to form balanced teams.
        <br />
        <br />
        Project scoring is based on objective metrics — tech complexity, innovation, and execution — ensuring every
        brilliant project gets recognized.
      </>
    ),
  },
  {
    question: "Does it support hybrid and virtual hackathons?",
    answer: (
      <>
        Absolutely.
        <br />
        <br />
        HackVerse works seamlessly for in-person, virtual, and hybrid events with real-time collaboration features and
        remote participant support.
      </>
    ),
  },
]

interface FAQSectionProps {
  onOpenInstall?: () => void
}

export default function FAQSection({ onOpenInstall }: FAQSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2
          className="text-center mb-12 md:mb-16 font-semibold"
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
          Frequently Asked (and Silently Wondered) Questions
        </h2>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-white/10 rounded-lg bg-white/5 overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <span
                  className="text-left font-medium text-white"
                  style={{
                    fontFamily: 'var(--font-geist-sans), "GeistSans", sans-serif',
                    fontSize: "18px",
                  }}
                >
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 pt-0">
                <p
                  className="text-white/80"
                  style={{
                    fontFamily:
                      'GeistMono, ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
                    fontSize: "15px",
                    lineHeight: "1.5",
                  }}
                >
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Call to action */}
        <div className="mt-12 md:mt-16 text-center">
          <p
            className="text-white/80 mb-6"
            style={{
              fontFamily:
                'GeistMono, ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
              fontSize: "16px",
              lineHeight: "1.5",
            }}
          >
            HackVerse: Where Innovation is Found and Talent is Hired
          </p>

          {onOpenInstall && (
            <Button
              onClick={onOpenInstall}
              className="bg-white hover:bg-gray-100 text-black font-mono text-sm font-semibold tracking-wider py-3 px-6 rounded-lg"
              style={{
                fontFamily:
                  'GeistMono, ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
                letterSpacing: "0.56px",
                height: "48px",
              }}
            >
              <Download className="mr-2 h-4 w-4 stroke-[2.5px]" />
              JOIN THE DEVS
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
