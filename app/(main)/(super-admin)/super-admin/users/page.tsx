import { Suspense } from "react"
import { requireSuperAdmin } from "@/lib/auth"
import { getUsers } from "./actions"
import { UserTableWrapper } from "@/components/super-admin/users/user-table-wrapper"
import { UserTableSkeleton } from "@/components/super-admin/users/user-table"
import type { UserRole } from "@/types/database"

export const metadata = {
  title: "Usuários",
}

interface UsersPageProps {
  searchParams: Promise<{
    search?: string
    role?: string
    clinic_id?: string
    page?: string
  }>
}

async function UsersContent({ searchParams }: UsersPageProps) {
  const params = await searchParams
  const search = params.search ?? ""
  const role = (params.role ?? "all") as UserRole | "all"
  const clinicId = params.clinic_id ?? "all"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = 10

  const { supabase } = await requireSuperAdmin()

  const [{ users, total }, { data: clinics }] = await Promise.all([
    getUsers({ search, role, clinic_id: clinicId, page, pageSize }),
    supabase
      .from("clinics")
      .select("id, name")
      .eq("status", "active")
      .order("name"),
  ])

  return (
    <UserTableWrapper
      users={users}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      role={role}
      clinicId={clinicId}
      clinics={clinics ?? []}
    />
  )
}

export default function UsersPage(props: UsersPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie administradores, cuidadores e familiares da plataforma.
        </p>
      </div>
      <Suspense fallback={<UserTableSkeleton />}>
        <UsersContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  )
}
