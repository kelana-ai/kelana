import { createClient } from '@/utils/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenHash = searchParams.get('token_hash')
    const otpType = searchParams.get('type') as EmailOtpType | null

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const successUrl = new URL('/auth/verified', siteUrl)
    const errorUrl = new URL('/error', siteUrl)

    if (!tokenHash || !otpType) {
      return NextResponse.redirect(errorUrl)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ 
      type: otpType, 
      token_hash: tokenHash 
    })

    return error 
      ? NextResponse.redirect(errorUrl)
      : NextResponse.redirect(successUrl)

  } catch (err) {
    console.error('Confirmation error:', err)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return NextResponse.redirect(new URL('/error', siteUrl))
  }
}
