import type { SupabaseClient } from "@supabase/supabase-js"

import { avatarPath, ownedAvatar } from "@/lib/avatar"

export async function replaceAvatar(
  supabase: SupabaseClient,
  uid: string,
  file: File,
  previous: string | null,
  save: (path: string) => Promise<boolean>,
) {
  const filePath = avatarPath(uid, file.type, crypto.randomUUID())
  const { error } = await supabase.storage.from("avatars").upload(filePath, file, { contentType: file.type })
  if (error) throw error

  const saved = await save(filePath)
  const stale = ownedAvatar(previous, uid)
  if (saved && stale) {
    await supabase.storage.from("avatars").remove([stale])
  } else if (!saved) {
    await supabase.storage.from("avatars").remove([filePath])
  }
}

export const avatarPublicUrl = (supabase: SupabaseClient, path: string) => supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl
