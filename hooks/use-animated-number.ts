"use client"

import { useState, useEffect, useRef } from "react"

interface UseAnimatedNumberOptions {
  duration?: number
  decimals?: number
}

export function useAnimatedNumber(targetValue: number, options: UseAnimatedNumberOptions = {}) {
  const { duration = 1000, decimals = 2 } = options
  const [displayValue, setDisplayValue] = useState(targetValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const startValueRef = useRef<number>(targetValue)

  useEffect(() => {
    if (targetValue === displayValue) return

    setIsAnimating(true)
    startValueRef.current = displayValue
    startTimeRef.current = Date.now()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - (startTimeRef.current || now)
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const currentValue = startValueRef.current + (targetValue - startValueRef.current) * easeOut

      setDisplayValue(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(targetValue)
        setIsAnimating(false)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetValue, duration])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return {
    displayValue: Number(displayValue.toFixed(decimals)),
    isAnimating,
  }
}
