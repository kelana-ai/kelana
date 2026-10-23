import { AtSign, Calendar, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Profile } from "@/lib/data/profiles"
import { displayName } from "@/lib/display-name"
import Avatar from "./avatar"
import type { AccountUser } from "./types"

interface ProfileSummaryProps {
  user: AccountUser
  profile: Profile
  joinDate: string
  onAvatarUpload: (path: string) => Promise<boolean>
}

export function ProfileSummary({ user, profile, joinDate, onAvatarUpload }: ProfileSummaryProps) {
  return (
    <Card className="md:col-span-1">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <Avatar uid={user.id} url={profile.avatar_url} size={150} onUpload={onAvatarUpload} />
          <h2 className="mt-4 text-xl font-semibold">{displayName(profile, user.email)}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {joinDate}</span>
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
  )
}
