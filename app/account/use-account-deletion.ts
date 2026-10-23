"use client"

import type { SupabaseClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { deleteAccount } from "@/lib/data/profiles"

export function useAccountDeletion(supabase: SupabaseClient, userId: string) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  async function remove() {
    setDeleting(true)
    try {
      await deleteAccount(supabase, userId)
      router.replace("/")
      router.refresh()
    } catch (error) {
      console.error("Delete account error:", error)
      toast.error("We couldn't delete your account. Please try again.")
      setDeleting(false)
    }
  }

  return {
    open,
    openDialog: () => setOpen(true),
    closeDialog: () => setOpen(false),
    onOpenChange: (next: boolean) => !deleting && setOpen(next),
    confirmText,
    setConfirmText,
    deleting,
    remove,
  }
}
