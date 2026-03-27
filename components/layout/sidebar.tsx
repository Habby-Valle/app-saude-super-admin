"use client"

import Link from "next/link"
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
} from "lucide-react"

import { cn } from "@/lib/utils"

const superAdminNavItems = [
  { label: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { label: "Clínicas", href: "/super-admin/clinics", icon: Building2 },
  { label: "Usuários", href: "/super-admin/users", icon: Users },
  { label: "Pacientes", href: "/super-admin/patients", icon: UserRound },
  { label: "Checklists", href: "/super-admin/checklists", icon: ClipboardList },
  { label: "Relatórios", href: "/super-admin/reports", icon: BarChart3 },
  { label: "Logs de Auditoria", href: "/super-admin/audit-logs", icon: Shield },
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
  { label: "Relatórios", href: "/admin/reports", icon: BarChart3 },
]

type SidebarVariant = "super-admin" | "clinic-admin"

interface SidebarProps {
  variant?: SidebarVariant
  activeSosCount?: number
}

export function Sidebar({ variant = "super-admin", activeSosCount = 0 }: SidebarProps) {
  const pathname = usePathname()

  const navItems =
    variant === "super-admin" ? superAdminNavItems : clinicAdminNavItems

  const title = variant === "super-admin" ? "Super Admin" : "Admin Clínica"

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <ShieldCheck className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="leading-none">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            App Saúde
          </p>
          <p className="text-sm font-bold">{title}</p>
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
                      : "bg-destructive text-destructive-foreground"
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
        <p className="text-[11px] text-muted-foreground">v0.1.0 · {title}</p>
      </div>
    </aside>
  )
}
