"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Loader2, Upload, Trash2, Building2 } from "lucide-react"

import { uploadAndUpdateClinicLogo, removeClinicLogo } from "./actions"
import { Button } from "@/components/ui/button"

interface ClinicLogoManagerProps {
  clinicId: string
  currentLogoUrl: string | null
}

export function ClinicLogoManager({
  clinicId: _clinicId,
  currentLogoUrl,
}: ClinicLogoManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    const formData = new FormData()
    formData.append("logo", file)

    startTransition(async () => {
      const result = await uploadAndUpdateClinicLogo(formData)
      if (!result.success) {
        toast.error(result.error ?? "Erro ao fazer upload da logo")
        return
      }
      setLogoUrl(result.logoUrl!)
      toast.success("Logo atualizada com sucesso!")
    })

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeClinicLogo()
      if (!result.success) {
        toast.error(result.error ?? "Erro ao remover logo")
        return
      }
      setLogoUrl(null)
      toast.success("Logo removida.")
    })
  }

  return (
    <div className="flex items-center gap-6">
      {/* Preview */}
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt="Logo da clínica"
            fill
            sizes="96px"
            className="object-contain p-2"
            unoptimized
          />
        ) : (
          <Building2 className="h-10 w-10 text-muted-foreground/50" />
        )}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          <Upload className="mr-2 h-4 w-4" />
          {logoUrl ? "Alterar logo" : "Carregar logo"}
        </Button>
        {logoUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleRemove}
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover logo
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
