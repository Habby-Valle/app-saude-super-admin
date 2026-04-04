import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ForgotPasswordForm } from './forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[420px] w-full max-w-md rounded-xl" />}>
      <ForgotPasswordForm />
    </Suspense>
  )
}