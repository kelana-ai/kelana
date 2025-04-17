"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@/contexts/user-context"
import { createClient } from "@/utils/supabase/client"
import type { EmailOtpType } from "@supabase/supabase-js"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ThumbsUp,
  Unlock,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function ConfirmPage() {
  const params = useSearchParams()
  const router = useRouter()
  const tokenHash = params.get("token_hash")
  const type = params.get("type") as EmailOtpType | null
  const errorMessage = params.get("error_description")

  const { user, isLoading } = useUser()
  const [status, setStatus] = useState<"verifying" | "success" | "error">(errorMessage ? "error" : "verifying")
  const [verifyProgress, setVerifyProgress] = useState(0)
  const [progress, setProgress] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(5)
  const [error, setError] = useState(errorMessage || "")
  const [isResending, setIsResending] = useState(false)
  const [redirectAllowed, setRedirectAllowed] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  const countdownInitialized = useRef(false)
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)
  const successTimestampRef = useRef<number | null>(null)

  useEffect(() => {
    if (status !== "verifying") return
    if (!tokenHash || !type) {
      setStatus("error")
      setError("Missing verification information. Please check your email link.")
      return
    }

    const supabase = createClient()
    const iv = setInterval(() => {
      setVerifyProgress((p) => Math.min(p + 10, 90))
    }, 100)

    supabase.auth.verifyOtp({ type, token_hash: tokenHash }).then(({ error }) => {
      clearInterval(iv)
      setVerifyProgress(100)

      setTimeout(() => {
        if (error) {
          setStatus("error")
          setError(error.message || "Verification failed. Please try again.")
        } else {
          successTimestampRef.current = Date.now()
          setStatus("success")
          setSecondsLeft(5)
          setProgress(0)
          setRedirectAllowed(false)
        }
      }, 500)
    })

    return () => clearInterval(iv)
  }, [status, tokenHash, type])

  useEffect(() => {
    if (status !== "success") return

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
    }

    setSecondsLeft(5)
    setProgress(0)
    countdownInitialized.current = true

    const endTime = Date.now() + 5000

    countdownTimerRef.current = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000))

      setSecondsLeft(remaining)
      const elapsedPercent = 100 - (remaining / 5) * 100
      setProgress(Math.min(elapsedPercent, 100))

      if (remaining <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current)
          countdownTimerRef.current = null
        }

        setRedirectAllowed(true)
      }
    }, 100)

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
      }
    }
  }, [status])

  useEffect(() => {
    if (status === "success" && redirectAllowed && animationComplete) {
      const timeOnSuccessPage = successTimestampRef.current ? Date.now() - successTimestampRef.current : 0

      if (timeOnSuccessPage >= 5000) {
        if (user) {
          router.push("/dashboard")
        } else if (!isLoading) {
          router.replace("/login")
        }
      }
    }
  }, [status, redirectAllowed, animationComplete, user, isLoading, router])

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      const email = localStorage.getItem("pendingVerificationEmail")
      if (!email) {
        setError("No email found for verification. Please sign up again.")
        setIsResending(false)
        return
      }

      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) throw error

      setError("")
      alert("Verification email resent! Please check your inbox.")
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const goToDashboard = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.replace("/login")
    }
  }

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  const cardVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.6, delay: 0.1 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } },
  }

  const iconContainerVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.3,
        type: "spring",
        stiffness: 200,
      },
    },
  }

  const successIconVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.5,
        type: "spring",
        stiffness: 200,
      },
    },
  }

  const contentVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.7,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  }

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  }

  return (
    <AnimatePresence mode="wait">
      {status === "verifying" && (
        <motion.div
          key="verifying"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-4"
        >
          <motion.div variants={cardVariants} className="w-full max-w-md">
            <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">Verifying Your Email</CardTitle>
                <CardDescription>Please wait while we secure your account</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pb-6">
                <motion.div
                  className="relative mx-auto h-32 w-32"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Outer circle */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-primary/20"
                    animate={{
                      boxShadow: ["0 0 0 0 rgba(var(--primary), 0.2)", "0 0 0 10px rgba(var(--primary), 0)"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeOut",
                    }}
                  />

                  {/* Middle circle */}
                  <motion.div
                    className="absolute inset-2 rounded-full border-4 border-primary/30"
                    animate={{
                      boxShadow: ["0 0 0 0 rgba(var(--primary), 0.3)", "0 0 0 10px rgba(var(--primary), 0)"],
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeOut",
                    }}
                  />

                  {/* Inner circle with icon */}
                  <motion.div
                    className="absolute inset-4 flex items-center justify-center rounded-full bg-primary/10"
                    animate={pulseAnimation}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Loader2 className="h-12 w-12 text-primary" />
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="space-y-2">
                    <Progress value={verifyProgress} className="h-2" />
                    <p className="text-center text-sm text-muted-foreground">Verifying your credentials...</p>
                  </div>

                  <motion.div
                    className="grid grid-cols-3 gap-2 pt-2"
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col items-center rounded-lg bg-muted/50 p-3 text-center"
                    >
                      <Mail className="mb-1 h-5 w-5 text-primary" />
                      <span className="text-xs font-medium">Checking Email</span>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col items-center rounded-lg bg-muted/50 p-3 text-center"
                    >
                      <Lock className="mb-1 h-5 w-5 text-primary" />
                      <span className="text-xs font-medium">Validating Token</span>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col items-center rounded-lg bg-muted/50 p-3 text-center"
                    >
                      <Shield className="mb-1 h-5 w-5 text-primary" />
                      <span className="text-xs font-medium">Securing Account</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {status === "success" && (
        <motion.div
          key="success"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          onAnimationComplete={() => setAnimationComplete(true)}
          className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background p-4"
        >
          <motion.div variants={cardVariants} className="w-full max-w-md">
            <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
              <CardHeader className="relative pb-6 text-center">
                {/* Success animation */}
                <motion.div className="relative mx-auto mb-6 h-32 w-32" variants={iconContainerVariants}>
                  {/* Animated rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-green-200 dark:border-green-900/30"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />

                  <motion.div
                    className="absolute inset-3 rounded-full border-4 border-green-300 dark:border-green-800/40"
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 3,
                      delay: 0.2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Success icon container */}
                  <motion.div
                    className="absolute inset-6 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
                    animate={{
                      boxShadow: ["0 0 0 0 rgba(74, 222, 128, 0.4)", "0 0 0 20px rgba(74, 222, 128, 0)"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeOut",
                    }}
                  >
                    {/* Success icon */}
                    <motion.div variants={successIconVariants} className="rounded-full bg-green-500 p-3">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
                    Email Confirmed!
                  </CardTitle>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-6 pb-6">
                <motion.div variants={contentVariants} className="space-y-6">
                  <motion.p variants={itemVariants} className="text-center">
                    Your email address has been successfully verified.
                    <br />
                    You now have full access to all Kelana features.
                  </motion.p>

                  <motion.div variants={itemVariants} className="rounded-lg bg-primary/5 p-4">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">
                        Redirecting in {secondsLeft} second
                        {secondsLeft !== 1 && "s"}...
                      </p>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </motion.div>

                  <motion.div variants={itemVariants} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col items-center rounded-lg bg-muted/50 p-3 text-center transition-colors hover:bg-muted">
                      <motion.div
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: 360 }}
                        transition={{ delay: 1, duration: 1, type: "spring" }}
                      >
                        <Unlock className="mb-2 h-6 w-6 text-primary" />
                      </motion.div>
                      <span className="text-xs font-medium">Create eco-friendly travel itineraries</span>
                    </div>

                    <div className="flex flex-col items-center rounded-lg bg-muted/50 p-3 text-center transition-colors hover:bg-muted">
                      <motion.div
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: 360 }}
                        transition={{ delay: 1.2, duration: 1, type: "spring" }}
                      >
                        <ThumbsUp className="mb-2 h-6 w-6 text-primary" />
                      </motion.div>
                      <span className="text-xs font-medium">Access sustainability recommendations</span>
                    </div>

                    <div className="flex flex-col items-center rounded-lg bg-muted/50 p-3 text-center transition-colors hover:bg-muted">
                      <motion.div
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: 360 }}
                        transition={{ delay: 1.4, duration: 1, type: "spring" }}
                      >
                        <Shield className="mb-2 h-6 w-6 text-primary" />
                      </motion.div>
                      <span className="text-xs font-medium">Connect with conscious travelers</span>
                    </div>
                  </motion.div>
                </motion.div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="w-full"
                >
                  <Button className="w-full bg-green-600 text-white hover:bg-green-700" onClick={goToDashboard}>
                    Go to Dashboard Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/">Return to Home</Link>
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="mt-4 text-center text-sm text-muted-foreground"
            >
              Having trouble?{" "}
              <Link href="/support" className="text-primary hover:underline">
                Contact Support
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      )}

      {status === "error" && (
        <motion.div
          key="error"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-destructive/5 via-background to-background p-4"
        >
          <motion.div variants={cardVariants} className="w-full max-w-md">
            <Card className="overflow-hidden border-2 border-destructive/20 shadow-lg">
              <CardHeader className="text-center pb-2">
                <motion.div className="relative mx-auto mb-6 h-28 w-28" variants={iconContainerVariants}>
                  {/* Error animation */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-red-200 dark:border-red-900/30"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 0.5, 0.7],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />

                  <motion.div
                    className="absolute inset-4 rounded-full border-4 border-red-300 dark:border-red-800/40"
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.8, 0.6, 0.8],
                    }}
                    transition={{
                      duration: 3,
                      delay: 0.2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Error icon container */}
                  <motion.div
                    className="absolute inset-8 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
                    animate={{
                      boxShadow: ["0 0 0 0 rgba(248, 113, 113, 0.4)", "0 0 0 10px rgba(248, 113, 113, 0)"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeOut",
                    }}
                  >
                    {/* Error icon with shake animation */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.5,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="rounded-full bg-red-500 p-2"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, -5, 0, 5, 0],
                        }}
                        transition={{
                          duration: 0.5,
                          delay: 1,
                          repeat: 2,
                          ease: "easeInOut",
                        }}
                      >
                        <AlertCircle className="h-8 w-8 text-white" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                    Verification Failed
                  </CardTitle>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-5 pb-6">
                <motion.div variants={contentVariants} className="space-y-5">
                  <motion.div variants={itemVariants}>
                    <Alert variant="destructive" className="border-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="font-semibold">Error</AlertTitle>
                      <AlertDescription>
                        {error || "We couldn't verify your email. The link may have expired or is invalid."}
                      </AlertDescription>
                    </Alert>
                  </motion.div>

                  <motion.div variants={itemVariants} className="rounded-lg bg-muted p-4 text-sm">
                    <p className="font-medium">What you can do:</p>
                    <motion.ul
                      className="mt-2 space-y-2 text-muted-foreground"
                      variants={contentVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <motion.li variants={itemVariants} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/20 text-xs font-bold">
                          1
                        </span>
                        <span>Check if you clicked the correct link from your email</span>
                      </motion.li>
                      <motion.li variants={itemVariants} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/20 text-xs font-bold">
                          2
                        </span>
                        <span>Try resending the verification email</span>
                      </motion.li>
                      <motion.li variants={itemVariants} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/20 text-xs font-bold">
                          3
                        </span>
                        <span>Make sure your account is registered correctly</span>
                      </motion.li>
                      <motion.li variants={itemVariants} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/20 text-xs font-bold">
                          4
                        </span>
                        <span>Contact our support team if the issue persists</span>
                      </motion.li>
                    </motion.ul>
                  </motion.div>
                </motion.div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="w-full"
                >
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleResendVerification}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" /> Resend Verification Email
                      </>
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Return to Login</Link>
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="mt-4 text-center text-sm text-muted-foreground"
            >
              Need help?{" "}
              <Link href="/support" className="text-primary hover:underline">
                Contact Support
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
