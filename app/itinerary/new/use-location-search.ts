import { useState } from "react"
import { toast } from "sonner"

export type LatLng = { name: string; lat: number; lng: number }
type GeoResult = { display_name: string; lat: string; lon: string }

export function useLocationSearch(onSelect: (location: LatLng) => void) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GeoResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const search = async () => {
    if (!query.trim()) return

    try {
      setIsSearching(true)

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { "Accept-Language": "en" } },
      )

      if (!response.ok) {
        throw new Error("Failed to search location")
      }

      const data: GeoResult[] = await response.json()

      if (data && data.length > 0) {
        setResults(data)
        setShowResults(true)
      } else {
        toast.error("Location not found. Try a different search term.")
        setResults([])
      }
    } catch (error) {
      console.error("Error searching location:", error)
      toast.error("Failed to search location. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const selectResult = (result: GeoResult) => {
    setQuery(result.display_name)
    setShowResults(false)
    onSelect({
      name: result.display_name,
      lat: Number.parseFloat(result.lat),
      lng: Number.parseFloat(result.lon),
    })
  }

  return { query, setQuery, results, isSearching, showResults, search, selectResult }
}
