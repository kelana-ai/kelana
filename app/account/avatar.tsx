"use client"

import { useUser } from "@/contexts/user-context"
import { createClient } from "@/utils/supabase/client"
import { Upload, UserIcon } from 'lucide-react'
import Image from "next/image"
import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string | null
  url: string | null
  size: number
  onUpload: (url: string) => void
}) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const { avatarUrl: contextAvatarUrl } = useUser()

  const displayAvatarUrl = contextAvatarUrl || null

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      toast.error("Error uploading avatar")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-[150px] w-[150px] overflow-hidden rounded-full border-4 border-muted bg-muted/20">
        {displayAvatarUrl ? (
          <Image
            src={displayAvatarUrl || "/placeholder.svg"}
            alt="Avatar"
            className="object-cover"
            fill
            sizes="150px"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30">
            <UserIcon className="h-16 w-16 text-muted-foreground/60" />
          </div>
        )}
      </div>

      <label
        htmlFor="avatar-upload"
        className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/90 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {uploading ? (
          <>
            <span className="animate-spin">◌</span>
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span>Change Avatar</span>
          </>
        )}
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="sr-only"
        />
      </label>
    </div>
  )
}
