"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"

const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

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

interface LeafletMapProps {
  center: [number, number]
  activities?: Activity[]
  destination: string
}

export default function LeafletMap({ center, activities = [], destination }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    fixLeafletIcons()

    if (!mapContainerRef.current) return

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 13,
        layers: [
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }),
        ],
        zoomControl: false,
      })

      L.control.zoom({ position: "topright" }).addTo(map)

      mapRef.current = map
    } else {
      mapRef.current.setView(center, 13)
    }

    const destinationIcon = L.divIcon({
      className: "custom-div-icon",
      html: `
        <div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    })

    const destinationMarker = L.marker(center, { icon: destinationIcon })
      .addTo(mapRef.current)
      .bindPopup(`<div class="font-medium p-1">${destination}</div>`)

    return () => {
      if (destinationMarker) {
        destinationMarker.remove()
      }
    }
  }, [center, destination])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    if (activities.length > 0) {
      const bounds = L.latLngBounds([center])
      bounds.extend(center)

      activities.forEach((activity, index) => {
        let activityLocation: [number, number]

        if (activity.location?.lat && activity.location?.lng) {
          activityLocation = [activity.location.lat, activity.location.lng]
        } else {
          const lat = center[0] + (Math.random() - 0.5) * 0.02
          const lng = center[1] + (Math.random() - 0.5) * 0.02
          activityLocation = [lat, lng]
        }

        const activityIcon = L.divIcon({
          className: "custom-div-icon",
          html: `
            <div style="background-color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #10b981; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
              <span style="color: #10b981; font-weight: bold; font-size: 12px;">${index + 1}</span>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 26],
        })

        const marker = L.marker(activityLocation, { icon: activityIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div class="p-1">
              <div class="font-medium">${activity.title}</div>
              ${activity.time ? `<div class="text-xs text-muted-foreground">${activity.time}</div>` : ""}
              ${activity.description ? `<div class="text-sm mt-1">${activity.description}</div>` : ""}
              ${activity.eco_tag ? `<div class="text-xs mt-1 text-primary font-medium">${activity.eco_tag}</div>` : ""}
            </div>
          `)

        markersRef.current.push(marker)
        bounds.extend(activityLocation)
      })

      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [activities, center])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return <div ref={mapContainerRef} className="w-full h-full rounded-md overflow-hidden" />
}
