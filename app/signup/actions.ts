import { createClient } from '@/utils/supabase/client'

export async function signup(formData: FormData, captchaToken?: string) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({ ...data, options: { captchaToken } })

  if (error) {
    return { error }
  }

  return { success: true }
}
