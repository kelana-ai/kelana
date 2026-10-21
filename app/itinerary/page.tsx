import { Suspense } from "react"

import { createClient } from "@/utils/supabase/server"
import type { Itinerary } from "@/lib/itinerary-filters"
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

  const { data, error } = await supabase
    .from("itineraries")
    .select(
      "id, name, description, status, destination_name, date_from, date_to, travel_type, budget, carbon_metrics, created_at, updated_at, user_id",
    )
    .order("created_at", { ascending: false })

  if (error) console.error("Error fetching itineraries:", error)

  const itineraries: Itinerary[] = (data ?? []).map((itn) => ({
    id: itn.id,
    name: itn.name,
    description: itn.description,
    destination: itn.destination_name,
    start_date: itn.date_from,
    end_date: itn.date_to,
    status: itn.status as Itinerary["status"],
    carbon_saved: itn.carbon_metrics?.saved || 0,
    carbon_percentage: itn.carbon_metrics?.percentage || 0,
    budget_total: itn.budget?.total || 0,
    travel_type: itn.travel_type,
    created_at: itn.created_at,
    updated_at: itn.updated_at || itn.created_at,
    user_id: itn.user_id,
  }))

  return <ItineraryList initialItineraries={itineraries} loadFailed={Boolean(error)} />
}
