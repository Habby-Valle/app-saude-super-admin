"use client"

import { useTransition } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, LogOut, ChevronDown, AlertTriangle } from "lucide-react"
import Link from "next/link"

import { signOut } from "@/app/actions/auth"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileSidebar } from "./mobile-sidebar"

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

interface TopbarProps {
  variant?: "super-admin" | "clinic-admin"
  activeSosCount?: number
}

export function Topbar({ variant, activeSosCount = 0 }: TopbarProps) {
  const { user, hasHydrated } = useCurrentUser()
  const { setTheme } = useTheme()
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await signOut()
    })
  }

  const sosHref = variant === "clinic-admin" ? "/admin/sos" : "/super-admin/sos"
  const displayName = hasHydrated ? (user?.name ?? "Super Admin") : ""
  const displayEmail = hasHydrated ? (user?.email ?? "") : ""
  const initials = displayName ? getInitials(displayName) : "SA"

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-card px-4 md:px-6">
      {/* Botão hamburguer — somente mobile */}
      <MobileSidebar variant={variant} activeSosCount={activeSosCount} />

      {/* Slot direito */}
      <div className="ml-auto flex items-center gap-2">
        {/* Sino SOS — visível quando há alertas ativos */}
        {activeSosCount > 0 && (
          <Link href={`${sosHref}?status=active`}>
            <Button variant="ghost" size="icon" className="relative">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {activeSosCount > 9 ? "9+" : activeSosCount}
              </span>
              <span className="sr-only">{activeSosCount} alerta SOS ativo</span>
            </Button>
          </Link>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm leading-none font-medium">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayEmail}
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{displayEmail}</p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4" />
                Tema
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  Escuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
