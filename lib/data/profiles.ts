import type { SupabaseClient, User } from "@supabase/supabase-js"

export type Profile = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  website: string | null
  home_lat?: number | null
  home_lng?: number | null
  preferences?: {
    travelStyles?: string[]
    [key: string]: unknown
  } | null
  dietary_needs?: string[] | null
  updated_at: string | null
}

export interface ProfileInput {
  fullName: string
  username: string
  website: string
}

export type SaveProfileResult = { ok: true } | { ok: false; reason: "username-taken" }

export async function saveProfile(
  supabase: SupabaseClient,
  userId: string,
  { fullName, username, website }: ProfileInput,
  now = new Date(),
): Promise<SaveProfileResult> {
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName.trim() || null,
      username: username.trim() || null,
      website: website.trim() || null,
      updated_at: now.toISOString(),
    })
    .eq("id", userId)

  if (!error) return { ok: true }
  if (error.code === "23505") return { ok: false, reason: "username-taken" }
  throw error
}

export async function saveAvatarPath(supabase: SupabaseClient, userId: string, path: string, now = new Date()) {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: path, updated_at: now.toISOString() })
    .eq("id", userId)
  return error
}

export async function savePreferences(
  supabase: SupabaseClient,
  userId: string,
  current: Record<string, unknown> | null | undefined,
  travelStyles: string[],
  dietaryNeeds: string[],
  now = new Date(),
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      preferences: { ...(current ?? {}), travelStyles },
      dietary_needs: dietaryNeeds,
      updated_at: now.toISOString(),
    })
    .eq("id", userId)
  if (error) throw error
}

export async function deleteAccount(supabase: SupabaseClient, userId: string) {
  const { data: files } = await supabase.storage.from("avatars").list(userId)
  if (files?.length) await supabase.storage.from("avatars").remove(files.map((f) => `${userId}/${f.name}`))

  const { error } = await supabase.rpc("delete_my_account")
  if (error) throw error

  // the account is already gone on the server, so only the local session can be cleared
  await supabase.auth.signOut({ scope: "local" })
}

const fromMetadata = (user: User) => ({
  full_name: user.user_metadata?.full_name || null,
  avatar_url: user.user_metadata?.avatar_url || null,
})

export async function loadProfile(supabase: SupabaseClient, sessionUser: User): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).maybeSingle()
  if (error) console.error("Profile fetch error:", error.message)
  if (data) return data as Profile

  const fallback: Profile = { id: sessionUser.id, ...fromMetadata(sessionUser), username: null, website: null, updated_at: null }
  if (error) return fallback

  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert({ id: sessionUser.id, ...fromMetadata(sessionUser) })
    .select()
    .single()
  if (created) return created as Profile
  if (createError) console.error("Failed to create profile:", createError.message)

  return fallback
}

export interface TripDefaults {
  homeLat: number
  homeLng: number
  travelStyles: string[]
  dietaryNeeds: string[]
}

export async function saveTripDefaults(supabase: SupabaseClient, userId: string, defaults: TripDefaults) {
  const { error } = await supabase
    .from("profiles")
    .update({
      home_lat: defaults.homeLat,
      home_lng: defaults.homeLng,
      preferences: { travelStyles: defaults.travelStyles },
      dietary_needs: defaults.dietaryNeeds,
    })
    .eq("id", userId)
  if (error) throw error
}
