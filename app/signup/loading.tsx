import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function SignupLoading() {
  return (
    <AuthLayout
      title="Create an account"
      description="Join Kelana to start planning your eco-conscious travel experiences"
    >
      <AuthFormSkeleton />
    </AuthLayout>
  )
}
