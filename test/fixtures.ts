import type { GeneratedItinerary } from "@/lib/itinerary"

export function generatedItinerary(dayCount = 2): GeneratedItinerary {
  return {
    name: "Ubud slow trip",
    destination: "Ubud, Bali",
    days: Array.from({ length: dayCount }, (_, i) => ({
      activities: [
        {
          start_time: "13:00",
          end_time: null,
          title: `Lunch at a warung ${i + 1}`,
          description: "Plant-based set meal.",
          type: "food",
          ecoTag: "Locally owned",
          cost: 8,
          currency: "USD",
          location: null,
        },
        {
          start_time: "09:00",
          end_time: "10:30",
          title: `Rice terrace walk ${i + 1}`,
          description: "Walk the ridge before the heat.",
          type: "sightseeing",
          ecoTag: "Walkable",
          cost: 12,
          currency: "USD",
          location: { name: "Tegallalang", lat: -8.4312, lng: 115.2793, address: "Tegallalang, Gianyar" },
        },
      ],
    })),
    carbon: { saved: 40, total: 60, percentage: 40 },
    icon: "bali",
  }
}
