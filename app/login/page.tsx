"use client"

import { Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"

import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton"
import { AuthField, AuthFooter, AuthFormCard, AuthSubmitButton } from "@/components/auth/auth-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { useCaptcha } from "@/components/turnstile"
import { useRedirectSignedIn } from "@/contexts/use-redirect-signed-in"
import { useUser } from "@/contexts/user-context"
import { login } from "./actions"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user, isLoading } = useUser()
  const router = useRouter()

  useRedirectSignedIn()
  const captcha = useCaptcha()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const result = await login(formData, captcha.token ?? undefined)

    if (result?.error) {
      setError(result.error.message)
      captcha.reset()
      setIsSubmitting(false)
      return
    }
    router.push("/dashboard")
  }

  return (
    <AuthLayout title="Welcome back" description="Sign in to your account">
      {(isLoading || user) && !isSubmitting ? (
        <AuthFormSkeleton />
      ) : (
        <AuthFormCard
          onSubmit={handleSubmit}
          error={error}
          footer={<AuthFooter prompt="Don't have an account?" href="/signup" linkLabel="Sign up" />}
        >
          <AuthField
            id="email"
            label="Email address"
            icon={Mail}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="pl-9"
          />
          <AuthField
            id="password"
            label="Password"
            icon={Lock}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="pl-9"
          />
          {captcha.widget}
          <AuthSubmitButton pending={isSubmitting} blocked={captcha.enabled && !captcha.token} pendingLabel="Signing in..." label="Sign in" />
        </AuthFormCard>
      )}
    </AuthLayout>
  )
}
