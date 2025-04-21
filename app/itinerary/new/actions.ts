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

    const dateLine = `Dates: ${formattedFrom} → ${formattedTo} (${daysCount} days)`

    const { object } = await generateObject({
      model: openai.responses("gpt-4o"),
      providerOptions: {
        openai: { apiKey: process.env.OPENAI_API_KEY! },
      },
      schema: ItinerarySchema,
      prompt: `
        You are an expert travel planner. Create a **thorough, detailed, and eco-conscious travel itinerary** for a real-world trip. All content must be **accountable, verified, and deeply researched**. Your output must align with modern greener tourism principles and **strictly follow** the provided JSON schema, including these fields:
        
        - **Itinerary**: name, destination, date_from, date_to, icon, budget, carbon  
        - **Day**: id, date, activities[]  
        - **Activity**: id, start_time, end_time, title, description, type, ecoTag, cost (USD), currency, location { name, lat, lng, address }, **sourceUrl**  
        
        🎯 **OVERVIEW**  
        Trip Name: ${tripName}  
        Destination: ${destination.name} (Lat: ${destination.lat}, Lng: ${destination.lng})  
        Home Location: ${homeLocation?.lat && homeLocation?.lng  
          ? `${homeLocation.name || "Not specified"} (Lat: ${homeLocation.lat}, Lng: ${homeLocation.lng})`  
          : "Not specified"}  
        Dates: ${dateLine}  
        Travel Type: ${travelType}  
        Travel Styles: ${travelStyles.join(", ")}  
        Dietary Preferences: ${dietaryNeeds.length > 0 ? dietaryNeeds.join(", ") : "None"}  
        Budget: $${budget}
        
        🛠️ **STRUCTURE & EXPECTATIONS**  
        1. Cover the **entire trip duration**, broken down **day by day**.  
        2. **Each day** must include at least:  
          - One **transportation** activity  
          - One **dining** activity (food or drink)  
          - One **sightseeing** activity  
          - One **wellness** or **cultural/local engagement**  
        3. **Every activity** must:  
          - Reference a **real, verifiable location** (searchable on Google Maps or official site).  
          - Include exact 'lat'/'lng', full street 'address', and a valid **sourceUrl** (Google Maps link or official webpage).  
          - Have a **3-5 sentence description** covering:  
            1. What the activity involves.  
            2. Why it's eco-friendly (e.g. solar panels, zero-waste, carbon-neutral certification).  
            3. Concrete facts (opening hours, year founded, awards or certifications).  
          - Specify a **realistic cost** (USD per person).  
          - Label 'type', 'ecoTag', 'start_time', and 'end_time' sensibly.  
        4. **Skip any activity** you cannot verify with a real sourceUrl.  
        
        ✅ **ACTIVITY EXAMPLES (GOOD)**  
        - **Alila Ubud (Bali, Indonesia)**  
          • type: accommodation | ecoTag: green-certified  
          • Coordinates: -8.4923, 115.2608  
          • sourceUrl: https://goo.gl/maps/…  
          • Description (3-5 sentences): "Alila Ubud is a luxury resort established in 2009 that uses solar-heated water, composts all food waste on-site, and holds EarthCheck Platinum certification. Guests can join guided organic farm tours and participate in daily yoga sessions overlooking the Ayung River. The property sources 80% of its produce from local farms, minimizing food miles. Its architecture preserves traditional Balinese wood-carving techniques, and it has won the Green hotel award from the Bali Tourism Board."  
        
        - **Locavore Restaurant, Ubud**  
          • type: food | ecoTag: farm-to-table  
          • Coordinates: -8.5193, 115.2633  
          • sourceUrl: https://goo.gl/maps/…  
        
        ❌ **AVOID** generic placeholders like "Local market" or "Greener cafe."
        
        🌱 **SUSTAINABILITY EMPHASIS**  
        - Prefer rail > bus > EV > flights  
        - Highlight green-certified stays, public transport, and walkable routes  
        - Recommend locally owned, ethical businesses  
        - Favor plant-based, farm-to-table, or organic menus  
        - Prioritize cooperatives or nonprofit-run activities  
        
        📊 **METRICS & BREAKDOWN**  
        - Provide a **realistic total trip cost** (USD), split by:  
          • Accommodation | Food | Transport | Experiences  
        - Estimate **carbon footprint savings** vs. conventional choices:  
          • Total emitted (kg), total saved (kg), % reduced  
        
        ⚠️ **MANDATORY QUALITY RULES**  
        - Do **not** hallucinate—every detail must be verifiable.  
        - Only use **real, existing** locations with a web or map presence.  
        - If you cannot find a valid sourceUrl, **omit** that activity.  
        
        🖼️ **FINAL ICON**  
        After generating the itinerary JSON, choose **one** icon name from:  
        ["adventure","africa","alaska","backpacking","bali","business","canada","city","costa-rica","countryside","culture","family","festival","global","greece","island","morocco","mystery","new-zealand","paris","peru","roadtrip","summer","switzerland","tokyo","wellness","winter"]  
        and include it as the top-level 'icon' property.
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
