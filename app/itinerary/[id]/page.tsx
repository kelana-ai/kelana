import { createClient as createAdminClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import type { ReactElement } from "react"
import ItineraryClient from "./itinerary-client"

export const revalidate = 60

export default async function ItineraryPage({
  params,
}: {
  params: { id: string }
}): Promise<ReactElement> {
  const { id } = await params
  const supabase = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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
          type, status, location_name, location_lat, location_lng,
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
