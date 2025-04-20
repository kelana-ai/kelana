"use client"

import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

type Profile = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  website: string | null
  home_lat?: number | null
  home_lng?: number | null
  preferences?: {
    travelStyles?: string[]
    [key: string]: any
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
  const [profile, setProfile] = useState<Profile | null>(() => {
    const json = typeof window !== "undefined" && localStorage.getItem("profile")
    return json ? (JSON.parse(json) as Profile) : null
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const currentAvatarPathRef = useRef<string | null>(null)
  const initialized = useRef(false)

  const downloadImage = useCallback(
    async (path: string) => {
      try {
        const { data, error } = await supabase.storage.from("avatars").download(path)
        if (error) throw error
        return URL.createObjectURL(data)
      } catch (err) {
        console.error("Image download error:", err)
        return null
      }
    },
    [supabase],
  )

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
        if (error) throw error
        return data as Profile
      } catch (err) {
        console.error("Profile fetch error:", err)
        return null
      }
    },
    [supabase],
  )

  const updateUserState = useCallback(
    async (sessionUser: User) => {
      setIsLoading(true)
      setUser(sessionUser)

      if (profile) {
        setProfile(profile)
      }

      const fresh = await fetchProfile(sessionUser.id)
      if (fresh) {
        setProfile(fresh)
        localStorage.setItem("profile", JSON.stringify(fresh))
      }

      const avatarPath = fresh?.avatar_url
      if (!avatarPath) {
        currentAvatarPathRef.current = null
        setAvatarUrl(null)
      } else if (avatarPath !== currentAvatarPathRef.current) {
        const url = avatarPath.startsWith("http") ? avatarPath : await downloadImage(avatarPath)
        setAvatarUrl(url)
        currentAvatarPathRef.current = avatarPath
      }
      setIsLoading(false)
    },
    [downloadImage, fetchProfile, profile],
  )

  const refreshProfile = useCallback(async () => {
    if (user) await updateUserState(user)
  }, [user, updateUserState])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) updateUserState(session.user)
      else setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await updateUserState(session.user)
      } else {
        setUser(null)
        setProfile(null)
        setAvatarUrl(null)
        localStorage.removeItem("profile")
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl)
    }
  }, [supabase, updateUserState, avatarUrl])

  const value = useMemo(
    () => ({ user, profile, avatarUrl, isLoading, refreshProfile }),
    [user, profile, avatarUrl, isLoading, refreshProfile],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
