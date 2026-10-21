import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { dietaryNeeds, travelStyles } from "../itinerary/new/constants"

interface Option {
  id: string
  icon: string
  label: string
}

function ChoiceBadges({ options, selected, onToggle }: { options: readonly Option[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Badge
          key={option.id}
          asChild
          variant={selected.includes(option.id) ? "default" : "outline"}
          className={cn("cursor-pointer", !selected.includes(option.id) && "hover:bg-primary/10")}
        >
          <button type="button" aria-pressed={selected.includes(option.id)} onClick={() => onToggle(option.id)}>
            {option.icon} {option.label}
          </button>
        </Badge>
      ))}
    </div>
  )
}

interface PreferencesTabProps {
  styles: string[]
  diets: string[]
  onToggleStyle: (id: string) => void
  onToggleDiet: (id: string) => void
  saving: boolean
  onSave: () => void
}

export function PreferencesTab({ styles, diets, onToggleStyle, onToggleDiet, saving, onSave }: PreferencesTabProps) {
  return (
    <TabsContent value="preferences" className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-medium">Travel Preferences</h3>
          <p className="mb-4 text-muted-foreground">
            These are pre-selected when you create a new itinerary. Your home location is saved from the itinerary wizard.
          </p>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Travel Interests</Label>
              <ChoiceBadges options={travelStyles} selected={styles} onToggle={onToggleStyle} />
            </div>
            <div className="space-y-2">
              <Label>Dietary Needs</Label>
              <ChoiceBadges options={dietaryNeeds} selected={diets} onToggle={onToggleDiet} />
            </div>
            <Button className="mt-2 w-full" onClick={onSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
