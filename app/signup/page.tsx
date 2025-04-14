import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SignupForm from './signup-form'

export default async function SignupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/account')
  }

  return <SignupForm />
}
