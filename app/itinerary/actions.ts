"use server"

import { createClient } from "@/utils/supabase/server"

export async function fetchItineraries() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // RLS scopes the result to the authenticated user.
    const { data: itineraries, error } = await supabase
      .from("itineraries")
      .select(`
      id,
      name,
      description,
      status,
      destination_name,
      destination_lat,
      destination_lng,
      date_from,
      date_to,
      travel_type,
      travel_styles,
      dietary_needs,
      budget,
      carbon_metrics,
      created_at,
      updated_at,
      user_id
    `)
      .order("created_at", { ascending: false })

    if (error || !itineraries) throw error || new Error("Failed to fetch itineraries")

    return {
      success: true,
      itineraries: itineraries,
    }
  } catch (error) {
    console.error("Error fetching itineraries:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load itineraries",
    }
  }
}

export async function deleteItinerary(itineraryId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // ON DELETE CASCADE removes the related days and activities automatically.
    // RLS ensures only the owner can delete this itinerary.
    const { error } = await supabase.from("itineraries").delete().eq("id", itineraryId)

    if (error) throw error

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting itinerary:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete itinerary",
    }
  }
}
