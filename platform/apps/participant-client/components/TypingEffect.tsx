"use client"

import { useState, useEffect } from "react"

interface TypingEffectProps {
  text: string
  speed?: number
  className?: string
  deleteSpeed?: number
  pauseDuration?: number
}

export default function TypingEffect({ 
  text, 
  speed = 100, 
  className = "",
  deleteSpeed = 50,
  pauseDuration = 2000
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (!isDeleting && currentIndex < text.length) {
      // Typing forward
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (!isDeleting && currentIndex === text.length) {
      // Pause before deleting
      const timeout = setTimeout(() => {
        setIsDeleting(true)
      }, pauseDuration)

      return () => clearTimeout(timeout)
    } else if (isDeleting && currentIndex > 0) {
      // Deleting backward
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1))
        setCurrentIndex((prev) => prev - 1)
      }, deleteSpeed)

      return () => clearTimeout(timeout)
    } else if (isDeleting && currentIndex === 0) {
      // Reset to start typing again
      setIsDeleting(false)
    }
  }, [currentIndex, text, speed, isDeleting, deleteSpeed, pauseDuration])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <span className={className}>
      {displayedText}
      <span className={`inline-block w-0.5 h-[1em] ml-1 align-middle ${showCursor ? "bg-primary" : "bg-transparent"}`} />
    </span>
  )
}
