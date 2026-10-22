"use client"

import { Info, Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import { toast } from "sonner"

import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton"
import { AuthField, AuthFooter, AuthFormCard, AuthSubmitButton } from "@/components/auth/auth-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { useRedirectSignedIn } from "@/contexts/use-redirect-signed-in"
import { useUser } from "@/contexts/user-context"
import { signup } from "./actions"

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const { user, isLoading } = useUser()
  const router = useRouter()

  useRedirectSignedIn()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setPasswordsMatch(false)
      setIsSubmitting(false)
      return
    }

    setPasswordsMatch(true)
    const result = await signup(formData)

    if (result?.error) {
      setError(result.error.message)
      setIsSubmitting(false)
      return
    }
    toast.success("Account created! You're now signed in.")
    router.push("/dashboard")
  }

  return (
    <AuthLayout title="Create an account" description="Create an account to plan and save trips">
      {(isLoading || user) && !isSubmitting ? (
        <AuthFormSkeleton />
      ) : (
        <AuthFormCard
          onSubmit={handleSubmit}
          error={error}
          footer={<AuthFooter prompt="Already have an account?" href="/login" linkLabel="Sign in" />}
        >
          <AuthField
            id="email"
            label="Email"
            icon={Mail}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className="pl-9"
          />
          <AuthField
            id="password"
            label="Password"
            icon={Lock}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="pl-9"
            aria-describedby="password-requirements"
          >
            <div className="flex items-start gap-2 text-xs text-muted-foreground" id="password-requirements">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Password must be at least 8 characters long</span>
            </div>
          </AuthField>
          <AuthField
            id="confirmPassword"
            label="Confirm Password"
            icon={Lock}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className={`pl-9 ${!passwordsMatch ? "border-destructive focus-visible:ring-destructive" : ""}`}
            aria-describedby="confirm-password-error"
          >
            {!passwordsMatch && (
              <p id="confirm-password-error" className="text-xs text-destructive">
                Passwords do not match
              </p>
            )}
          </AuthField>
          <AuthSubmitButton pending={isSubmitting} pendingLabel="Creating account..." label="Create account" />
        </AuthFormCard>
      )}
    </AuthLayout>
  )
}
