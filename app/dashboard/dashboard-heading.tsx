import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardHeading({ isLoading, name }: { isLoading: boolean; name: string }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      {isLoading ? (
        <div>
          <Skeleton className="mb-2 h-10 w-[250px]" />
          <Skeleton className="h-5 w-[180px]" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-primary">{name}</span>
          </h1>
          <p className="text-muted-foreground">Your trips, budget and estimated carbon savings</p>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        {isLoading ? (
          <Skeleton className="h-10 w-[180px]" />
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <Button asChild>
              <Link href="/itinerary/new">
                <Plus className="mr-2 h-4 w-4" /> Create New Itinerary
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
