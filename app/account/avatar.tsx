"use client"

import { useUser } from "@/contexts/user-context"
import { avatarProblem } from "@/lib/avatar"
import { createClient } from "@/utils/supabase/client"
import { Camera, Loader2, UserIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"
import { replaceAvatar } from "@/lib/data/avatars"

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string | null
  url: string | null
  size: number
  onUpload: (path: string) => Promise<boolean>
}) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const { avatarUrl } = useUser()

  const displayAvatarUrl = avatarUrl && avatarUrl !== failedSrc ? avatarUrl : null

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const input = event.target
    const file = input.files?.[0]
    input.value = ""
    if (!file || !uid) return

    const problem = avatarProblem(file)
    if (problem) {
      toast.error(problem)
      return
    }

    setUploading(true)
    try {
      await replaceAvatar(supabase, uid, file, url, onUpload)
    } catch (error) {
      console.error("Avatar upload error:", error)
      toast.error("Error uploading avatar")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative mx-auto">
      <div
        className="relative h-[150px] w-[150px] overflow-hidden rounded-full border-4 border-muted bg-muted/20"
        style={{ width: size, height: size }}
      >
        {displayAvatarUrl ? (
          <Image
            src={displayAvatarUrl}
            alt="Avatar"
            unoptimized
            className="object-cover"
            fill
            sizes={`${size}px`}
            priority
            onError={() => setFailedSrc(displayAvatarUrl)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30">
            <UserIcon className="h-16 w-16 text-muted-foreground/60" />
          </div>
        )}
      </div>
      <label
        htmlFor="avatar-upload"
        className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/90 focus:ring-offset-2"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-5 w-5" />}
        <span className="sr-only">Change Avatar</span>
        <input
          type="file"
          id="avatar-upload"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={uploadAvatar}
          disabled={uploading}
          className="sr-only"
        />
      </label>
    </div>
  )
}
