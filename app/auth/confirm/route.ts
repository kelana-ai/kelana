import { createClient } from '@/utils/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenHash = searchParams.get('token_hash')
    const otpType = searchParams.get('type') as EmailOtpType | null

    const defaultSuccessPath = '/dashboard'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const redirectUrl = new URL(defaultSuccessPath, siteUrl)

    redirectUrl.searchParams.delete('token_hash')
    redirectUrl.searchParams.delete('type')

    if (!tokenHash || !otpType) {
      redirectUrl.pathname = '/error'
      return NextResponse.redirect(redirectUrl)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type: otpType, token_hash: tokenHash })

    if (error) {
      console.error('OTP verification failed:', error.message)
      redirectUrl.pathname = '/error'
    } else {
      redirectUrl.searchParams.delete('next')
    }

    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error('Unexpected error during OTP confirmation:', err)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const errorUrl = new URL('/error', siteUrl)
    return NextResponse.redirect(errorUrl)
  }
}
