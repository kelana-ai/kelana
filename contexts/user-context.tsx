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
    if (typeof window === "undefined") return null
    const json = localStorage.getItem("profile")
    return json ? (JSON.parse(json) as Profile) : null
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const currentAvatarPathRef = useRef<string | null>(null)
  const initialized = useRef(false)
  const fetchingRef = useRef(false)
  const lastAuthEventRef = useRef<string | null>(null)

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

  const createProfileIfNotExists = useCallback(
    async (userId: string, userMetadata: any) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            full_name: userMetadata?.full_name || null,
            avatar_url: userMetadata?.avatar_url || null,
          })
          .select()
          .single()

        if (error) {
          console.error("Failed to create profile:", error.message || error)
          return null
        }

        return data as Profile
      } catch (err) {
        console.error("Create profile exception:", err instanceof Error ? err.message : err)
        return null
      }
    },
    [supabase],
  )

  const fetchProfile = useCallback(
    async (userId: string, userMetadata?: any) => {
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error) {
          // If profile doesn't exist, try to create it
          if (error.code === 'PGRST116') {
            console.warn("Profile not found, creating new profile for user:", userId)
            return await createProfileIfNotExists(userId, userMetadata)
          }
          console.error("Profile fetch error:", error.message || error)
          return null
        }

        return data as Profile
      } catch (err) {
        console.error("Profile fetch exception:", err instanceof Error ? err.message : err)
        return null
      }
    },
    [supabase, createProfileIfNotExists],
  )

  const updateUserState = useCallback(
    async (sessionUser: User) => {
      // Prevent duplicate fetches
      if (fetchingRef.current) return
      fetchingRef.current = true

      try {
        setUser(sessionUser)
        setIsLoading(true)

        const fresh = await fetchProfile(sessionUser.id, sessionUser.user_metadata)

        if (fresh) {
          setProfile(fresh)
          localStorage.setItem("profile", JSON.stringify(fresh))

          // Handle avatar URL
          const avatarPath = fresh.avatar_url
          if (!avatarPath) {
            currentAvatarPathRef.current = null
            setAvatarUrl(null)
          } else if (avatarPath !== currentAvatarPathRef.current) {
            const url = avatarPath.startsWith("http") ? avatarPath : await downloadImage(avatarPath)
            setAvatarUrl(url)
            currentAvatarPathRef.current = avatarPath
          }
        } else {
          // Profile creation failed - use minimal profile object
          const minimalProfile: Profile = {
            id: sessionUser.id,
            full_name: sessionUser.user_metadata?.full_name || null,
            username: null,
            avatar_url: sessionUser.user_metadata?.avatar_url || null,
            website: null,
            updated_at: new Date().toISOString(),
          }
          setProfile(minimalProfile)
          localStorage.setItem("profile", JSON.stringify(minimalProfile))
        }
      } finally {
        setIsLoading(false)
        fetchingRef.current = false
      }
    },
    [downloadImage, fetchProfile],
  )

  // Use refs to avoid recreating refreshProfile on every user change
  const userRef = useRef(user)
  const fetchProfileRef = useRef(fetchProfile)
  const downloadImageRef = useRef(downloadImage)

  useEffect(() => {
    userRef.current = user
    fetchProfileRef.current = fetchProfile
    downloadImageRef.current = downloadImage
  })

  const refreshProfile = useCallback(async () => {
    const currentUser = userRef.current
    if (!currentUser) return

    try {
      const fresh = await fetchProfileRef.current(currentUser.id, currentUser.user_metadata)

      if (fresh) {
        setProfile(fresh)
        localStorage.setItem("profile", JSON.stringify(fresh))

        // Handle avatar URL
        const avatarPath = fresh.avatar_url
        if (!avatarPath) {
          currentAvatarPathRef.current = null
          setAvatarUrl(null)
        } else if (avatarPath !== currentAvatarPathRef.current) {
          const url = avatarPath.startsWith("http") ? avatarPath : await downloadImageRef.current(avatarPath)
          setAvatarUrl(url)
          currentAvatarPathRef.current = avatarPath
        }
      }
    } catch (error) {
      console.error("Refresh profile error:", error)
    }
  }, [])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        updateUserState(session.user)
      } else {
        setIsLoading(false)
      }
    })

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Prevent duplicate processing of same event
      const eventKey = `${event}-${session?.user?.id || 'null'}`
      if (lastAuthEventRef.current === eventKey) {
        return
      }
      lastAuthEventRef.current = eventKey

      if (session?.user) {
        await updateUserState(session.user)
      } else {
        setUser(null)
        setProfile(null)
        setAvatarUrl(null)
        localStorage.removeItem("profile")
        setIsLoading(false)
        fetchingRef.current = false
      }
    })

    return () => {
      subscription.unsubscribe()
      if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({ user, profile, avatarUrl, isLoading, refreshProfile }),
    [user, profile, avatarUrl, isLoading, refreshProfile],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
