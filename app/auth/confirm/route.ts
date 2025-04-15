import { createClient } from '@/utils/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  const nextPath = '/account'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectTo = new URL(nextPath, siteUrl)

  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')

  if (!token_hash || !type) {
    redirectTo.pathname = '/error'
    return NextResponse.redirect(redirectTo)
  }

  try {
    const supabase = await createClient({ request })
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error && data?.session) {
      const response = NextResponse.redirect(redirectTo)
      response.cookies.set('sb-access-token', data.session.access_token, { path: '/' })
      response.cookies.set('sb-refresh-token', data.session.refresh_token, { path: '/' })
      return response
    } else {
      console.error("Error verifying OTP:", error?.message || "Unknown error")
    }
  } catch (err) {
    console.error("Exception during OTP verification:", err)
  }

  redirectTo.pathname = '/error'
  return NextResponse.redirect(redirectTo)
}
