import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="container py-8">
      {/* Welcome header and CTA */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Skeleton className="h-10 w-[250px] mb-2" />
          <Skeleton className="h-5 w-[180px]" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-1" />
              <Skeleton className="h-4 w-[120px]" />
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
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-6 w-[140px]" />
                  <Skeleton className="h-5 w-[70px] rounded-full" />
                </div>
                <Skeleton className="h-4 w-[120px]" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-[80%]" />
              </CardContent>
              <div className="p-4 border-t flex justify-between">
                <Skeleton className="h-9 w-[100px]" />
                <Skeleton className="h-9 w-[100px]" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sustainability Tips */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-6 w-[180px]" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-9 w-[150px]" />
      </div>
    </div>
  )
}
