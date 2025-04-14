import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AccountLoading() {
  return (
    <div className="container max-w-5xl py-8">
      {/* Back Button & Header */}
      <div className="mb-8 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile and account preferences</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Skeleton className="h-[150px] w-[150px] rounded-full" />
                <Skeleton className="absolute bottom-0 right-0 h-10 w-10 rounded-full" />
              </div>
              <Skeleton className="h-7 w-[150px]" />
              <Skeleton className="h-4 w-[180px]" />
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
              <Skeleton className="h-[1px] w-full" />
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              </div>
              <Skeleton className="h-[1px] w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <div className="md:col-span-2">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-6 w-[180px]" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
