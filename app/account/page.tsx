"use client"

import { createClient } from "@/utils/supabase/client"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Avatar from "./avatar"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/contexts/user-context"
import { useRouter } from "next/navigation"

export default function Account() {
  const supabase = createClient()
  const { user, profile, isLoading, refreshProfile } = useUser()
  const [updating, setUpdating] = useState(false)
  const [fullname, setFullname] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [website, setWebsite] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])  

  useEffect(() => {
    if (profile) {
      setFullname(profile.full_name)
      setUsername(profile.username)
      setWebsite(profile.website)
      setAvatarUrl(profile.avatar_url)
    }
  }, [profile])

  if (isLoading || !user) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  async function updateProfile() {
    if (!user) return

    try {
      setUpdating(true)

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullname,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      // Refresh the profile data in the context
      await refreshProfile()

      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Error updating profile")
    } finally {
      setUpdating(false)
    }
  }

  async function updateAvatar(newAvatarUrl: string) {
    if (!user) return

    try {
      // Only update the avatar_url and updated_at fields
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      // Update local state
      setAvatarUrl(newAvatarUrl)

      // Refresh the profile data in the context
      await refreshProfile()

      toast.success("Avatar updated successfully")
    } catch (error) {
      console.error(error)
      toast.error("Error updating avatar in your profile")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-md mt-8 mb-24">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>

      {isLoading ? (
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      ) : (
        <>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Avatar
                uid={user?.id ?? null}
                url={avatar_url}
                size={150}
                onUpload={(url) => {
                  updateAvatar(url)
                }}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="text" value={user?.email || ""} disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">Your email address cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullname || ""}
                  onChange={(e) => setFullname(e.target.value)}
                  disabled={updating}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username || ""}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={updating}
                  placeholder="Choose a username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website || ""}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={updating}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" onClick={updateProfile} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>

            <Separator />

            <form action="/auth/signout" method="post" className="w-full">
              <Button variant="outline" className="w-full" type="submit">
                Sign out
              </Button>
            </form>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
