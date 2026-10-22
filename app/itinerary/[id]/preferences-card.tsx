import { Heart } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PreferencesCard({ styles, dietaryNeeds }: { styles: string[]; dietaryNeeds: string[] }) {
  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg pt-0">
      <CardHeader className="bg-primary/5 border-b pt-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart className="h-5 w-5 text-primary" />
          Travel Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Travel Style</h4>
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <Badge key={style} variant="secondary">
                  {style}
                </Badge>
              ))}
            </div>
          </div>

          {dietaryNeeds && dietaryNeeds.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Dietary Needs</h4>
              <div className="flex flex-wrap gap-2">
                {dietaryNeeds.map((diet) => (
                  <Badge key={diet} variant="outline">
                    {diet}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
