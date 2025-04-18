"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet"

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface MapComponentProps {
  onLocationSelect: (location: { name: string; lat: number; lng: number }) => void
}

export default function MapComponent({ onLocationSelect }: MapComponentProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const [locationName, setLocationName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 5)
          }
        },
        () => {
          if (mapRef.current) {
            mapRef.current.setView([20, 0], 2)
          }
        },
      )
    }
  }, [])

  function MapClickHandler() {
    useMapEvents({
      click: async (e) => {
        setPosition(e.latlng)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&zoom=10`,
          )
          const data = await response.json()
          const name = data.display_name.split(",").slice(0, 2).join(", ")
          setLocationName(name)
          onLocationSelect({ name, lat: e.latlng.lat, lng: e.latlng.lng })
        } catch (error) {
          console.error("Error fetching location name:", error)
          setLocationName("Unknown location")
          onLocationSelect({ name: "Unknown location", lat: e.latlng.lat, lng: e.latlng.lng })
        }
      },
    })
    return null
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      )
      const data = await response.json()
      setSearchResults(data.slice(0, 5))
    } catch (error) {
      console.error("Error searching locations:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectSearchResult = (result: any) => {
    const lat = Number.parseFloat(result.lat)
    const lng = Number.parseFloat(result.lon)
    setPosition(new L.LatLng(lat, lng))
    setLocationName(result.display_name.split(",").slice(0, 2).join(", "))
    onLocationSelect({ name: result.display_name.split(",").slice(0, 2).join(", "), lat, lng })
    setSearchResults([])

    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 10)
    }
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-2 right-2 top-2 z-[1000] flex gap-2">
        <Input
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="bg-white/90 dark:bg-gray-800/90"
        />
        <Button size="sm" onClick={handleSearch} disabled={isSearching}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="absolute left-2 right-2 top-14 z-[1000] max-h-40 overflow-y-auto rounded-md bg-white/95 shadow-md dark:bg-gray-800/95">
          <ul className="divide-y">
            {searchResults.map((result, index) => (
              <li
                key={index}
                className="cursor-pointer p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => selectSearchResult(result)}
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        {position && (
          <Marker position={position} icon={icon}>
            {locationName && <Popup>{locationName}</Popup>}
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
