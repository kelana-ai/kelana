"use client"

import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { refineItinerary } from "./actions"

const SUGGESTIONS = [
  "Make day 2 slower with more free time",
  "Replace flights or taxis with trains and buses where possible",
  "Add more vegetarian and vegan food options",
  "Lower the overall cost by choosing cheaper activities",
]

export function RefineForm({ id, name, destination }: { id: string; name: string; destination: string }) {
  const router = useRouter()
  const [instruction, setInstruction] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const result = await refineItinerary({ itineraryId: id, instruction })
        if (result.success) {
          toast.success("Itinerary updated")
          router.push(`/itinerary/${id}`)
          router.refresh()
        } else {
          setError(result.error)
        }
      } catch {
        setError("Something went wrong. Your original plan is unchanged.")
      }
    })
  }

  return (
    <div className="container max-w-2xl py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4 gap-1">
        <Link href={`/itinerary/${id}`}>
          <ArrowLeft className="h-4 w-4" /> Back to itinerary
        </Link>
      </Button>
      <Card>
        <form onSubmit={submit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Refine with AI
            </CardTitle>
            <CardDescription>
              Tell Kelana what to change in &ldquo;{name}&rdquo; ({destination}). Dates and budget stay the same; the plan is regenerated
              with your request.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="instruction">What should change?</Label>
              <textarea
                id="instruction"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                maxLength={1000}
                rows={5}
                disabled={pending}
                required
                className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2"
                placeholder="e.g. Swap the museum on day 2 for a nature hike"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Button key={s} type="button" variant="outline" size="sm" disabled={pending} onClick={() => setInstruction(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-3">
            <p className="text-muted-foreground text-xs">This can take a minute. Your current plan is only replaced if the new one is generated successfully.</p>
            <Button type="submit" disabled={pending || instruction.trim().length < 5}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refining...
                </>
              ) : (
                "Refine itinerary"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
