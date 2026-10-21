import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AccountSkeleton() {
  return (
    <div className="container max-w-5xl py-8">
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <Skeleton className="h-[150px] w-[150px] rounded-full" />
            <Skeleton className="h-7 w-[150px]" />
            <Skeleton className="h-4 w-[180px]" />
          </CardContent>
        </Card>
        <div className="space-y-4 md:col-span-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}
