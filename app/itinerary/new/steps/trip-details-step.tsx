"use client"

import { format } from "date-fns"
import { Calendar, Loader2, MapPin, Search } from "lucide-react"
import dynamic from "next/dynamic"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
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

export function TripDetailsStep({ form }: { form: UseFormReturn<FormValues> }) {
  const search = useLocationSearch((location) => {
    form.setValue("destination", location, { shouldValidate: form.formState.isSubmitted || Boolean(form.getFieldState("destination").error) })
  })

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="tripName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trip Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Bali in October" {...field} />
            </FormControl>
            <FormDescription>Give your trip a memorable name to easily identify it later</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="destination"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel>Destination</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search for a destination..."
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
                  <MapComponent
                    value={field.value.name && field.value.lat !== 0 ? field.value : null}
                    onLocationSelect={(location) => {
                      form.setValue("destination", location, { shouldValidate: Boolean(form.getFieldState("destination").error) })
                      search.setQuery(location.name)
                    }}
                  />
                </div>

                {field.value.name && field.value.lat !== 0 && (
                  <div className="flex items-center gap-2 rounded-md bg-primary/10 p-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>
                      Selected: <strong>{field.value.name}</strong>
                    </span>
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription>
              Search for a location or click directly on the map to select your destination
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dateRange"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Travel Dates</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {field.value?.from ? (
                      field.value.to ? (
                        <>
                          {format(field.value.from, "MMM d, yyyy")} - {format(field.value.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(field.value.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Select travel dates</span>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={field.value}
                  onSelect={(range) => {
                    field.onChange(range)
                    if (form.getFieldState("dateRange").error) void form.trigger("dateRange")
                  }}
                  numberOfMonths={2}
                  disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                />
              </PopoverContent>
            </Popover>
            <FormDescription>Select the start and end dates for your trip</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
