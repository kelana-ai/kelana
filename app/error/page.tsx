"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function ErrorPage() {
  const [errorCode, setErrorCode] = useState<string>("")

  useEffect(() => {
    const randomCode = Math.floor(Math.random() * 900000) + 100000
    setErrorCode(`ERR-${randomCode}`)
  }, [])

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative mx-auto">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-destructive/10 sm:h-40 sm:w-40">
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                ease: "easeInOut",
              }}
            >
              <AlertTriangle className="h-16 w-16 text-destructive sm:h-20 sm:w-20" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-md"
      >
        <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">Something went wrong</h1>
        <p className="mb-4 text-muted-foreground">We encountered an unexpected issue while processing your request.</p>

        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">Error Reference: {errorCode}</p>
        </div>

        <p className="mb-8 text-muted-foreground">
          Please try again later or contact our support team if the problem persists.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/support">
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] top-[20%] h-[40vh] w-[40vh] rounded-full bg-destructive/5 blur-3xl" />
        <div className="absolute -right-[10%] bottom-[20%] h-[30vh] w-[30vh] rounded-full bg-destructive/5 blur-3xl" />
      </div>
    </div>
  )
}
