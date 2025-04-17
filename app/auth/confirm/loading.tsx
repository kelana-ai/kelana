import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function ConfirmLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Image src="/logo-round.png" alt="Logo" width={48} height={48} />
            </div>
            <Skeleton className="mx-auto h-8 w-3/4" />
            <Skeleton className="mx-auto mt-2 h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center py-6">
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              </div>
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="mx-auto h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
