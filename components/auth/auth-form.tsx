import { motion } from "framer-motion"
import { AlertCircle, Loader2, type LucideIcon } from "lucide-react"
import Link from "next/link"
import type { ComponentProps, FormEventHandler, ReactNode } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthFormCardProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  error: string | null
  footer: ReactNode
  children: ReactNode
}

export function AuthFormCard({ onSubmit, error, footer, children }: AuthFormCardProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          {children}
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">{footer}</CardFooter>
    </Card>
  )
}

interface AuthFieldProps extends ComponentProps<typeof Input> {
  id: string
  label: string
  icon: LucideIcon
}

export function AuthField({ id, label, icon: Icon, children, ...inputProps }: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="relative">
        <Icon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input id={id} {...inputProps} />
      </div>
      {children}
    </div>
  )
}

interface AuthSubmitButtonProps {
  pending: boolean
  pendingLabel: string
  label: string
  blocked?: boolean
}

export function AuthSubmitButton({ pending, pendingLabel, label, blocked = false }: AuthSubmitButtonProps) {
  return (
    <Button type="submit" className="w-full transition-all duration-200 hover:shadow-md" disabled={pending || blocked}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  )
}

interface AuthFooterProps {
  prompt: string
  href: string
  linkLabel: string
}

export function AuthFooter({ prompt, href, linkLabel }: AuthFooterProps) {
  return (
    <p className="text-sm text-muted-foreground">
      {prompt}{" "}
      <Link href={href} className="font-medium text-primary transition-colors hover:text-primary/80">
        {linkLabel}
      </Link>
    </p>
  )
}
