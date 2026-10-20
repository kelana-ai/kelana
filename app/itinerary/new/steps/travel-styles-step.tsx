import type { UseFormReturn } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { travelStyles } from "../constants"
import type { FormValues } from "../schema"

export function TravelStylesStep({ form }: { form: UseFormReturn<FormValues> }) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="travelStyles"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What kind of experiences are you looking for?</FormLabel>
            <FormDescription className="mb-4">Select all that apply to personalize your itinerary</FormDescription>
            <FormControl>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {travelStyles.map((style) => (
                  <label
                    key={style.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent",
                      field.value?.includes(style.id) ? "border-primary bg-primary/5" : "border-muted",
                    )}
                  >
                    <Checkbox
                      checked={field.value?.includes(style.id)}
                      onCheckedChange={(checked) =>
                        checked
                          ? field.onChange([...field.value, style.id])
                          : field.onChange(field.value?.filter((v) => v !== style.id) || [])
                      }
                      className="h-5 w-5"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{style.icon}</span>
                      <span>{style.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
