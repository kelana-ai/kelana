"use client"

import { useEffect, useState } from "react"

import { nextIndex, nextProgress } from "./loading-progress"

export function useLoadingProgress(messageCount: number, factCount: number) {
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [factIndex, setFactIndex] = useState(0)

  useEffect(() => {
    const progressInterval = setInterval(() => setProgress(nextProgress), 300)
    const messageInterval = setInterval(() => setMessageIndex((prev) => nextIndex(prev, messageCount)), 3500)
    const factInterval = setInterval(() => setFactIndex((prev) => nextIndex(prev, factCount)), 8000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
      clearInterval(factInterval)
    }
  }, [messageCount, factCount])

  return { progress, messageIndex, factIndex }
}
