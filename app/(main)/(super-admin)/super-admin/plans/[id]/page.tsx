import { notFound } from "next/navigation"
import { getPlanById } from "../actions"
import EditPlanPageClient from "./client"

interface EditPlanPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditPlanPageProps) {
  const { id } = await params
  const plan = await getPlanById(id)
  return {
    title: plan ? `Editar ${plan.plan.name}` : "Editar Plano",
  }
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const { id } = await params
  const planDetails = await getPlanById(id)

  if (!planDetails) {
    notFound()
  }

  return <EditPlanPageClient plan={planDetails.plan} />
}
