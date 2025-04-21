"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"

interface MapComponentProps {
  onLocationSelect: (location: { name: string; lat: number; lng: number }) => void
  initialSearchQuery?: string
}

const MapComponent = forwardRef<{ setLocation: (location: { lat: number; lng: number }) => void }, MapComponentProps>(
  ({ onLocationSelect }, ref) => {
    const mapRef = useRef<L.Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const markerRef = useRef<L.Marker | null>(null)

    useImperativeHandle(ref, () => ({
      setLocation: (location: { lat: number; lng: number }) => {
        if (!mapRef.current) return

        if (markerRef.current) {
          markerRef.current.setLatLng([location.lat, location.lng])
        } else {
          markerRef.current = L.marker([location.lat, location.lng]).addTo(mapRef.current)
        }

        mapRef.current.setView([location.lat, location.lng], 12)
      },
    }))

    useEffect(() => {
      if (!mapContainerRef.current) return

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })

      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [0, 0],
          zoom: 2,
          layers: [
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }),
          ],
        })

        map.on("click", (e) => {
          const { lat, lng } = e.latlng
          reverseGeocode(lat, lng)
        })

        mapRef.current = map
      }

      return () => {
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }
      }
    }, [])

    const reverseGeocode = async (lat: number, lng: number) => {
      try {
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

        if (data && data.display_name) {
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng])
          } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current!)
          }

          onLocationSelect({
            name: data.display_name,
            lat,
            lng,
          })
        }
      } catch (error) {
        console.error("Error reverse geocoding:", error)
      }
    }

    return (
      <div className="relative h-full w-full z-10">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>
    )
  },
)

MapComponent.displayName = "MapComponent"

export default MapComponent
