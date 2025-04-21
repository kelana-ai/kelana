"use server"

import { openai } from "@ai-sdk/openai"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { generateObject } from "ai"
import { z } from "zod"

const ItineraryInput = z.object({
  userId: z.string(),
  tripName: z.string(),
  destination: z.preprocess(
    (v) => (typeof v === "string" ? JSON.parse(v) : v),
    z.object({ name: z.string(), lat: z.number(), lng: z.number() }),
  ),
  homeLocation: z.preprocess(
    (v) => (typeof v === "string" ? JSON.parse(v) : v),
    z.object({ name: z.string().optional(), lat: z.number().optional(), lng: z.number().optional() }).optional(),
  ),
  dateRange: z.preprocess(
    (v) => (typeof v === "string" ? JSON.parse(v) : v),
    z.object({ from: z.string(), to: z.string() }),
  ),
  travelType: z.enum(["solo", "couple", "friends", "family"]),
  travelStyles: z.preprocess((v) => (typeof v === "string" ? JSON.parse(v) : v), z.array(z.string())),
  dietaryNeeds: z.preprocess((v) => (typeof v === "string" ? JSON.parse(v) : v), z.array(z.string())),
  budget: z.preprocess((v) => (typeof v === "string" ? Number.parseFloat(v) : v), z.number()),
})

const DaySchema = z.object({
  id: z.string(),
  date: z.string(),
  activities: z.array(
    z.object({
      id: z.string(),
      time: z.string(),
      title: z.string(),
      description: z.string(),
      type: z.enum([
        "transportation",
        "accommodation",
        "food",
        "drink",
        "sightseeing",
        "wellness",
        "logistics",
        "event",
        "other",
      ]),
      ecoTag: z.string(),
      cost: z.number(),
      currency: z.string(),
      location:
        z
          .object({
            name: z.string(),
            lat: z.number(),
            lng: z.number(),
          })
          .nullable(),
    }),
  ),
})

const ItinerarySchema = z.object({
  name: z.string(),
  destination: z.string(),
  date_from: z.string(),
  date_to: z.string(),
  days: z.array(DaySchema),
  budget: z.object({
    total: z.number(),
    spent: z.number(),
    remaining: z.number(),
  }),
  carbon: z.object({
    saved: z.number(),
    total: z.number(),
    percentage: z.number(),
  }),
})

export async function submitItinerary(formData: FormData) {
  try {
    const { userId, tripName, destination, homeLocation, dateRange, travelType, travelStyles, dietaryNeeds, budget } =
      ItineraryInput.parse(Object.fromEntries(formData.entries()))

    const { object } = await generateObject({
      model: openai.responses("gpt-4o"),
      providerOptions: {
        openai: { apiKey: process.env.OPENAI_API_KEY! },
      },
      schema: ItinerarySchema,
      prompt: `
        Create a **thorough, detailed, and eco-conscious travel itinerary** for a real-world trip. All content must be **accountable, verified, and deeply researched**. Your output must align with modern greener tourism principles.

        🎯 OVERVIEW:

        Trip Name: ${tripName}  
        Destination: ${destination.name} (Lat: ${destination.lat}, Lng: ${destination.lng})  
        ${homeLocation?.lat && homeLocation?.lng ? `Home Location: ${homeLocation.name || "Not specified"} (Lat: ${homeLocation.lat}, Lng: ${homeLocation.lng})` : "Home Location: Not specified"}  
        Dates: ${dateRange.from} → ${dateRange.to}  
        Travel Type: ${travelType}  
        Travel Styles: ${travelStyles.join(", ")}  
        Dietary Preferences: ${dietaryNeeds.length > 0 ? dietaryNeeds.join(", ") : "None specified"}  
        Budget: $${budget}

        🛠️ STRUCTURE & EXPECTATIONS:

        1. Create a greener itinerary that covers the **entire trip duration**, broken down **day by day**.
        2. Each **day** must include multiple **diverse activities** (minimum: transportation, dining, sightseeing, wellness, and one cultural or local engagement).
        3. Ensure that every activity is:
          - Based on a **real, verifiable location** (business, site, or attraction searchable on Google Maps).
          - Includes **precise lat/lng coordinates**.
          - Has a **fully fleshed-out, accurate description**, including:
            - What the activity involves
            - Why it's a good fit for eco-conscious travel
            - Any **specific sustainability certifications or practices** (e.g., solar power, zero-waste, carbon neutrality, organic sourcing)
        4. Every activity must have:
          - A **realistic cost** in USD
          - Properly labeled **activity type** and **ecoTag**
          - A **rational time estimate**

        ✅ ACTIVITY EXAMPLES (GOOD):

        - **"Alila Ubud (Bali, Indonesia)"**  
          EcoTag: accommodation  
          Description: Luxury resort that uses solar heating, composts food waste, sources ingredients locally, and has EarthCheck certification.  
          Coordinates: -8.4923, 115.2608  

        - **"Locavore Restaurant, Ubud"**  
          EcoTag: food  
          Description: Farm-to-table fine dining with a daily-changing menu focused on local organic produce. Minimal food waste via fermentation.  
          Coordinates: -8.5193, 115.2633  

        ❌ AVOID GENERIC ENTRIES like:  
        "Local market", "Eco-friendly hotel", "Greener cafe", or placeholders.

        🌱 SUSTAINABILITY EMPHASIS:

        - Choose **low-emission transport** (rail > bus > EV > flights)
        - Highlight **green-certified stays**, public transport tips, and walkable options
        - Recommend **locally owned, ethical businesses**
        - Favor **plant-based**, farm-to-table, or organic restaurants
        - Prioritize activities run by **local cooperatives or nonprofits**

        📊 METRICS & BREAKDOWN:

        - Provide a **realistic total trip cost** (USD), split by:
          - Accommodation, food, transport, experiences
        - Estimate **carbon footprint savings**:
          - Compare conventional vs eco choices
          - Show total saved CO2 (kg), total emitted, and % reduced

        ⚠️ MANDATORY QUALITY RULES:

        - Do **not hallucinate** data.
        - Only use **real, existing businesses/locations** with a web or map presence.
        - All details must be **verifiable by a human user** via online search.

        Output should be in the expected JSON structure, as defined in the provided schema. Only return the **eco-friendly version** of the itinerary. Prioritize **clarity, detail, and responsibility** in all entries.
        `,
    })

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: itRow, error: itErr } = await supabaseAdmin
      .from("itineraries")
      .insert({
        user_id: userId,
        name: object.name,
        description: `Eco-friendly itinerary to ${object.destination}`,
        status: "confirmed",
        destination_name: object.destination,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        date_from: object.date_from,
        date_to: object.date_to,
        travel_type: travelType,
        travel_styles: travelStyles,
        dietary_needs: dietaryNeeds,
        budget: {
          total: object.budget.total,
          spent: object.budget.spent,
          remaining: object.budget.remaining,
        },
        carbon_metrics: {
          saved: object.carbon.saved,
          total: object.carbon.total,
          percentage: object.carbon.percentage,
        },
      })
      .select("id")
      .single()

    if (itErr || !itRow) throw itErr || new Error("Failed to insert itinerary")
    const itineraryId = itRow.id

    for (let i = 0; i < object.days.length; i++) {
      const day = object.days[i]
      const { data: dRow, error: dErr } = await supabaseAdmin
        .from("itinerary_days")
        .insert({
          itinerary_id: itineraryId,
          day_index: i,
          date: day.date,
        })
        .select("id")
        .single()
      if (dErr || !dRow) throw dErr
      const dayId = dRow.id

      for (let j = 0; j < day.activities.length; j++) {
        const act = day.activities[j]
        const timeComponents = act.time.split(" - ")
        const startTime = timeComponents[0]
        const endTime = timeComponents.length > 1 ? timeComponents[1] : null

        const { error: aErr } = await supabaseAdmin.from("itinerary_activities").insert({
          day_id: dayId,
          activity_index: j,
          start_time: startTime,
          end_time: endTime,
          title: act.title,
          description: act.description,
          type: act.type,
          status: "planned",
          location_name: act.location?.name,
          location_lat: act.location?.lat,
          location_lng: act.location?.lng,
          cost: act.cost || 0,
          currency: act.currency || "USD",
          eco_tags: [act.ecoTag],
        })
        if (aErr) throw aErr
      }
    }

    if (homeLocation?.lat && homeLocation?.lng) {
      await supabaseAdmin
        .from("profiles")
        .update({
          home_lat: homeLocation.lat,
          home_lng: homeLocation.lng,
          preferences: {
            travelStyles: travelStyles,
          },
          dietary_needs: dietaryNeeds,
        })
        .eq("id", userId)
    }

    return {
      success: true,
      itineraryId: itineraryId,
    }
  } catch (error) {
    console.error("Error creating itinerary:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
