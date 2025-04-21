"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"

interface Partner {
  name: string
  address: string
}

interface LocalPartnersCardProps {
  partners: Partner[]
}

export function LocalPartnersCard({ partners }: LocalPartnersCardProps) {
  if (partners.length === 0) {
    return null
  }

  const MAX_DISPLAY = 5
  const visible = partners.slice(0, MAX_DISPLAY)
  const hiddenCount = partners.length - MAX_DISPLAY

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg overflow-visible my-4 pt-0">
      <CardHeader className="bg-primary/5 border-b pt-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-5 w-5 text-primary" />
          Local Partners
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-1.5 overflow-visible">
        <div className="space-y-4">
          {visible.map((p, i) => (
            <motion.div
              key={`${p.name}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-1"
            >
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.address}</p>
            </motion.div>
          ))}
          {hiddenCount > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              ...and {hiddenCount} more
            </p>
         )}
        </div>
      </CardContent>
    </Card>
  )
}
