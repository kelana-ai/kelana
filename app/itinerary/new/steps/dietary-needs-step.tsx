import type { UseFormReturn } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { dietaryNeeds } from "../constants"
import type { FormValues } from "../schema"

export function DietaryNeedsStep({ form }: { form: UseFormReturn<FormValues> }) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="dietaryNeeds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dietary Preferences (Optional)</FormLabel>
            <FormDescription className="mb-4">Select any dietary requirements for your trip</FormDescription>
            <FormControl>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {dietaryNeeds.map((diet) => (
                  <label
                    key={diet.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent",
                      field.value?.includes(diet.id) ? "border-primary bg-primary/5" : "border-muted",
                    )}
                  >
                    <Checkbox
                      checked={field.value?.includes(diet.id)}
                      onCheckedChange={(checked) =>
                        checked
                          ? field.onChange([...field.value, diet.id])
                          : field.onChange(field.value?.filter((v) => v !== diet.id) || [])
                      }
                      className="h-5 w-5"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{diet.icon}</span>
                      <span>{diet.label}</span>
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
