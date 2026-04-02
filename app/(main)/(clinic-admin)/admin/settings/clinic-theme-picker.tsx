"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { CLINIC_THEMES, type ClinicThemeId } from "@/lib/clinic-themes"
import { updateClinicTheme } from "./actions"

interface ClinicThemePickerProps {
  currentTheme: ClinicThemeId
}

/** Aplica o hue diretamente como inline style no elemento .clinic-admin */
function applyThemeToDom(themeId: ClinicThemeId) {
  const wrapper = document.querySelector(".clinic-admin") as HTMLElement | null
  if (!wrapper) return
  const theme = CLINIC_THEMES.find((t) => t.id === themeId)
  if (!theme) return
  wrapper.style.setProperty("--theme-hue", String(theme.hue))
}

export function ClinicThemePicker({ currentTheme }: ClinicThemePickerProps) {
  const [activeTheme, setActiveTheme] = useState<ClinicThemeId>(currentTheme)
  const [isPending, startTransition] = useTransition()

  function handleSelect(themeId: ClinicThemeId) {
    if (themeId === activeTheme || isPending) return

    // Aplica instantaneamente no DOM para feedback visual imediato
    applyThemeToDom(themeId)
    setActiveTheme(themeId)

    startTransition(async () => {
      const result = await updateClinicTheme(themeId)
      if (result.success) {
        toast.success("Tema atualizado com sucesso!")
      } else {
        // Reverte o DOM em caso de erro
        applyThemeToDom(activeTheme)
        setActiveTheme(activeTheme)
        toast.error(result.error ?? "Erro ao atualizar tema")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {CLINIC_THEMES.map((theme) => {
          const isActive = theme.id === activeTheme
          return (
            <button
              key={theme.id}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(theme.id)}
              title={theme.label}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all",
                "ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "ring-2 ring-ring scale-110" : "hover:scale-105",
                isPending && "opacity-50 cursor-not-allowed"
              )}
              style={{ backgroundColor: theme.color }}
            >
              {isActive && (
                <Check className="h-4 w-4 text-white drop-shadow" strokeWidth={3} />
              )}
              <span className="sr-only">{theme.label}</span>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Tema atual:{" "}
        <span className="font-medium text-foreground">
          {CLINIC_THEMES.find((t) => t.id === activeTheme)?.label ?? activeTheme}
        </span>
      </p>
    </div>
  )
}
