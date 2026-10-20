import type { UseFormReturn } from "react-hook-form"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { travelTypeOptions } from "../constants"
import type { FormValues } from "../schema"

export function TravelTypeStep({ form }: { form: UseFormReturn<FormValues> }) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="travelType"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel>Who are you traveling with?</FormLabel>
            <FormControl>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {travelTypeOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer flex-col items-center rounded-lg border-2 p-4 transition-all hover:bg-accent",
                      field.value === option.id ? "border-primary bg-primary/5" : "border-muted",
                    )}
                    onClick={() => field.onChange(option.id)}
                  >
                    <div className="mb-3 text-4xl">{option.icon}</div>
                    <h3 className="mb-1 font-medium">{option.label}</h3>
                    <p className="text-center text-xs text-muted-foreground">{option.description}</p>
                    {field.value === option.id && (
                      <div className="mt-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                        Selected
                      </div>
                    )}
                  </div>
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
