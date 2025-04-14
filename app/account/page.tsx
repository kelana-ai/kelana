"use client"

import { createClient } from "@/utils/supabase/client"
import { ArrowLeft, AtSign, Calendar, Check, Globe, Loader2, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Avatar from "./avatar"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/contexts/user-context"
import Link from "next/link"
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

  const joinDate = user?.created_at ? new Date(user.created_at) : new Date()
  const formattedJoinDate = joinDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile and account preferences</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar
                uid={user?.id ?? null}
                url={avatar_url}
                size={150}
                onUpload={(url) => {
                  updateAvatar(url)
                }}
              />

              <h2 className="mt-4 text-xl font-semibold">{fullname || username || user.email?.split("@")[0]}</h2>

              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {formattedJoinDate}</span>
              </div>

              <Separator className="my-4" />

              <div className="w-full space-y-2">
                <div className="flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{username || "No username set"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{website || "No website set"}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <form action="/auth/signout" method="post" className="w-full">
                <Button variant="outline" className="w-full" type="submit">
                  Sign out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="profile" className="flex-1">
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="flex-1">
                Account
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex-1">
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                  <div className="space-y-4">
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
                      <div className="relative">
                        <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          value={username || ""}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={updating}
                          placeholder="Choose a username"
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website"
                          type="url"
                          value={website || ""}
                          onChange={(e) => setWebsite(e.target.value)}
                          disabled={updating}
                          placeholder="https://example.com"
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <Button className="w-full mt-2" onClick={updateProfile} disabled={updating}>
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Account Information</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="text" value={user?.email || ""} disabled className="bg-muted/50 pl-9" />
                      </div>
                      <p className="text-xs text-muted-foreground">Your email address cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Account Status</Label>
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                          Active
                        </Badge>
                      </div>
                      <div className="rounded-md bg-muted p-3 text-sm">
                        <p>Your account is in good standing</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Account ID</Label>
                      <div className="rounded-md bg-muted p-3 text-sm font-mono">{user.id}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium text-destructive mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all of your content.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Travel Preferences</h3>
                  <p className="text-muted-foreground mb-4">
                    These preferences will be used to personalize your travel recommendations.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Home Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="location" type="text" placeholder="Enter your home city" className="pl-9" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Travel Interests</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                          Adventure
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                          Cultural
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                          Eco-tourism
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                          Food
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                          Relaxation
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                          Wildlife
                        </Badge>
                      </div>
                    </div>

                    <Button className="w-full mt-2">Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
