'use client'

import { useState, useEffect } from 'react'

interface AnimatedEntryProps {
  children: React.ReactNode
  delay?: number
}

export function AnimatedEntry({ children, delay = 0 }: AnimatedEntryProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transform transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      {children}
    </div>
  )
}
