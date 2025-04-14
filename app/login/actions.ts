import { createClient } from "@/utils/supabase/client"

export async function login(formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error }
  }
  return { success: true }
}
