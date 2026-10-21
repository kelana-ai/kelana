import { AtSign, Check, Globe, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"

interface ProfileTabProps {
  fullname: string
  onFullname: (value: string) => void
  username: string
  onUsername: (value: string) => void
  website: string
  onWebsite: (value: string) => void
  updating: boolean
  onSubmit: () => void
}

export function ProfileTab({ fullname, onFullname, username, onUsername, website, onWebsite, updating, onSubmit }: ProfileTabProps) {
  return (
    <TabsContent value="profile" className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-medium">Profile Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullname}
                onChange={(e) => onFullname(e.target.value)}
                disabled={updating}
                maxLength={100}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => onUsername(e.target.value)}
                  disabled={updating}
                  maxLength={30}
                  placeholder="Choose a username (optional)"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => onWebsite(e.target.value)}
                  disabled={updating}
                  placeholder="https://example.com"
                  className="pl-9"
                />
              </div>
            </div>

            <Button className="mt-2 w-full" onClick={onSubmit} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
