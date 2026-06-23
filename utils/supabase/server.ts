import { createServerClient } from '@supabase/ssr'
import { cookies as getCookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function createClient(options?: { request?: NextRequest }) {
  const cookieStore = await Promise.resolve(
    options?.request ? options.request.cookies : getCookies()
  )

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  }

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => {
        if (typeof cookieStore.getAll === 'function') {
          return cookieStore.getAll()
        }
        return []
      },
      setAll: (cookiesToSet) => {
        if (typeof (cookieStore as any).set === 'function') {
          try {
            for (const cookie of cookiesToSet) {
              ;(cookieStore as any).set(cookie)
            }
          } catch (error) {
            console.warn('Failed to set cookies:', error)
          }
        } else {
          console.warn('Cookie store does not support setting cookies in this context.')
        }
      },
    },
  })
}
