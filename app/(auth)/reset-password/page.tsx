import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ResetPasswordForm } from './reset-password-form'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[420px] w-full max-w-md rounded-xl" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}