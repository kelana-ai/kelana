import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { saveItinerary, type ItineraryMeta } from "../lib/data/itineraries.ts"
import type { CleanItinerary } from "../lib/itinerary.ts"
import { assertNotProduction } from "./guard.ts"

export const DEMO_EMAIL = "demo@example.com"
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? "Kelana-demo-2026!"

type Activity = CleanItinerary["days"][number]["activities"][number]
type Place = NonNullable<Activity["location"]>

interface Stop {
  at: string
  until?: string
  title: string
  about: string
  type: Activity["type"]
  cost: number
  tag: string
  place?: Place
}

interface Template {
  name: string
  destination: string
  lat: number
  lng: number
  startsInDays: number
  travelType: string
  styles: string[]
  diet: string[]
  icon: string
  budget: number
  carbon: CleanItinerary["carbon"]
  days: Stop[][]
}

const place = (name: string, lat: number, lng: number, address: string): Place => ({ name, lat, lng, address })

const templates: Template[] = [
  {
    name: "Demo: Slow days in Ubud",
    destination: "Ubud, Bali",
    lat: -8.5069,
    lng: 115.2625,
    startsInDays: 14,
    travelType: "couple",
    styles: ["nature", "wellness"],
    diet: ["vegetarian"],
    icon: "bali",
    budget: 900,
    carbon: { saved: 160, total: 210, percentage: 43 },
    days: [
      [
        { at: "09:00", until: "10:30", title: "Walk the Campuhan Ridge", about: "A shaded ridge path above the river valley, best before the heat.", type: "sightseeing", cost: 0, tag: "Walkable", place: place("Campuhan Ridge Walk", -8.5086, 115.2519, "Ubud, Gianyar") },
        { at: "12:30", until: "13:30", title: "Plant-based lunch at a family warung", about: "A set meal made from market vegetables and local rice.", type: "food", cost: 8, tag: "Locally owned" },
        { at: "15:00", until: "17:00", title: "Visit the Ubud Palace and the Saraswati Temple", about: "Both sit within a few minutes of each other on foot.", type: "sightseeing", cost: 5, tag: "Walkable", place: place("Ubud Palace", -8.5068, 115.2624, "Jalan Raya Ubud") },
      ],
      [
        { at: "08:00", until: "09:30", title: "Cycle to Tegallalang", about: "Rent a bicycle in town and ride the quiet back roads to the rice terraces.", type: "transportation", cost: 6, tag: "Low carbon" },
        { at: "09:30", until: "11:30", title: "Rice terrace walk", about: "Walk the terraces early, before the tour buses arrive.", type: "sightseeing", cost: 4, tag: "Community run", place: place("Tegallalang Rice Terrace", -8.4312, 115.2793, "Tegallalang, Gianyar") },
        { at: "16:00", until: "17:30", title: "Yoga class run by the village", about: "An open-air class in a community hall.", type: "wellness", cost: 12, tag: "Community run" },
      ],
      [
        { at: "09:00", until: "11:00", title: "Monkey Forest sanctuary", about: "A forest reserve with temples; the entry fee supports its upkeep.", type: "sightseeing", cost: 8, tag: "Conservation", place: place("Sacred Monkey Forest Sanctuary", -8.5188, 115.2589, "Jalan Monkey Forest") },
        { at: "13:00", until: "14:00", title: "Lunch with produce from the market", about: "Fruit, tempeh and rice from the morning market.", type: "food", cost: 7, tag: "Locally sourced" },
      ],
    ],
  },
  {
    name: "Demo: Three days in Kyoto by rail",
    destination: "Kyoto, Japan",
    lat: 35.0116,
    lng: 135.7681,
    startsInDays: 45,
    travelType: "solo",
    styles: ["cultural", "culinary"],
    diet: [],
    icon: "tokyo",
    budget: 1400,
    carbon: { saved: 240, total: 300, percentage: 44 },
    days: [
      [
        { at: "08:30", until: "10:30", title: "Fushimi Inari Taisha at sunrise", about: "Take the local train from Kyoto Station and climb the gate path before the crowds.", type: "sightseeing", cost: 0, tag: "Rail travel", place: place("Fushimi Inari Taisha", 34.9671, 135.7727, "Fushimi Ward, Kyoto") },
        { at: "12:30", until: "13:30", title: "Tofu lunch near the shrine", about: "A set lunch in a small family restaurant.", type: "food", cost: 14, tag: "Locally owned" },
        { at: "15:00", until: "17:00", title: "Kiyomizu-dera and the old streets below it", about: "Walk up from the bus stop and back down through Higashiyama.", type: "sightseeing", cost: 4, tag: "Walkable", place: place("Kiyomizu-dera", 34.9949, 135.785, "Higashiyama Ward, Kyoto") },
      ],
      [
        { at: "08:00", until: "09:30", title: "Bamboo Grove in Arashiyama", about: "Ride the JR line out and walk the grove while it is quiet.", type: "sightseeing", cost: 0, tag: "Rail travel", place: place("Arashiyama Bamboo Grove", 35.0094, 135.6722, "Ukyo Ward, Kyoto") },
        { at: "12:00", until: "13:00", title: "Lunch at Nishiki Market", about: "Small plates from local stalls.", type: "food", cost: 12, tag: "Locally owned", place: place("Nishiki Market", 35.005, 135.7649, "Nakagyo Ward, Kyoto") },
      ],
      [
        { at: "09:00", until: "11:00", title: "Philosopher's Path on foot", about: "A canal-side walk between two temples.", type: "wellness", cost: 0, tag: "Walkable", place: place("Philosopher's Path", 35.0272, 135.7948, "Sakyo Ward, Kyoto") },
        { at: "14:00", until: "15:00", title: "Tea tasting with a local grower", about: "A short class on how green tea is grown and served.", type: "event", cost: 18, tag: "Community run" },
      ],
    ],
  },
  {
    name: "Demo: A long weekend in Lisbon",
    destination: "Lisbon, Portugal",
    lat: 38.7223,
    lng: -9.1393,
    startsInDays: 75,
    travelType: "friends",
    styles: ["urban", "culinary"],
    diet: ["vegan"],
    icon: "global",
    budget: 1100,
    carbon: { saved: 180, total: 260, percentage: 41 },
    days: [
      [
        { at: "10:00", until: "12:00", title: "Wander through Alfama", about: "Narrow streets and viewpoints, all on foot.", type: "sightseeing", cost: 0, tag: "Walkable", place: place("Alfama", 38.711, -9.13, "Alfama, Lisbon") },
        { at: "13:00", until: "14:30", title: "Lunch at the Time Out Market", about: "Pick plant-based stalls and share plates.", type: "food", cost: 15, tag: "Locally sourced", place: place("Time Out Market Lisboa", 38.7068, -9.1459, "Av. 24 de Julho, Lisbon") },
      ],
      [
        { at: "09:00", until: "11:00", title: "Tram and walk to Belém", about: "Take the tram along the river and walk to the tower.", type: "transportation", cost: 3, tag: "Public transport", place: place("Belém Tower", 38.6916, -9.216, "Belém, Lisbon") },
        { at: "16:00", until: "18:00", title: "LX Factory workshops", about: "Local makers in a former factory complex.", type: "sightseeing", cost: 0, tag: "Locally owned", place: place("LX Factory", 38.7036, -9.1786, "Alcântara, Lisbon") },
      ],
      [
        { at: "09:30", until: "11:00", title: "Sunrise at the Miradouro da Senhora do Monte", about: "A hilltop viewpoint reached by tram and a short climb.", type: "sightseeing", cost: 0, tag: "Walkable", place: place("Miradouro da Senhora do Monte", 38.7192, -9.1328, "Graça, Lisbon") },
        { at: "12:30", until: "13:30", title: "Vegan lunch in Graça", about: "A neighbourhood café with a daily menu.", type: "food", cost: 13, tag: "Locally owned" },
      ],
    ],
  },
]

const addDays = (from: Date, days: number) => {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function planOf(template: Template, today: Date): { meta: Omit<ItineraryMeta, "userId">; plan: CleanItinerary } {
  const days = template.days.map((stops, index) => ({
    date: addDays(today, template.startsInDays + index),
    activities: stops.map(
      (stop): Activity => ({
        start_time: stop.at,
        end_time: stop.until ?? null,
        title: stop.title,
        description: stop.about,
        type: stop.type,
        eco_tag: stop.tag,
        cost: stop.cost,
        location: stop.place ?? null,
      }),
    ),
  }))
  const spent = days.reduce((sum, day) => sum + day.activities.reduce((total, activity) => total + activity.cost, 0), 0)

  return {
    meta: {
      description: `Eco-friendly itinerary to ${template.destination}`,
      destinationName: template.destination,
      destinationLat: template.lat,
      destinationLng: template.lng,
      dateFrom: days[0].date,
      dateTo: days[days.length - 1].date,
      travelType: template.travelType,
      travelStyles: template.styles,
      dietaryNeeds: template.diet,
    },
    plan: {
      name: template.name,
      destination: template.destination,
      days,
      budget: { total: template.budget, spent, remaining: template.budget - spent },
      carbon: template.carbon,
      icon: template.icon,
    },
  }
}

export async function seedTrips(supabase: SupabaseClient, userId: string, today = new Date()) {
  const { data, error } = await supabase
    .from("itineraries")
    .select("name")
    .eq("user_id", userId)
    .in("name", templates.map((template) => template.name))
  if (error) throw error

  const existing = new Set((data ?? []).map((row) => row.name))
  const created: string[] = []
  for (const template of templates.filter((candidate) => !existing.has(candidate.name))) {
    const { meta, plan } = planOf(template, today)
    await saveItinerary(supabase, { ...meta, userId }, plan)
    created.push(template.name)
  }
  return created
}

async function signInDemoUser(supabase: SupabaseClient) {
  const signedIn = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  if (signedIn.data.user) return signedIn.data.user

  const created = await supabase.auth.signUp({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  if (!created.data.user || !created.data.session) {
    throw new Error(`Could not sign in or create ${DEMO_EMAIL}: ${created.error?.message ?? signedIn.error?.message ?? "no session"}`)
  }
  return created.data.user
}

async function main() {
  try {
    process.loadEnvFile(".env")
  } catch {
    // the variables may already be set
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to the dev project")
  assertNotProduction(url)

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const user = await signInDemoUser(supabase)
  await supabase
    .from("profiles")
    .update({ full_name: "Demo Traveler", preferences: { travelStyles: ["nature", "culinary"] }, dietary_needs: ["vegetarian"] })
    .eq("id", user.id)

  const created = await seedTrips(supabase, user.id)
  console.log(created.length ? `Created: ${created.join(", ")}` : "The demo trips are already there")
  console.log(`Sign in as ${DEMO_EMAIL} with the password in scripts/seed.ts (or SEED_DEMO_PASSWORD)`)
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
