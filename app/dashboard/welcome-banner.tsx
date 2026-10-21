"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

export function WelcomeBanner({ hidden }: { hidden: boolean }) {
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setExpired(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {!expired && !hidden && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 rounded-lg bg-primary/10 p-4 text-center"
        >
          <p className="text-sm font-medium text-primary">You're signed in</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
