"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Profile, useUser } from "@/contexts/user-context"
import { createClient } from "@/utils/supabase/client"
import { AccountTab } from "./account-tab"
import { DeleteAccountDialog } from "./delete-account-dialog"
import { PreferencesTab } from "./preferences-tab"
import { ProfileSummary } from "./profile-summary"
import { ProfileTab } from "./profile-tab"
import type { AccountUser } from "./types"
import { useAccountDeletion } from "./use-account-deletion"
import { usePreferencesForm } from "./use-preferences-form"
import { useProfileForm } from "./use-profile-form"

export function AccountContent({ user, profile }: { user: AccountUser; profile: Profile }) {
  const supabase = useMemo(() => createClient(), [])
  const { refreshProfile } = useUser()

  const profileForm = useProfileForm(supabase, user.id, profile, refreshProfile)
  const preferences = usePreferencesForm(supabase, user.id, profile, refreshProfile)
  const deletion = useAccountDeletion(supabase, user.id)

  const joinDate = useMemo(
    () =>
      (user.created_at ? new Date(user.created_at) : new Date()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [user.created_at],
  )

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
        <ProfileSummary user={user} profile={profile} joinDate={joinDate} onAvatarUpload={profileForm.updateAvatar} />

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

            <ProfileTab
              fullname={profileForm.fullname}
              onFullname={profileForm.setFullname}
              username={profileForm.username}
              onUsername={profileForm.setUsername}
              website={profileForm.website}
              onWebsite={profileForm.setWebsite}
              updating={profileForm.updating}
              onSubmit={profileForm.submit}
            />
            <AccountTab user={user} onDelete={deletion.openDialog} />
            <PreferencesTab
              styles={preferences.styles}
              diets={preferences.diets}
              onToggleStyle={preferences.toggleStyle}
              onToggleDiet={preferences.toggleDiet}
              saving={preferences.saving}
              onSave={preferences.save}
            />
          </Tabs>
        </div>
      </div>

      <DeleteAccountDialog
        open={deletion.open}
        onOpenChange={deletion.onOpenChange}
        onCancel={deletion.closeDialog}
        confirmText={deletion.confirmText}
        onConfirmText={deletion.setConfirmText}
        deleting={deletion.deleting}
        onDelete={deletion.remove}
      />
    </div>
  )
}
