"use client"

import { motion } from "framer-motion"
import { AlertCircle, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { useMemo } from "react"

import type { MapActivity } from "./leaflet-map"

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
})

interface ItineraryMapProps {
  destination: string
  lat: number
  lng: number
  activities: MapActivity[]
}

export default function ItineraryMap({ destination, lat, lng, activities }: ItineraryMapProps) {
  const center = useMemo<[number, number]>(() => [Number(lat), Number(lng)], [lat, lng])
  const valid = Number.isFinite(center[0]) && Number.isFinite(center[1]) && !(center[0] === 0 && center[1] === 0)

  return (
    <motion.div className="relative h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {valid ? (
        <LeafletMap center={center} activities={activities} destination={destination} />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="max-w-xs rounded-md bg-background p-4 text-center shadow-md">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
            <p className="font-medium text-destructive">Map unavailable</p>
            <p className="mt-1 text-sm text-muted-foreground">This itinerary has no valid destination coordinates.</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
