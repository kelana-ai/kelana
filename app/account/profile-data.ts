import type { SupabaseClient } from "@supabase/supabase-js"

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
