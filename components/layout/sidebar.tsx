'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  UserRound,
  ClipboardList,
  BarChart3,
  Settings,
  ShieldCheck,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Clínicas',
    href: '/clinics',
    icon: Building2,
  },
  {
    label: 'Usuários',
    href: '/users',
    icon: Users,
  },
  {
    label: 'Pacientes',
    href: '/patients',
    icon: UserRound,
  },
  {
    label: 'Checklists',
    href: '/checklists',
    icon: ClipboardList,
  },
  {
    label: 'Relatórios',
    href: '/reports',
    icon: BarChart3,
  },
  {
    label: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <ShieldCheck className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="leading-none">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            App Saúde
          </p>
          <p className="text-sm font-bold">Super Admin</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé da sidebar */}
      <div className="border-t px-4 py-3">
        <p className="text-[11px] text-muted-foreground">
          v0.1.0 · Super Admin
        </p>
      </div>
    </aside>
  )
}
