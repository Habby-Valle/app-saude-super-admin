import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AcceptInvitationForm } from "./accept-invitation-form"

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={<Skeleton className="h-[420px] w-full max-w-md rounded-xl" />}
    >
      <AcceptInvitationForm />
    </Suspense>
  )
}
