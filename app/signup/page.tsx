"use client"

import { motion } from "framer-motion"
import { AlertCircle, Info, Loader2, Lock, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useEffect, useState } from "react"
import { toast } from "sonner"

import { useUser } from "@/contexts/user-context"
import { signup } from "./actions"

import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setPasswordsMatch(false)
      setIsSubmitting(false)
      return
    }

    setPasswordsMatch(true)
    const result = await signup(formData)

    setIsSubmitting(false)
    if (result?.error) {
      setError(result.error.message)
    } else {
      toast.success("Signup successful! Please check your email for the confirmation link.")
      router.push("/login")
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      description="Join Kelana to start planning your eco-conscious travel experiences"
    >
      {isLoading || user ? (
        <AuthFormSkeleton />
      ) : (
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="pl-9"
                    aria-describedby="email-description"
                  />
                </div>
                <p id="email-description" className="text-xs text-muted-foreground">
                  We'll send a confirmation link to this email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    className="pl-9"
                    aria-describedby="password-requirements"
                  />
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground" id="password-requirements">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>Password must be at least 8 characters long</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className={`pl-9 ${!passwordsMatch ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    aria-describedby="confirm-password-error"
                  />
                </div>
                {!passwordsMatch && (
                  <p id="confirm-password-error" className="text-xs text-destructive">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      )}
    </AuthLayout>
  )
}
