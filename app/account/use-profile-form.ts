"use client"

import type { SupabaseClient } from "@supabase/supabase-js"
import { useState } from "react"
import { toast } from "sonner"

import type { Profile } from "@/contexts/user-context"
import { validateProfile } from "@/lib/profile"
import { saveAvatarPath, saveProfile } from "./profile-data"

export function useProfileForm(supabase: SupabaseClient, userId: string, profile: Profile, refreshProfile: () => Promise<void>) {
  const [updating, setUpdating] = useState(false)
  const [fullname, setFullname] = useState(profile.full_name ?? "")
  const [username, setUsername] = useState(profile.username ?? "")
  const [website, setWebsite] = useState(profile.website ?? "")

  async function submit() {
    const problem = validateProfile({ username, website })
    if (problem) {
      toast.error(problem)
      return
    }

    setUpdating(true)
    try {
      const result = await saveProfile(supabase, userId, { fullName: fullname, username, website })
      if (!result.ok) {
        toast.error("That username is already taken.")
        return
      }
      await refreshProfile()
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Update profile error:", error)
      toast.error("Error updating profile")
    } finally {
      setUpdating(false)
    }
  }

  async function updateAvatar(path: string): Promise<boolean> {
    const error = await saveAvatarPath(supabase, userId, path)
    if (error) {
      console.error("Update avatar error:", error)
      toast.error("Error updating avatar in your profile")
      return false
    }
    await refreshProfile()
    toast.success("Avatar updated successfully")
    return true
  }

  return { fullname, setFullname, username, setUsername, website, setWebsite, updating, submit, updateAvatar }
}
