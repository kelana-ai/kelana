import { notFound } from "next/navigation"
import type { ReactElement } from "react"
import { createClient } from "@/utils/supabase/server"
import ItineraryClient from "./itinerary-client"

export default async function ItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactElement> {
  const { id } = await params
  const supabase = await createClient()

  // RLS (itineraries_select / days_select / activities_select) restricts this to
  // the owner — a non-owner (or anonymous request) gets no row -> notFound().
  const { data: itn, error } = await supabase
    .from("itineraries")
    .select(
      `
      id, name, description, status,
      destination_name, destination_lat, destination_lng,
      date_from, date_to,
      travel_type, travel_styles, dietary_needs,
      budget, carbon_metrics,
      itinerary_days (
        id, day_index, date,
        itinerary_activities (
          id, activity_index, start_time, end_time, title, description,
          type, status, location_name, location_lat, location_lng, address,
          cost, currency, eco_tags
        )
      )
    `,
    )
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Supabase error fetching itinerary:", error)
    return notFound()
  }
  if (!itn) {
    return notFound()
  }

  return <ItineraryClient itinerary={itn} />
}
