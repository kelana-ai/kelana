import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function SignupLoading() {
  return (
    <AuthLayout
      title="Create an account"
      description="Create an account to plan and save trips"
    >
      <AuthFormSkeleton />
    </AuthLayout>
  )
}
