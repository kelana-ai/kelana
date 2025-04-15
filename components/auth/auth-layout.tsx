"use client"

import { motion } from "framer-motion"
import { Leaf } from "lucide-react"
import type { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  description: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="mb-6 flex flex-col items-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-center text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">{description}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeInOut" }}
        >
          {children}
        </motion.div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Kelana. All rights reserved.</p>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] left-[20%] h-[80vh] w-[80vh] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[30%] right-[20%] h-[70vh] w-[70vh] rounded-full bg-primary/5 blur-3xl" />
      </div>
    </div>
  )
}
