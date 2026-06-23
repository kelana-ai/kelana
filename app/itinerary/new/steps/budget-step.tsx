import type { UseFormReturn } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { budgetRanges, getBudgetTabValue } from "../constants"
import type { FormValues } from "../schema"

function BudgetItem({ label, amount, percentage }: { label: string; amount: number; percentage: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm">{label}</span>
        <span className="font-medium">${amount}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export function BudgetStep({ form }: { form: UseFormReturn<FormValues> }) {
  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="budget"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trip Budget (USD)</FormLabel>
            <FormDescription className="mb-6">Drag the slider to set your total budget for this trip</FormDescription>
            <FormControl>
              <div className="space-y-8">
                <Tabs
                  defaultValue={getBudgetTabValue(field.value)}
                  onValueChange={(val) => {
                    const found = budgetRanges.find((r) => r.label === val)
                    if (found) field.onChange(found.value)
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-5">
                    {budgetRanges.map((r) => (
                      <TabsTrigger key={r.label} value={r.label}>
                        {r.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <Slider
                  min={100}
                  max={10000}
                  step={100}
                  value={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                  className="py-4"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">$100</span>
                  <span className="text-2xl font-semibold text-primary">${field.value}</span>
                  <span className="text-sm text-muted-foreground">$10,000</span>
                </div>

                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <h3 className="mb-3 font-medium">Estimated Budget Breakdown</h3>
                  <BudgetItem label="Accommodation" amount={Math.round(field.value * 0.4)} percentage={40} />
                  <BudgetItem label="Transportation" amount={Math.round(field.value * 0.2)} percentage={20} />
                  <BudgetItem label="Food & Dining" amount={Math.round(field.value * 0.2)} percentage={20} />
                  <BudgetItem label="Activities" amount={Math.round(field.value * 0.15)} percentage={15} />
                  <BudgetItem label="Miscellaneous" amount={Math.round(field.value * 0.05)} percentage={5} />
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
