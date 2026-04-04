"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

interface MobileSidebarProps {
  variant?: "super-admin" | "clinic-admin"
  activeSosCount?: number
}

export function MobileSidebar({
  variant,
  activeSosCount = 0,
}: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative md:hidden">
          <Menu className="h-5 w-5" />
          {activeSosCount > 0 && (
            <span className="text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold">
              {activeSosCount > 9 ? "9+" : activeSosCount}
            </span>
          )}
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <Sidebar variant={variant} activeSosCount={activeSosCount} />
      </SheetContent>
    </Sheet>
  )
}
