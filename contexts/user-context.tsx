"use client"

import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

type Profile = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  website: string | null
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
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from("avatars").download(path)
      if (error) {
        throw error
      }

      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
      return url
    } catch (error) {
      console.log("Error downloading image: ", error)
      return null
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return data as Profile
    } catch (error) {
      console.error("Error in fetchProfile:", error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (!user) return

    try {
      const profileData = await fetchProfile(user.id)
      
      if (profileData) {
        setProfile(profileData)
        
        if (profileData.avatar_url) {
          if (profileData.avatar_url.startsWith("http")) {
            setAvatarUrl(profileData.avatar_url)
          } else {
            if (avatarUrl && !avatarUrl.startsWith("http")) {
              URL.revokeObjectURL(avatarUrl)
            }
            await downloadImage(profileData.avatar_url)
          }
        } else {
          setAvatarUrl(null)
        }
      }
    } catch (error) {
      console.error("Error refreshing profile:", error)
    }
  }

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setIsLoading(true)
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          
          const profileData = await fetchProfile(session.user.id)
          
          if (profileData) {
            setProfile(profileData)
            
            if (profileData.avatar_url) {
              if (profileData.avatar_url.startsWith("http")) {
                setAvatarUrl(profileData.avatar_url)
              } else {
                await downloadImage(profileData.avatar_url)
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id)
        
        if (profileData) {
          setProfile(profileData)
          
          if (profileData.avatar_url) {
            if (profileData.avatar_url.startsWith("http")) {
              setAvatarUrl(profileData.avatar_url)
            } else {
              if (avatarUrl && !avatarUrl.startsWith("http")) {
                URL.revokeObjectURL(avatarUrl)
              }
              await downloadImage(profileData.avatar_url)
            }
          } else {
            setAvatarUrl(null)
          }
        } else {
          setProfile(null)
          setAvatarUrl(null)
        }
      } else {
        setProfile(null)
        
        if (avatarUrl && !avatarUrl.startsWith("http")) {
          URL.revokeObjectURL(avatarUrl)
        }
        
        setAvatarUrl(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
      
      if (avatarUrl && !avatarUrl.startsWith("http")) {
        URL.revokeObjectURL(avatarUrl)
      }
    }
  }, [])

  const value = {
    user,
    profile,
    avatarUrl,
    isLoading,
    refreshProfile,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
