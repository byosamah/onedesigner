'use client'

import { useEffect, useState } from 'react'

const messages = [
  "Analyzing your project requirements...",
  "Searching through 1000+ verified designers...",
  "Matching your style preferences...",
  "Evaluating portfolio compatibility...",
  "Checking designer availability...",
  "Calculating match scores...",
  "Finding your perfect creative partner..."
]

export function AnimatedLoadingMessages() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, 1500) // Change message every 1.5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-8 overflow-hidden">
      <div className="absolute inset-0">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`absolute w-full text-center text-gray-600 transition-all duration-300 ${
              index === currentIndex 
                ? 'translate-y-0 opacity-100' 
                : index === (currentIndex - 1 + messages.length) % messages.length
                ? '-translate-y-full opacity-0'
                : 'translate-y-full opacity-0'
            }`}
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  )
}