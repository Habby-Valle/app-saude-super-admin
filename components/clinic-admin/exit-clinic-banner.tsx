"use client"

import { useTransition } from "react"
import { ArrowLeft, Eye } from "lucide-react"
import { exitClinicPanel } from "@/app/actions/clinic-context"
import { Button } from "@/components/ui/button"

interface ExitClinicBannerProps {
  clinicName: string
}

export function ExitClinicBanner({ clinicName }: ExitClinicBannerProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center justify-between bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span>
          Você está visualizando o painel como <strong>Super Admin</strong> — Clínica:{" "}
          <strong>{clinicName}</strong>
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-7 border-amber-300 text-amber-800 hover:bg-amber-100"
        disabled={isPending}
        onClick={() => startTransition(() => exitClinicPanel())}
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Sair do painel
      </Button>
    </div>
  )
}
