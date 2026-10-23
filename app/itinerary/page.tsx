import { Suspense } from "react"

import { listItineraries } from "@/lib/data/itineraries"
import { createClient } from "@/utils/supabase/server"
import { ItineraryList } from "./itinerary-list"
import { ItinerarySkeleton } from "./itinerary-skeleton"

export default function ItineraryPage() {
  return (
    <Suspense fallback={<ItinerarySkeleton />}>
      <ItineraryData />
    </Suspense>
  )
}

async function ItineraryData() {
  const supabase = await createClient()

  const itineraries = await listItineraries(supabase).catch((error) => {
    console.error("Error fetching itineraries:", error)
    return null
  })

  return <ItineraryList initialItineraries={itineraries ?? []} loadFailed={itineraries === null} />
}
