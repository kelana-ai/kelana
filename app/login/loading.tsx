import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function LoginLoading() {
  return (
    <AuthLayout title="Welcome back" description="Sign in to your account to continue your eco-conscious journey">
      <AuthFormSkeleton />
    </AuthLayout>
  )
}
