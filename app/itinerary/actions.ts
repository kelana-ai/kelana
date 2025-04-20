"use server"

import { createClient as createAdminClient, type User } from "@supabase/supabase-js"

export async function fetchItineraries(user: User) {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: itineraries, error } = await supabaseAdmin
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
      .eq("user_id", user?.id)
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

export async function deleteItinerary(itineraryId: string, userId: string) {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // First delete all related activities and days
    const { data: days, error: daysError } = await supabaseAdmin
      .from("itinerary_days")
      .select("id")
      .eq("itinerary_id", itineraryId)

    if (daysError) throw daysError

    if (days && days.length > 0) {
      const dayIds = days.map((day) => day.id)

      // Delete activities for these days
      const { error: activitiesError } = await supabaseAdmin.from("itinerary_activities").delete().in("day_id", dayIds)

      if (activitiesError) throw activitiesError

      // Delete the days
      const { error: deleteDaysError } = await supabaseAdmin
        .from("itinerary_days")
        .delete()
        .eq("itinerary_id", itineraryId)

      if (deleteDaysError) throw deleteDaysError
    }

    // Finally delete the itinerary
    const { error } = await supabaseAdmin.from("itineraries").delete().eq("id", itineraryId).eq("user_id", userId)

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
