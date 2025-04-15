"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface StatCardProps {
  icon: ReactNode
  value: string
  label: string
  className?: string
}

export function StatCard({ icon, value, label, className }: StatCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 10 }}>
      <Card className={cn("h-full overflow-hidden transition-all hover:shadow-md", className)}>
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
            {icon}
          </div>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
