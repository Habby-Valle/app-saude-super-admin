import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[420px] w-full max-w-md rounded-xl" />}>
      <LoginForm />
    </Suspense>
  )
}
