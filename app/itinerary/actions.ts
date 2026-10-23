"use server"

import { removeItinerary } from "@/lib/data/itineraries"
import { createClient } from "@/utils/supabase/server"

export async function deleteItinerary(itineraryId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    if (!(await removeItinerary(supabase, itineraryId))) return { success: false, error: "Itinerary not found." }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting itinerary:", error)
    return {
      success: false,
      error: "Failed to delete itinerary",
    }
  }
}
