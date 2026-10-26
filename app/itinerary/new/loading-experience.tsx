"use client"

import { useEffect } from "react"

import { ecoFacts } from "@/lib/eco-facts"
import { FactCard, LoadingHeading, LoadingOrb, loadingMessages, ProgressSection, RedirectNote, StatusMessage } from "./loading-visuals"
import { PlanSoFar } from "./loading-plan"
import type { PlanDay } from "./stream"
import { useLoadingProgress } from "./use-loading-progress"

interface LoadingExperienceProps {
  destination: string
  tripName: string
  days: PlanDay[]
}

export function LoadingExperience({ destination, tripName, days }: LoadingExperienceProps) {
  const { progress, messageIndex, factIndex } = useLoadingProgress(loadingMessages.length, ecoFacts.length)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [])

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-12">
      <LoadingHeading destination={destination} />
      <LoadingOrb />
      <ProgressSection tripName={tripName} progress={progress} />
      <StatusMessage index={messageIndex} />
      <PlanSoFar days={days} />
      <FactCard index={factIndex} />
      <RedirectNote />
    </div>
  )
}
