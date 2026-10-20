"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Calendar, ChevronLeft, MapPin, MessageSquare } from "lucide-react"
import Link from "next/link"

interface ItineraryHeaderProps {
  name: string
  destination: string
  dateRange: string
  id: string
  status: string
}

export function ItineraryHeader({ name, destination, dateRange, id, status }: ItineraryHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-primary/10 border-b mb-6"
    >
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" asChild className="h-8 gap-1">
                <Link href="/dashboard">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              <div className="h-8 px-3 rounded-md bg-primary/20 flex items-center text-sm font-medium text-primary">
                Eco-Friendly Trip
              </div>
              {status && (
                <div className="h-8 px-3 rounded-md bg-muted flex items-center text-sm font-medium">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{destination}</span>
              </div>
              <span className="hidden sm:inline text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{dateRange}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 self-start">
            <Button asChild>
              <Link href={`/itinerary/${id}/refine`}>
                <MessageSquare className="mr-1 h-4 w-4" />
                Refine with AI
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
