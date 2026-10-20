"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"

import { destinationIcon } from "@/lib/leaflet-icons"

interface MapComponentProps {
  /** The selected place; the marker and viewport follow it, so the map always matches the form. */
  value?: { lat?: number; lng?: number } | null
  onLocationSelect: (location: { name: string; lat: number; lng: number }) => void
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    {
      headers: {
        "Accept-Language": "en",
      },
    },
  )

  if (!response.ok) {
    throw new Error("Failed to get location details")
  }

  const data = await response.json()
  return data?.display_name ?? null
}

export default function MapComponent({ value, onLocationSelect }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onSelectRef = useRef(onLocationSelect)

  useEffect(() => {
    onSelectRef.current = onLocationSelect
  })

  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [0, 0],
      zoom: 2,
      layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }),
      ],
    })

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng
      try {
        const name = await reverseGeocode(lat, lng)
        if (name) onSelectRef.current({ name, lat, lng })
      } catch (error) {
        console.error("Error reverse geocoding:", error)
      }
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  const lat = value?.lat
  const lng = value?.lng

  useEffect(() => {
    const map = mapRef.current
    if (!map || lat === undefined || lng === undefined) return

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.marker([lat, lng], { icon: destinationIcon() }).addTo(map)
    }

    map.setView([lat, lng], Math.max(map.getZoom(), 12))
  }, [lat, lng])

  return (
    <div className="relative h-full w-full z-10">
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  )
}
