"use client"

import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

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

type UserContextType = {
  user: User | null
  profile: Profile | null
  avatarUrl: string | null
  isLoading: boolean
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  avatarUrl: null,
  isLoading: true,
  refreshProfile: async () => {},
})

export const useUser = () => useContext(UserContext)

export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const userRef = useRef<User | null>(null)

  const avatarUrl = useMemo(() => {
    const path = profile?.avatar_url
    if (!path) return null
    if (path.startsWith("http")) return path
    return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl
  }, [profile?.avatar_url, supabase])

  // Loads the profile, creating the row when the signup trigger has not (e.g. for accounts that predate it).
  const loadProfile = useCallback(
    async (sessionUser: User): Promise<Profile> => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).maybeSingle()
      if (error) console.error("Profile fetch error:", error.message)
      if (data) return data as Profile

      if (!error) {
        const { data: created, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: sessionUser.id,
            full_name: sessionUser.user_metadata?.full_name || null,
            avatar_url: sessionUser.user_metadata?.avatar_url || null,
          })
          .select()
          .single()
        if (created) return created as Profile
        if (createError) console.error("Failed to create profile:", createError.message)
      }

      return {
        id: sessionUser.id,
        full_name: sessionUser.user_metadata?.full_name || null,
        username: null,
        avatar_url: sessionUser.user_metadata?.avatar_url || null,
        website: null,
        updated_at: null,
      }
    },
    [supabase],
  )

  const refreshProfile = useCallback(async () => {
    const current = userRef.current
    if (!current) return
    setProfile(await loadProfile(current))
  }, [loadProfile])

  useEffect(() => {
    let cancelled = false

    const apply = async (sessionUser: User | null) => {
      userRef.current = sessionUser
      if (!sessionUser) {
        setUser(null)
        setProfile(null)
        setIsLoading(false)
        return
      }
      setUser(sessionUser)
      const loaded = await loadProfile(sessionUser)
      if (cancelled || userRef.current?.id !== sessionUser.id) return
      setProfile(loaded)
      setIsLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" && session?.user && userRef.current?.id === session.user.id) {
        userRef.current = session.user
        return
      }
      // Defer Supabase calls out of the auth callback to avoid a GoTrue client deadlock.
      setTimeout(() => {
        if (!cancelled) void apply(session?.user ?? null)
      }, 0)
    })

    // INITIAL_SESSION is emitted to the subscription above; this covers clients that do not emit it.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && !userRef.current) void apply(session?.user ?? null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase, loadProfile])

  const value = useMemo(
    () => ({ user, profile, avatarUrl, isLoading, refreshProfile }),
    [user, profile, avatarUrl, isLoading, refreshProfile],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
