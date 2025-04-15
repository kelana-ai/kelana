import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function AboutLoading() {
  return (
    <div className="flex flex-col">
      {/* Hero Section Loading State */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-28">
        <div className="container relative z-10">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <Badge className="mb-4">Our Story</Badge>
              <Skeleton className="mb-6 h-12 w-3/4" />
              <Skeleton className="mb-4 h-4 w-full" />
              <Skeleton className="mb-4 h-4 w-full" />
              <Skeleton className="mb-8 h-4 w-3/4" />
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            <div className="relative mx-auto max-w-md">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary/5" />
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Quick Navigation Loading State */}
      <section className="sticky top-16 z-30 border-b bg-background/80 py-4 backdrop-blur-md">
        <div className="container">
          <Skeleton className="mx-auto h-10 w-full max-w-3xl" />
        </div>
      </section>

      {/* Mission Section Loading State */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">Our Mission</Badge>
            <Skeleton className="mx-auto mb-6 h-10 w-3/4" />
            <Skeleton className="mx-auto mb-8 h-4 w-full" />

            <div className="grid gap-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="mb-4 h-16 w-16 rounded-full" />
                  <Skeleton className="mb-2 h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section Loading State */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <Badge className="mb-4">Our Team</Badge>
            <Skeleton className="mx-auto mb-6 h-10 w-3/4" />
            <Skeleton className="mx-auto mb-8 h-4 w-full max-w-2xl" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <Skeleton className="aspect-square w-full" />
                <div className="p-6">
                  <Skeleton className="mb-2 h-6 w-3/4" />
                  <Skeleton className="mb-4 h-4 w-1/2" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-4 h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
