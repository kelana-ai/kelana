import type { SupabaseClient, User } from "@supabase/supabase-js"

import type { Profile } from "./user-context"

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
