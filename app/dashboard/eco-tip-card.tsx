import { motion } from "framer-motion"
import { Leaf } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { riseIn } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function EcoTipCard({ fact, isLoading }: { fact: string; isLoading: boolean }) {
  return (
    <motion.div variants={riseIn}>
      <Card
        className={cn(
          isLoading ? "" : "bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20",
        )}
      >
        {isLoading ? (
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-[180px]" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-9 w-[150px]" />
          </div>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                  <Leaf className="h-4 w-4 text-primary" />
                </div>
                <span>Eco Travel Tip</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic text-muted-foreground">"{fact}"</p>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="px-0 text-primary" asChild>
                <Link href="/about">Learn more about greener travel</Link>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </motion.div>
  )
}
