"use server"

import { openai } from "@ai-sdk/openai"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { generateObject } from "ai"
import { differenceInCalendarDays, format, parseISO } from "date-fns"
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
  travelType: z.enum(["solo", "partners", "groups", "family", "business", "digital-nomad", "pet-friendly"]),
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
      start_time: z.string(),
      end_time: z.string(),
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
            address: z.string(),
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
  icon: z.string(),
  sourceUrl: z.string(),
})

export async function submitItinerary(formData: FormData) {
  try {
    const { userId, tripName, destination, homeLocation, dateRange, travelType, travelStyles, dietaryNeeds, budget } =
      ItineraryInput.parse(Object.fromEntries(formData.entries()))

    const from = parseISO(dateRange.from)
    const to   = parseISO(dateRange.to)

    const formattedFrom = format(from, "MMM d, yyyy")
    const formattedTo   = format(to,   "MMM d, yyyy")
    const daysCount     = differenceInCalendarDays(to, from) + 1

    const dateLine = `${formattedFrom} - ${formattedTo} (${daysCount} days)`

    const { object } = await generateObject({
      model: openai.responses("gpt-4o"),
      providerOptions: {
        openai: { apiKey: process.env.OPENAI_API_KEY! },
      },
      schema: ItinerarySchema,
      prompt: `
        You are an expert travel planner. Develop a **comprehensive, eco-conscious travel itinerary** for a real-world trip, ensuring all details are **accurate, verifiable, and well-researched**. Adhere strictly to the following JSON schema:

        - **Itinerary**: name, destination, date_from, date_to, icon, budget, carbon
        - **Day**: id, date, activities[]
        - **Activity**: id, start_time, end_time, title, description, type, ecoTag, cost (USD), currency, location { name, lat, lng, address }, sourceUrl

        **Overview:**

        - **Trip Name**: ${tripName}
        - **Destination**: ${destination.name} (Lat: ${destination.lat}, Lng: ${destination.lng})
        - **Home Location**: ${homeLocation?.lat && homeLocation?.lng ? `${homeLocation.name || "Not specified"} (Lat: ${homeLocation.lat}, Lng: ${homeLocation.lng})` : "Not specified"}
        - **Dates**: ${dateLine}
        - **Travel Type**: ${travelType}
        - **Travel Styles**: ${travelStyles.join(", ")}
        - **Dietary Preferences**: ${dietaryNeeds.length > 0 ? dietaryNeeds.join(", ") : "None"}
        - **Budget**: $${budget}

        **Structure & Expectations:**

        1. **Daily Breakdown**: Cover the entire trip duration, detailing each day.
        2. **Daily Activities**: Include at least one activity from each category: transportation, dining, sightseeing, and wellness or cultural/local engagement.
        3. **Activity Details**:
          - Use real, verifiable locations with accurate 'lat', 'lng', full address, and a valid 'sourceUrl' (Google Maps link or official webpage).
          - Provide a 3-5 sentence description covering:
            1. What the activity involves.
            2. Why it's eco-friendly (e.g., solar panels, zero-waste, carbon-neutral certification).
            3. Concrete facts (e.g., opening hours, year founded, awards or certifications).
          - Specify a realistic cost (USD per person).
          - Label 'type', 'ecoTag', 'start_time', and 'end_time' appropriately.
        4. **Verification**: Exclude any activity that cannot be verified with a real 'sourceUrl'.

        **Sustainability Emphasis:**

        - Prioritize transportation methods in the following order: rail > bus > EV > flights.
        - Highlight green-certified accommodations, public transport, and walkable routes.
        - Recommend locally owned, ethical businesses.
        - Favor plant-based, farm-to-table, or organic menus.
        - Emphasize cooperatives or nonprofit-run activities.

        **Metrics & Breakdown:**

        - **Total Trip Cost** (USD), itemized by:
          - Accommodation
          - Food
          - Transport
          - Experiences
        - **Carbon Footprint**:
          - Total emitted (kg)
          - Total saved (kg)
          - Percentage reduced

        **Mandatory Quality Rules:**

        - Avoid fabrications; ensure every detail is verifiable.
        - Use only real, existing locations with a web or map presence.
        - Omit any activity lacking a valid 'sourceUrl'.

        **Final Icon:**

        After generating the itinerary JSON, select one icon name from the following list and include it as the top-level 'icon' property:

        ["adventure", "africa", "alaska", "backpacking", "bali", "business", "canada", "city", "costa-rica", "countryside", "culture", "family", "festival", "global", "greece", "island", "morocco", "mystery", "new-zealand", "paris", "peru", "roadtrip", "summer", "switzerland", "tokyo", "wellness", "winter"]
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
        icon: object.icon,
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

        const { error: aErr } = await supabaseAdmin.from("itinerary_activities").insert({
          day_id: dayId,
          activity_index: j,
          start_time: act.start_time,
          end_time: act.end_time,
          title: act.title,
          description: act.description,
          type: act.type,
          status: "planned",
          location_name: act.location?.name,
          location_lat: act.location?.lat,
          location_lng: act.location?.lng,
          address: act.location?.address,
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
