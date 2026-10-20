"use client"

import { createClient } from "@/utils/supabase/client"
import { ArrowLeft, AtSign, Calendar, Check, Globe, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import Avatar from "./avatar"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Profile, useUser } from "@/contexts/user-context"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { dietaryNeeds, travelStyles } from "../itinerary/new/constants"

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,30}$/

export default function Account() {
  const { user, profile, isLoading } = useUser()

  if (isLoading) return <AccountSkeleton />
  if (!user || !profile) return null

  return <AccountContent key={profile.id} user={user} profile={profile} />
}

function AccountSkeleton() {
  return (
    <div className="container max-w-5xl py-8">
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <Skeleton className="h-[150px] w-[150px] rounded-full" />
            <Skeleton className="h-7 w-[150px]" />
            <Skeleton className="h-4 w-[180px]" />
          </CardContent>
        </Card>
        <div className="space-y-4 md:col-span-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}

function AccountContent({ user, profile }: { user: NonNullable<ReturnType<typeof useUser>["user"]>; profile: Profile }) {
  const supabase = useMemo(() => createClient(), [])
  const { refreshProfile } = useUser()
  const router = useRouter()

  const [updating, setUpdating] = useState(false)
  const [fullname, setFullname] = useState(profile.full_name ?? "")
  const [username, setUsername] = useState(profile.username ?? "")
  const [website, setWebsite] = useState(profile.website ?? "")
  const [styles, setStyles] = useState<string[]>(profile.preferences?.travelStyles ?? [])
  const [diets, setDiets] = useState<string[]>(profile.dietary_needs ?? [])
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  const formattedJoinDate = useMemo(
    () =>
      (user.created_at ? new Date(user.created_at) : new Date()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [user.created_at],
  )

  async function updateProfile() {
    const cleanUsername = username.trim()
    if (cleanUsername && !USERNAME_PATTERN.test(cleanUsername)) {
      toast.error("Username must be 3-30 characters: letters, numbers, dots, dashes or underscores.")
      return
    }
    const cleanWebsite = website.trim()
    if (cleanWebsite && !/^https?:\/\//i.test(cleanWebsite)) {
      toast.error("Website must start with http:// or https://")
      return
    }

    setUpdating(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullname.trim() || null,
          username: cleanUsername || null,
          website: cleanWebsite || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        if (error.code === "23505") toast.error("That username is already taken.")
        else throw error
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
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: path, updated_at: new Date().toISOString() })
      .eq("id", user.id)
    if (error) {
      console.error("Update avatar error:", error)
      toast.error("Error updating avatar in your profile")
      return false
    }
    await refreshProfile()
    toast.success("Avatar updated successfully")
    return true
  }

  async function savePreferences() {
    setSavingPrefs(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          preferences: { ...(profile.preferences ?? {}), travelStyles: styles },
          dietary_needs: diets,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
      if (error) throw error
      await refreshProfile()
      toast.success("Preferences saved")
    } catch (error) {
      console.error("Save preferences error:", error)
      toast.error("Error saving preferences")
    } finally {
      setSavingPrefs(false)
    }
  }

  async function deleteAccount() {
    setDeleting(true)
    try {
      const { data: files } = await supabase.storage.from("avatars").list(user.id)
      if (files?.length) await supabase.storage.from("avatars").remove(files.map((f) => `${user.id}/${f.name}`))

      const { error } = await supabase.rpc("delete_my_account")
      if (error) throw error

      // the account is already gone on the server, so only the local session can be cleared
      await supabase.auth.signOut({ scope: "local" })
      router.replace("/")
      router.refresh()
    } catch (error) {
      console.error("Delete account error:", error)
      toast.error("We couldn't delete your account. Please try again.")
      setDeleting(false)
    }
  }

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

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
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar uid={user.id} url={profile.avatar_url} size={150} onUpload={updateAvatar} />
              <h2 className="mt-4 text-xl font-semibold">{profile.full_name || profile.username || user.email?.split("@")[0]}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {formattedJoinDate}</span>
              </div>
              <Separator className="my-4" />
              <div className="w-full space-y-2">
                <div className="flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.username || "No username set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate text-sm">{profile.website || "No website set"}</span>
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
                  <h3 className="mb-4 text-lg font-medium">Profile Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        disabled={updating}
                        maxLength={100}
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
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={updating}
                          maxLength={30}
                          placeholder="Choose a username (optional)"
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
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          disabled={updating}
                          placeholder="https://example.com"
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <Button className="mt-2 w-full" onClick={updateProfile} disabled={updating}>
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
                  <h3 className="mb-4 text-lg font-medium">Account Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="text" value={user.email || ""} disabled className="bg-muted/50 pl-9" />
                      </div>
                      <p className="text-xs text-muted-foreground">Your email address cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Account ID</Label>
                      <div className="rounded-md bg-muted p-3 font-mono text-sm">{user.id}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-destructive/50">
                <CardContent className="pt-6">
                  <h3 className="mb-2 text-lg font-medium text-destructive">Danger Zone</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Permanently delete your account, profile, avatar and all of your itineraries. This cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-medium">Travel Preferences</h3>
                  <p className="mb-4 text-muted-foreground">
                    These are pre-selected when you create a new itinerary. Your home location is saved from the itinerary wizard.
                  </p>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Travel Interests</Label>
                      <div className="flex flex-wrap gap-2">
                        {travelStyles.map((s) => (
                          <Badge
                            key={s.id}
                            asChild
                            variant={styles.includes(s.id) ? "default" : "outline"}
                            className={cn("cursor-pointer", !styles.includes(s.id) && "hover:bg-primary/10")}
                          >
                            <button type="button" aria-pressed={styles.includes(s.id)} onClick={() => setStyles(toggle(styles, s.id))}>
                              {s.icon} {s.label}
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Dietary Needs</Label>
                      <div className="flex flex-wrap gap-2">
                        {dietaryNeeds.map((d) => (
                          <Badge
                            key={d.id}
                            asChild
                            variant={diets.includes(d.id) ? "default" : "outline"}
                            className={cn("cursor-pointer", !diets.includes(d.id) && "hover:bg-primary/10")}
                          >
                            <button type="button" aria-pressed={diets.includes(d.id)} onClick={() => setDiets(toggle(diets, d.id))}>
                              {d.icon} {d.label}
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="mt-2 w-full" onClick={savePreferences} disabled={savingPrefs}>
                      {savingPrefs ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={(open) => !deleting && setDeleteOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently removes your account and every itinerary you created. Type <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" disabled={deleting} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteAccount} disabled={deleting || confirmText !== "DELETE"}>
              {deleting ? "Deleting..." : "Delete my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
