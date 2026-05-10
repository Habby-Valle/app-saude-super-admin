"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Users,
  UserRound,
  ClipboardList,
  BarChart3,
  Settings,
  ShieldCheck,
  Shield,
  AlertTriangle,
  CalendarClock,
  UserCog,
  CreditCard,
  Bug,
  TestTube,
  CheckCircle,
  DollarSign,
  Megaphone,
} from "lucide-react"

import { cn } from "@/lib/utils"

type Environment = "development" | "homologation" | "production"

const envConfig: Record<
  Environment,
  { label: string; icon: typeof Bug; color: string; bgColor: string }
> = {
  development: {
    label: "DESENVOLVIMENTO",
    icon: Bug,
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  homologation: {
    label: "HOMOLOGAÇÃO",
    icon: TestTube,
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  production: {
    label: "PRODUÇÃO",
    icon: CheckCircle,
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
}

function EnvironmentBadge() {
  const env = (process.env.NEXT_PUBLIC_APP_ENV ?? "development") as Environment
  const config = envConfig[env] ?? envConfig.development
  const EnvIcon = config.icon

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase",
        config.color,
        config.bgColor
      )}
    >
      <EnvIcon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  )
}

const superAdminNavItems = [
  { label: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { label: "Clínicas", href: "/super-admin/clinics", icon: Building2 },
  {
    label: "Assinaturas",
    href: "/super-admin/subscriptions",
    icon: CreditCard,
  },
  { label: "Pagamentos", href: "/super-admin/payments", icon: DollarSign },
  { label: "Planos", href: "/super-admin/plans", icon: CheckCircle },
  { label: "Usuários", href: "/super-admin/users", icon: Users },
  { label: "Pacientes", href: "/super-admin/patients", icon: UserRound },
  { label: "Checklists", href: "/super-admin/checklists", icon: ClipboardList },
  { label: "Relatórios", href: "/super-admin/reports", icon: BarChart3 },
  { label: "Logs de Auditoria", href: "/super-admin/audit-logs", icon: Shield },
  { label: "Broadcast", href: "/super-admin/broadcast", icon: Megaphone },
  { label: "SOS", href: "/super-admin/sos", icon: AlertTriangle, isSos: true },
  { label: "Configurações", href: "/super-admin/settings", icon: Settings },
]

const clinicAdminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Pacientes", href: "/admin/patients", icon: UserRound },
  { label: "Cuidadores", href: "/admin/caregivers", icon: UserCog },
  { label: "Turnos", href: "/admin/shifts", icon: CalendarClock },
  { label: "Checklists", href: "/admin/checklists", icon: ClipboardList },
  { label: "SOS", href: "/admin/sos", icon: AlertTriangle, isSos: true },
  { label: "Plano", href: "/admin/plan", icon: CreditCard },
  { label: "Relatórios", href: "/admin/reports", icon: BarChart3 },
  { label: "Configurações", href: "/admin/settings", icon: Settings },
]

type SidebarVariant = "super-admin" | "clinic-admin"

interface SidebarProps {
  variant?: SidebarVariant
  activeSosCount?: number
  clinicLogoUrl?: string | null
  clinicName?: string | null
}

export function Sidebar({
  variant = "super-admin",
  activeSosCount = 0,
  clinicLogoUrl,
  clinicName,
}: SidebarProps) {
  const pathname = usePathname()

  const navItems =
    variant === "super-admin" ? superAdminNavItems : clinicAdminNavItems

  const isClinicAdmin = variant === "clinic-admin"
  const title = isClinicAdmin ? (clinicName ?? "Admin Clínica") : "Super Admin"

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        {/* Clinic admin: logo da clínica ou ícone fallback */}
        {isClinicAdmin ? (
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
            {clinicLogoUrl ? (
              <Image
                src={clinicLogoUrl}
                alt={title}
                fill
                sizes="36px"
                className="object-contain p-0.5"
                unoptimized
              />
            ) : (
              <Building2 className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
        <div className="min-w-0 leading-none">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            App Saúde
          </p>
          <p className="truncate text-sm font-bold">{title}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          const showBadge = item.isSos && activeSosCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : showBadge
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                    isActive
                      ? "bg-primary-foreground text-primary"
                      : "text-destructive-foreground bg-destructive"
                  )}
                >
                  {activeSosCount > 99 ? "99+" : activeSosCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">v0.1.0</p>
          <EnvironmentBadge />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">{title}</p>
      </div>
    </aside>
  )
}
