"use client"

import { motion } from "framer-motion"
import { AlertCircle, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

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

interface Activity {
  title: string
  description?: string
  location?: {
    name?: string
    lat?: number
    lng?: number
  }
  type?: string
  eco_tag?: string
  time?: string
}

interface ItineraryMapProps {
  destination: string
  destinationCoords: [number, number]
  activities?: Activity[]
}

export default function ItineraryMap({ destination, destinationCoords, activities = [] }: ItineraryMapProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (destinationCoords && destinationCoords[0] !== 0 && destinationCoords[1] !== 0) {
      setIsLoading(false)
      return
    }

    const geocodeDestination = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          },
        )

        if (!response.ok) {
          throw new Error("Failed to geocode destination")
        }

        const data = await response.json()

        if (data && data.length > 0) {
          const lat = Number.parseFloat(data[0].lat)
          const lon = Number.parseFloat(data[0].lon)

          if (isNaN(lat) || isNaN(lon)) {
            throw new Error("Invalid coordinates received")
          }
        } else {
          setError(`Could not find location: ${destination}`)
        }
      } catch (err) {
        console.error("Error geocoding destination:", err)
        setError("Failed to load map data")
      } finally {
        setIsLoading(false)
      }
    }

    if (destination) {
      geocodeDestination()
    }

    return () => {}
  }, [destination, destinationCoords])

  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 z-10">
          <div className="bg-background p-4 rounded-md shadow-md max-w-xs text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="font-medium text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">Please check the destination or try again later.</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <LeafletMap center={destinationCoords} activities={activities} destination={destination} />
      )}

      {isLoading && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading map data...</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
