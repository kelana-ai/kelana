import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="container max-w-7xl py-6 lg:py-8">
      {/* Welcome header and CTA */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Skeleton className="mb-2 h-10 w-[250px]" />
          <Skeleton className="h-5 w-[180px]" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Skeleton className="h-10 w-full max-w-[400px]" />
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-8 w-[80px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="mt-3 h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Itineraries */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-7 w-[150px]" />
          <Skeleton className="h-9 w-[80px]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="mb-2 flex justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-6 w-[140px]" />
                  </div>
                  <Skeleton className="h-5 w-[70px] rounded-full" />
                </div>
                <Skeleton className="h-4 w-[120px]" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
              </CardContent>
              <div className="flex justify-between border-t p-4">
                <Skeleton className="h-9 w-[100px]" />
                <Skeleton className="h-9 w-[100px]" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sustainability Tips */}
      <Card>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-[180px]" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-9 w-[150px]" />
        </div>
      </Card>
    </div>
  )
}
