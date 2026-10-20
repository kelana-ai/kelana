import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

// Behind a reverse proxy request.url can carry the internal host, so prefer the configured site URL, then the forwarded host.
function siteUrl(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  return host ? `${host.startsWith('localhost') ? 'http' : proto}://${host}` : request.nextUrl.origin
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
  }

  return NextResponse.redirect(new URL('/', siteUrl(request)), { status: 303 })
}
