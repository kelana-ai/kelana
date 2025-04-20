"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Wallet } from "lucide-react"
import { useEffect, useState } from "react"

interface BudgetCardProps {
  budgetTotal: number
  budgetSpent: number
  budgetRemaining: number
}

export function BudgetCard({ budgetTotal, budgetSpent, budgetRemaining }: BudgetCardProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((budgetSpent / budgetTotal) * 100)
    }, 300)

    return () => clearTimeout(timer)
  }, [budgetSpent, budgetTotal])

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg overflow-visible my-4 pt-0">
      <CardHeader className="bg-primary/5 border-b pt-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-5 w-5 text-primary" />
          Budget Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 overflow-visible">
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between">
              <span className="text-sm text-muted-foreground">Total Budget</span>
              <span className="font-medium">${budgetTotal}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center bg-muted rounded-lg p-3"
            >
              <p className="text-xs text-muted-foreground">Spent</p>
              <p className="font-medium">${budgetSpent}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center bg-muted rounded-lg p-3"
            >
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="font-medium">${budgetRemaining}</p>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
