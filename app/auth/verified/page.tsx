"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@/contexts/user-context"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function VerifiedPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(5)

  useEffect(() => {
    if (!isLoading && user) {
      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            router.push("/dashboard")
            return 0
          }
          return prev - 1
        })

        setProgress((prev) => {
          const newProgress = prev + 20
          return newProgress > 100 ? 100 : newProgress
        })
      }, 1000)

      return () => clearInterval(interval)
    }

    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-md">
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="pb-4 text-center">
            <motion.div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
              variants={itemVariants}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                delay: 0.2,
              }}
            >
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold">Email Confirmed!</CardTitle>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-4 text-center">
            <motion.p variants={itemVariants} className="text-muted-foreground">
              Your email address has been successfully verified. You now have full access to all Kelana features.
            </motion.p>

            <motion.div variants={itemVariants} className="rounded-lg bg-primary/5 p-4">
              <p className="mb-2 text-sm font-medium">Redirecting to your dashboard in {secondsLeft} seconds...</p>
              <Progress value={progress} className="h-2" />
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Create and manage eco-friendly travel itineraries</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Access personalized sustainability recommendations</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Connect with our community of conscious travelers</span>
              </p>
            </motion.div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <motion.div variants={itemVariants} className="w-full">
              <Button className="w-full" onClick={() => router.push("/dashboard")}>
                Go to Dashboard Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </motion.div>
          </CardFooter>
        </Card>

        <motion.p variants={itemVariants} className="mt-4 text-center text-sm text-muted-foreground">
          Having trouble?{" "}
          <Link href="/support" className="text-primary hover:underline">
            Contact Support
          </Link>
        </motion.p>
      </motion.div>

      {/* Decorative elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] left-[20%] h-[80vh] w-[80vh] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[30%] right-[20%] h-[70vh] w-[70vh] rounded-full bg-primary/5 blur-3xl" />
      </div>
    </div>
  )
}
