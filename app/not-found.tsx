"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowLeft, Compass, MapPin } from "lucide-react"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="relative mx-auto mb-6">
          {/* Animated compass */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 sm:h-40 sm:w-40"
          >
            <Compass className="h-16 w-16 text-primary sm:h-20 sm:w-20" />
          </motion.div>

          {/* Animated pin that bounces */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.8,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="absolute bottom-0 right-0 flex h-12 w-12 items-center justify-center rounded-full bg-destructive shadow-lg"
          >
            <MapPin className="h-6 w-6 text-white" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-md"
      >
        <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">Oops! Trail not found</h1>
        <p className="mb-6 text-muted-foreground">
          It seems you've wandered off the beaten path. Even the most adventurous travelers sometimes get lost!
        </p>

        <div className="mb-8 rounded-lg bg-muted p-4 text-sm">
          <p className="italic">"Not all who wander are lost, but in this case... you definitely are."</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home Base
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/my-itineraries">View My Itineraries</Link>
          </Button>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] top-[20%] h-[40vh] w-[40vh] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-[10%] bottom-[20%] h-[30vh] w-[30vh] rounded-full bg-primary/5 blur-3xl" />
      </div>
    </div>
  )
}
