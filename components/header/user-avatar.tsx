import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Profile } from "@/contexts/user-context"
import { initialOf } from "@/lib/display-name"

interface UserAvatarProps {
  className: string
  avatarUrl: string | null
  profile: Profile | null
  email: string | undefined
}

export function UserAvatar({ className, avatarUrl, profile, email }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl || undefined} alt={profile?.full_name || email || "User"} />
      <AvatarFallback className="bg-primary/10 text-primary">{initialOf(profile, email)}</AvatarFallback>
    </Avatar>
  )
}
