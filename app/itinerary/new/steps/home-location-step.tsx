"use client"

import { Home, Loader2, Search } from "lucide-react"
import dynamic from "next/dynamic"
import { useRef } from "react"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { FormValues } from "../schema"
import { useLocationSearch } from "../use-location-search"

const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full items-center justify-center rounded-md border border-dashed">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
})

export function HomeLocationStep({ form }: { form: UseFormReturn<FormValues> }) {
  const mapRef = useRef<any>(null)
  const search = useLocationSearch((location) => {
    form.setValue("homeLocation", location)
    mapRef.current?.setLocation(location)
  })

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="homeLocation"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel>Your Home Location</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search for your home location..."
                      className="pl-9 pr-10"
                      value={search.query}
                      onChange={(e) => search.setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          search.search()
                        }
                      }}
                    />
                    {search.isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={() => search.search()}
                    disabled={search.isSearching || !search.query.trim()}
                  >
                    Search
                  </Button>
                </div>

                {search.showResults && search.results.length > 0 && (
                  <div className="relative">
                    <div className="absolute left-0 right-0 top-0 z-50 max-h-60 overflow-auto rounded-md border bg-background shadow-md">
                      <ul className="py-1">
                        {search.results.map((result, index) => (
                          <li
                            key={index}
                            className="cursor-pointer px-4 py-2 text-sm hover:bg-accent"
                            onClick={() => search.selectResult(result)}
                          >
                            {result.display_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="h-[300px] overflow-hidden rounded-md border">
                  <MapComponent onLocationSelect={(location) => form.setValue("homeLocation", location)} ref={mapRef} />
                </div>

                {field.value?.name && field.value?.lat !== undefined && field.value?.lng !== undefined && (
                  <div className="flex items-center gap-2 rounded-md bg-primary/10 p-2 text-sm">
                    <Home className="h-4 w-4 text-primary" />
                    <span>
                      Selected: <strong>{field.value.name}</strong>
                    </span>
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription>
              This helps us calculate carbon emissions and suggest eco-friendly transportation options
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
