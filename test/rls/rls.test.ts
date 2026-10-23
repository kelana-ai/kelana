import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

const PRODUCTION_REF = "caeawmpnhnipzknsllce"

try {
  process.loadEnvFile(".env")
} catch {
  // CI passes the variables directly
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to the dev project")
if (url.includes(PRODUCTION_REF)) throw new Error("These tests create users and must never run against production")

const stamp = Date.now()
const password = `Rls-${stamp}-Check!`
const png = new Blob([Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="), (c) => c.charCodeAt(0))], { type: "image/png" })

const newClient = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })

interface Account {
  client: SupabaseClient
  id: string
}

async function signUp(label: string): Promise<Account> {
  const client = newClient()
  const { data, error } = await client.auth.signUp({ email: `rls-${stamp}-${label}@example.com`, password })
  if (error || !data.user || !data.session) {
    throw new Error(`Could not create the ${label} user: ${error?.message ?? "no session, is email confirmation switched on?"}`)
  }
  return { client, id: data.user.id }
}

async function remove(account: Account | undefined) {
  if (!account) return
  const { data: files } = await account.client.storage.from("avatars").list(account.id)
  if (files?.length) await account.client.storage.from("avatars").remove(files.map((file) => `${account.id}/${file.name}`))
  const { error } = await account.client.rpc("delete_my_account")
  if (error) throw new Error(`Could not remove a test user: ${error.message}`)
}

const denied = { code: "42501" }

describe("row-level security", () => {
  let a: Account
  let b: Account
  let anon: SupabaseClient
  let itineraryId: string
  let dayId: string
  let activityId: string

  const itinerary = (userId: string, name: string) => ({
    user_id: userId,
    name,
    destination_name: "Ubud, Bali",
    destination_lat: -8.5069,
    destination_lng: 115.2625,
    date_from: "2026-11-02",
    date_to: "2026-11-03",
    travel_type: "solo",
    budget: { total: 100, spent: 10, remaining: 90 },
  })

  const stillIntact = async () => {
    const { data } = await a.client.from("itineraries").select("name, itinerary_days(id, itinerary_activities(id, title))").eq("id", itineraryId).single()
    expect(data?.name).toBe("A trip")
    expect(data?.itinerary_days).toHaveLength(1)
    expect(data?.itinerary_days[0].itinerary_activities).toEqual([{ id: activityId, title: "Walk" }])
  }

  beforeAll(async () => {
    anon = newClient()
    a = await signUp("a")
    b = await signUp("b")

    const created = await a.client.from("itineraries").insert(itinerary(a.id, "A trip")).select("id").single()
    expect(created.error).toBeNull()
    itineraryId = created.data!.id

    const day = await a.client.from("itinerary_days").insert({ itinerary_id: itineraryId, day_index: 0, date: "2026-11-02" }).select("id").single()
    expect(day.error).toBeNull()
    dayId = day.data!.id

    const activity = await a.client
      .from("itinerary_activities")
      .insert({ day_id: dayId, activity_index: 0, start_time: "09:00", title: "Walk", type: "sightseeing", cost: 12.5 })
      .select("id")
      .single()
    expect(activity.error).toBeNull()
    activityId = activity.data!.id
  }, 60_000)

  afterAll(async () => {
    await remove(b)
    await remove(a)
  }, 60_000)

  describe("the owner", () => {
    it("reads the itinerary with its days and activities", async () => {
      await stillIntact()
    })

    it("updates the itinerary and its activity", async () => {
      const trip = await a.client.from("itineraries").update({ description: "Edited" }).eq("id", itineraryId).select("id")
      expect(trip.data).toHaveLength(1)
      const activity = await a.client.from("itinerary_activities").update({ cost: 13 }).eq("id", activityId).select("id")
      expect(activity.data).toHaveLength(1)
    })

    it("totals the budget by activity type", async () => {
      const { data, error } = await a.client.rpc("budget_by_type")
      expect(error).toBeNull()
      expect(data).toEqual([{ type: "sightseeing", cost: 13 }])
    })
  })

  describe("another account", () => {
    it("does not see the itinerary, its days or its activities", async () => {
      for (const table of ["itineraries", "itinerary_days", "itinerary_activities"]) {
        const { data, error } = await b.client.from(table).select("id")
        expect(error).toBeNull()
        expect(data).toEqual([])
      }
      const direct = await b.client.from("itineraries").select("id").eq("id", itineraryId)
      expect(direct.data).toEqual([])
    })

    it("cannot update them", async () => {
      const results = await Promise.all([
        b.client.from("itineraries").update({ name: "Hacked" }).eq("id", itineraryId).select("id"),
        b.client.from("itinerary_days").update({ notes: "Hacked" }).eq("id", dayId).select("id"),
        b.client.from("itinerary_activities").update({ title: "Hacked" }).eq("id", activityId).select("id"),
      ])
      for (const { data } of results) expect(data).toEqual([])
      await stillIntact()
    })

    it("cannot delete them", async () => {
      const results = await Promise.all([
        b.client.from("itinerary_activities").delete().eq("id", activityId).select("id"),
        b.client.from("itinerary_days").delete().eq("id", dayId).select("id"),
        b.client.from("itineraries").delete().eq("id", itineraryId).select("id"),
      ])
      for (const { data } of results) expect(data).toEqual([])
      await stillIntact()
    })

    it("cannot insert an itinerary for the owner", async () => {
      const { error } = await b.client.from("itineraries").insert(itinerary(a.id, "Planted"))
      expect(error).toMatchObject(denied)
    })

    it("cannot insert a day into the itinerary of the owner", async () => {
      const { error } = await b.client.from("itinerary_days").insert({ itinerary_id: itineraryId, day_index: 5, date: "2026-11-09" })
      expect(error).toMatchObject(denied)
    })

    it("cannot insert an activity into a day of the owner", async () => {
      const { error } = await b.client
        .from("itinerary_activities")
        .insert({ day_id: dayId, activity_index: 9, start_time: "10:00", title: "Planted", type: "other" })
      expect(error).toMatchObject(denied)
    })

    it("cannot replace the plan of the owner", async () => {
      const { error } = await b.client.rpc("replace_itinerary_plan", { p_itinerary_id: itineraryId, p_days: [], p_budget: {}, p_carbon: {} })
      expect(error?.message).toBe("Itinerary not found")
      await stillIntact()
    })

    it("has no budget totals of its own to see the totals of the owner", async () => {
      const { data, error } = await b.client.rpc("budget_by_type")
      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    it("cannot read or change the profile of the owner", async () => {
      const read = await b.client.from("profiles").select("id").eq("id", a.id)
      expect(read.data).toEqual([])
      const write = await b.client.from("profiles").update({ full_name: "Hacked" }).eq("id", a.id).select("id")
      expect(write.data).toEqual([])
      const mine = await a.client.from("profiles").select("full_name").eq("id", a.id).single()
      expect(mine.data?.full_name).not.toBe("Hacked")
    })

    it("cannot create a profile for the owner", async () => {
      const { error } = await b.client.from("profiles").insert({ id: a.id })
      expect(error).toBeTruthy()
    })
  })

  describe("avatar files", () => {
    it("can be uploaded to the own folder only", async () => {
      const own = await a.client.storage.from("avatars").upload(`${a.id}/own.png`, png, { contentType: "image/png" })
      expect(own.error).toBeNull()
      const foreign = await b.client.storage.from("avatars").upload(`${a.id}/planted.png`, png, { contentType: "image/png" })
      expect(foreign.error).toBeTruthy()
    })

    it("cannot be listed or removed by another account", async () => {
      const listed = await b.client.storage.from("avatars").list(a.id)
      expect(listed.data ?? []).toEqual([])
      await b.client.storage.from("avatars").remove([`${a.id}/own.png`])
      const mine = await a.client.storage.from("avatars").list(a.id)
      expect(mine.data?.map((file) => file.name)).toEqual(["own.png"])
    })

    it("cannot be listed without signing in", async () => {
      const { data } = await anon.storage.from("avatars").list(a.id)
      expect(data ?? []).toEqual([])
    })
  })

  describe("an anonymous request", () => {
    it.each(["itineraries", "itinerary_days", "itinerary_activities", "profiles"])("cannot read %s", async (table) => {
      const { data, error } = await anon.from(table).select("id")
      expect(error).toMatchObject(denied)
      expect(data).toBeNull()
    })

    it("cannot write an itinerary", async () => {
      expect((await anon.from("itineraries").insert(itinerary(a.id, "Anonymous"))).error).toMatchObject(denied)
      expect((await anon.from("itineraries").update({ name: "Anonymous" }).eq("id", itineraryId)).error).toMatchObject(denied)
      expect((await anon.from("itineraries").delete().eq("id", itineraryId)).error).toMatchObject(denied)
    })

    it.each(["budget_by_type", "delete_my_account"])("cannot call %s", async (name) => {
      expect((await anon.rpc(name)).error).toMatchObject(denied)
    })

    it("cannot replace a plan", async () => {
      const { error } = await anon.rpc("replace_itinerary_plan", { p_itinerary_id: itineraryId, p_days: [], p_budget: {}, p_carbon: {} })
      expect(error).toMatchObject(denied)
    })

    it("can still call ping, which the keep-alive job uses", async () => {
      const { data, error } = await anon.rpc("ping")
      expect(error).toBeNull()
      expect(data).toBe(1)
    })

    it("left every row of the owner as it was", async () => {
      await stillIntact()
    })
  })

  describe("replace_itinerary_plan for the owner", () => {
    const activity = (title: string, patch: Record<string, unknown> = {}) => ({
      activity_index: 0,
      start_time: "08:00",
      end_time: "09:00",
      title,
      description: "",
      type: "food",
      status: "planned",
      location_name: null,
      location_lat: null,
      location_lng: null,
      address: null,
      cost: 5,
      currency: "USD",
      eco_tags: [],
      ...patch,
    })

    it("changes nothing when one activity breaks a rule", async () => {
      const { error } = await a.client.rpc("replace_itinerary_plan", {
        p_itinerary_id: itineraryId,
        p_days: [
          { day_index: 0, date: "2026-11-02", activities: [activity("First")] },
          { day_index: 1, date: "2026-11-03", activities: [activity("Second", { start_time: "10:00", end_time: "09:00" })] },
        ],
        p_budget: { total: 1, spent: 1, remaining: 0 },
        p_carbon: { saved: 1, total: 1, percentage: 1 },
      })
      expect(error?.message).toMatch(/chk_time_order/)
      await stillIntact()
      const { data } = await a.client.from("itineraries").select("budget").eq("id", itineraryId).single()
      expect(data?.budget).toEqual({ total: 100, spent: 10, remaining: 90 })
    })

    it("replaces the days, the activities and the totals together", async () => {
      const { error } = await a.client.rpc("replace_itinerary_plan", {
        p_itinerary_id: itineraryId,
        p_days: [
          { day_index: 0, date: "2026-11-02", activities: [activity("New walk")] },
          { day_index: 1, date: "2026-11-03", activities: [] },
        ],
        p_budget: { total: 100, spent: 5, remaining: 95 },
        p_carbon: { saved: 3, total: 4, percentage: 75 },
      })
      expect(error).toBeNull()
      const { data } = await a.client
        .from("itineraries")
        .select("budget, carbon_metrics, itinerary_days(day_index, itinerary_activities(title, status))")
        .eq("id", itineraryId)
        .single()
      expect(data?.budget).toEqual({ total: 100, spent: 5, remaining: 95 })
      expect(data?.carbon_metrics).toEqual({ saved: 3, total: 4, percentage: 75 })
      expect(data?.itinerary_days).toHaveLength(2)
      expect(data?.itinerary_days.flatMap((day: { itinerary_activities: { title: string }[] }) => day.itinerary_activities.map((row) => row.title))).toEqual(["New walk"])
    })
  })
})
