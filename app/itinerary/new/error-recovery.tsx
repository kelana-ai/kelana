"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { AlertCircle, ArrowLeft } from "lucide-react"

interface ErrorRecoveryProps {
  error: Error | string
  onRetry: () => void
  onCancel: () => void
}

export function ErrorRecovery({ error, onRetry, onCancel }: ErrorRecoveryProps) {
  const errorMessage = typeof error === "string" ? error : error.message || "An unknown error occurred"

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-destructive/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-2 text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <CardTitle>Generation Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              We encountered an issue while generating your itinerary. This could be due to:
            </p>
            <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
              <li>Temporary service disruption</li>
              <li>Network connectivity issues</li>
              <li>High server load</li>
              <li>Unusual destination or requirements</li>
            </ul>
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-medium">Error details:</p>
              <p className="mt-1 break-words">{errorMessage}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Form
            </Button>
            <Button className="w-full sm:w-auto" onClick={onRetry}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
