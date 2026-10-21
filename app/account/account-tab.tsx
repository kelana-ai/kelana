import { AtSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import type { AccountUser } from "./types"

export function AccountTab({ user, onDelete }: { user: AccountUser; onDelete: () => void }) {
  return (
    <TabsContent value="account" className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-medium">Account Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="text" value={user.email || ""} disabled className="bg-muted/50 pl-9" />
              </div>
              <p className="text-xs text-muted-foreground">Your email address cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label>Account ID</Label>
              <div className="rounded-md bg-muted p-3 font-mono text-sm">{user.id}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <h3 className="mb-2 text-lg font-medium text-destructive">Danger Zone</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Permanently delete your account, profile, avatar and all of your itineraries. This cannot be undone.
          </p>
          <Button variant="destructive" onClick={onDelete}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
