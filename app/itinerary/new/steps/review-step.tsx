import { format } from "date-fns"
import { Calendar, Home, MapPin, Sparkles, Users, Wallet } from "lucide-react"
import type React from "react"
import type { UseFormReturn } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { dietaryNeeds, travelStyles, travelTypeOptions } from "../constants"
import type { FormValues } from "../schema"

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

export function ReviewStep({ form, captcha }: { form: UseFormReturn<FormValues>; captcha: React.ReactNode }) {
  const values = form.getValues()

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Trip Summary</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <SummaryItem icon={<MapPin className="h-4 w-4" />} label="Destination" value={values.destination.name} />
          <SummaryItem
            icon={<Home className="h-4 w-4" />}
            label="Home Location"
            value={values.homeLocation?.name || "Not specified"}
          />
          <SummaryItem
            icon={<Calendar className="h-4 w-4" />}
            label="Dates"
            value={`${format(values.dateRange.from, "MMM d")} - ${format(values.dateRange.to, "MMM d, yyyy")}`}
          />
          <SummaryItem
            icon={<Users className="h-4 w-4" />}
            label="Travel Type"
            value={travelTypeOptions.find((t) => t.id === values.travelType)?.label || ""}
          />
          <SummaryItem icon={<Wallet className="h-4 w-4" />} label="Budget" value={`$${values.budget}`} />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Travel Styles</h3>
        <div className="flex flex-wrap gap-2">
          {values.travelStyles.map((style) => (
            <Badge key={style} variant="secondary" className="text-sm">
              {travelStyles.find((s) => s.id === style)?.icon} {travelStyles.find((s) => s.id === style)?.label}
            </Badge>
          ))}
        </div>
      </div>

      {values.dietaryNeeds.length > 0 && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Dietary Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {values.dietaryNeeds.map((diet) => (
              <Badge key={diet} variant="outline" className="text-sm">
                {dietaryNeeds.find((d) => d.id === diet)?.icon} {dietaryNeeds.find((d) => d.id === diet)?.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-primary/10 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/20 p-2 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="mb-2 font-medium text-primary">What Kelana favours</h3>
            <p className="text-sm text-muted-foreground">
              Low-carbon transport, locally owned places and plant-based food come first, within your budget and
              preferences.
            </p>
          </div>
        </div>
      </div>

      {captcha}
    </div>
  )
}
