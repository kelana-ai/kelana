import { notFound } from "next/navigation"
import type { ReactElement } from "react"
import { getItinerary } from "@/lib/data/itineraries"
import { createClient } from "@/utils/supabase/server"
import ItineraryClient from "./itinerary-client"

export default async function ItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactElement> {
  const { id } = await params
  const supabase = await createClient()

  const itinerary = await getItinerary(supabase, id).catch((error) => {
    console.error("Supabase error fetching itinerary:", error)
    return null
  })
  if (!itinerary) return notFound()

  return <ItineraryClient itinerary={itinerary} />
}
