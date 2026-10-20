"use server"

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

    const { data, error } = await supabase.from("itineraries").delete().eq("id", itineraryId).select("id")

    if (error) throw error
    if (!data?.length) return { success: false, error: "Itinerary not found." }

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
