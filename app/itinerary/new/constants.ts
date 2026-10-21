import { Check, Home, MapPin, Sparkles, Users, Utensils, Wallet } from "lucide-react"

export const steps = [
  { id: "step-1", name: "Trip Details", icon: MapPin },
  { id: "step-2", name: "Home Location", icon: Home },
  { id: "step-3", name: "Travel Type", icon: Users },
  { id: "step-4", name: "Preferences", icon: Sparkles },
  { id: "step-5", name: "Dietary Needs", icon: Utensils },
  { id: "step-6", name: "Budget", icon: Wallet },
  { id: "step-7", name: "Review", icon: Check },
]

export const stepDescriptions = [
  "Where are you going, and when?",
  "Where are you starting from?",
  "Who is coming with you?",
  "What do you want to do?",
  "Any dietary needs?",
  "Set a budget for the trip",
  "Check the details before generating the plan",
]

export const travelTypeOptions = [
  { id: "solo", label: "Solo Explorer", icon: "👤", description: "Just me, myself, and I" },
  { id: "couple", label: "Couple", icon: "🧑‍🤝‍🧑", description: "Traveling with a partner" },
  { id: "friends", label: "Friends", icon: "👥", description: "With friends or a small crew" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦", description: "Kids, parents, or multigenerational" },
]

export const travelStyles = [
  { id: "wellness", label: "Wellness & Spa", icon: "🧘" },
  { id: "romantic", label: "Romantic", icon: "💑" },
  { id: "family-friendly", label: "Family-Friendly", icon: "👨‍👩‍👧‍👦" },
  { id: "cultural", label: "Culture & History", icon: "🏛️" },
  { id: "culinary", label: "Foodie Adventures", icon: "🍽️" },
  { id: "festivals", label: "Festivals & Events", icon: "🎉" },
  { id: "shopping", label: "Shopping & Style", icon: "🛍️" },
  { id: "adventure", label: "Adventure & Outdoors", icon: "🧗" },
  { id: "nature", label: "Nature & Wildlife", icon: "🦜" },
  { id: "urban", label: "Urban Life", icon: "🏙️" },
  { id: "roadtrip", label: "Road Trip", icon: "🛣️" },
  { id: "cruise", label: "Cruise Voyages", icon: "🚢" },
  { id: "backpacker", label: "Budget Backpacker", icon: "🎒" },
  { id: "photography", label: "Photography & Scenic", icon: "📸" },
  { id: "spiritual", label: "Spiritual Places", icon: "🕌" },
]

export const dietaryNeeds = [
  { id: "vegetarian", label: "Vegetarian", icon: "🥗" },
  { id: "vegan", label: "Vegan", icon: "🌿" },
  { id: "pescatarian", label: "Pescatarian", icon: "🐟" },
  { id: "gluten-free", label: "Gluten-Free", icon: "🌾" },
  { id: "dairy-free", label: "Dairy-Free", icon: "🥛" },
  { id: "nut-free", label: "Nut-Free", icon: "🥜" },
  { id: "shellfish-free", label: "Shellfish-Free", icon: "🦐" },
  { id: "halal", label: "Halal", icon: "☪️" },
  { id: "allergy-friendly", label: "Allergy-Friendly", icon: "⚠️" },
]

export const budgetRanges = [
  { value: 200, label: "Economy" },
  { value: 1200, label: "Standard" },
  { value: 4500, label: "Premium" },
  { value: 7500, label: "Luxury" },
  { value: 10000, label: "Ultra Luxury" },
]

export function getBudgetTabValue(value: number): string {
  return budgetRanges.reduce((best, r) => (Math.abs(r.value - value) < Math.abs(best.value - value) ? r : best)).label
}
