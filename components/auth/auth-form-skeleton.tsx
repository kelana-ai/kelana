import { Skeleton } from "@/components/ui/skeleton"

export function AuthFormSkeleton() {
  return (
    <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-sm" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Skeleton className="h-10 w-full" />

      <div className="pt-4 border-t">
        <div className="flex justify-center">
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  )
}
