"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"

import { destinationIcon } from "@/lib/leaflet-icons"

export interface MapActivity {
  title: string
  description?: string
  lat: number
  lng: number
  time?: string
  eco_tag?: string
  day?: string
}

interface LeafletMapProps {
  center: [number, number]
  activities: MapActivity[]
  destination: string
}

function line(className: string, text: string) {
  const el = document.createElement("div")
  el.className = className
  el.textContent = text
  return el
}

// Popup content is built from DOM nodes (textContent) so AI-generated text can never inject markup.
function popupFor(activity: MapActivity) {
  const root = document.createElement("div")
  root.className = "p-1"
  root.append(line("font-medium", activity.title))
  const meta = [activity.day, activity.time].filter(Boolean).join(" · ")
  if (meta) root.append(line("text-xs text-muted-foreground", meta))
  if (activity.description) root.append(line("text-sm mt-1", activity.description))
  if (activity.eco_tag) root.append(line("text-xs mt-1 text-primary font-medium", activity.eco_tag))
  return root
}

const numberIcon = (n: number) =>
  L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #10b981;box-shadow:0 2px 5px rgba(0,0,0,.2)"><span style="color:#10b981;font-weight:bold;font-size:12px">${n}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  })

export default function LeafletMap({ center, activities, destination }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const map = L.map(containerRef.current, { center, zoom: 13, zoomControl: false })
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    L.control.zoom({ position: "topright" }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
    // The map is created once; markers and the viewport are updated by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    layer.clearLayers()
    const destinationLabel = document.createElement("div")
    destinationLabel.className = "font-medium p-1"
    destinationLabel.textContent = destination
    L.marker(center, { icon: destinationIcon() }).bindPopup(destinationLabel).addTo(layer)

    const bounds = L.latLngBounds([center])
    activities.forEach((activity, index) => {
      const position: [number, number] = [activity.lat, activity.lng]
      L.marker(position, { icon: numberIcon(index + 1) }).bindPopup(popupFor(activity)).addTo(layer)
      bounds.extend(position)
    })

    if (activities.length > 0) map.fitBounds(bounds, { padding: [50, 50] })
    else map.setView(center, 13)
  }, [center, activities, destination])

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-md" />
}
