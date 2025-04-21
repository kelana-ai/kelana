export interface Itinerary {
    id: string
    name: string
    description: string | null
    status: string
    destination_name: string
    destination_lat: number
    destination_lng: number
    date_from: string
    date_to: string
    travel_type: string
    travel_styles: string[]
    dietary_needs: string[]
    budget: {
      total: number
      spent: number
      remaining: number
      accommodation?: number
      transportation?: number
      food?: number
      activities?: number
    }
    carbon_metrics: {
      saved: number
      total: number
      percentage: number
    }
    created_at: string
    updated_at: string
  }
  
  export interface SustainabilityTip {
    id: string
    content: string
    category: string
  }
  
  export interface ItineraryDay {
    id: string
    itinerary_id: string
    day_index: number
    date: string
  }
  
  export interface ItineraryActivity {
    id: string
    day_id: string
    activity_index: number
    start_time: string
    end_time: string | null
    title: string
    description: string
    type: string
    status: string
    location_name: string | null
    location_lat: number | null
    location_lng: number | null
    cost: number
    currency: string
    eco_tags: string[]
  }
  