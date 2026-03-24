'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, LogOut, ChevronDown } from 'lucide-react'

import { createClient } from '@/lib/supabase'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useAuthStore } from '@/store/auth-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/dropdown-menu'
import { MobileSidebar } from './mobile-sidebar'

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function Topbar() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const { setTheme } = useTheme()
  const clear = useAuthStore((s) => s.clear)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    clear()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = user?.name ? getInitials(user.name) : 'SA'

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-card px-4 md:px-6">
      {/* Botão hamburguer — somente mobile */}
      <MobileSidebar />

      {/* Slot direito */}
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-none">
                  {user?.name ?? 'Super Admin'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email ?? ''}
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.name ?? 'Super Admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4" />
                Tema
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Escuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
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
