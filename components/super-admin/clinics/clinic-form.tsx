'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'

import { clinicSchema, type ClinicFormValues } from '@/lib/validations/clinic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ClinicFormProps {
  defaultValues?: Partial<ClinicFormValues>
  defaultLogoUrl?: string | null
  onSubmit: (values: ClinicFormValues, logoFile: File | null) => Promise<void>
  isLoading?: boolean
}

// Formata CNPJ enquanto digita: 00.000.000/0000-00
function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function ClinicForm({ defaultValues, defaultLogoUrl, onSubmit, isLoading }: ClinicFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: '',
      cnpj: '',
      status: 'active',
      plan: '',
      ...defaultValues,
    },
  })

  const cnpjValue = watch('cnpj') ?? ''
  const statusValue = watch('status')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(defaultLogoUrl ?? null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleFormSubmit(values: ClinicFormValues) {
    await onSubmit(values, logoFile)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Logo */}
      <div className="space-y-1.5">
        <Label>Logo da clínica</Label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
              <Image
                src={logoPreview}
                alt="Preview da logo"
                fill
                className="object-contain p-1"
                unoptimized
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed bg-muted text-muted-foreground">
              <Upload className="h-5 w-5" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {logoPreview ? 'Alterar logo' : 'Escolher logo'}
            </Button>
            <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP. Máx 2MB.</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome da clínica *</Label>
        <Input
          id="name"
          placeholder="Ex: Clínica Bem Estar"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* CNPJ */}
      <div className="space-y-1.5">
        <Label htmlFor="cnpj">CNPJ *</Label>
        <Input
          id="cnpj"
          placeholder="00.000.000/0000-00"
          value={formatCnpj(cnpjValue)}
          onChange={(e) =>
            setValue('cnpj', e.target.value, { shouldValidate: true })
          }
        />
        {errors.cnpj && (
          <p className="text-xs text-destructive">{errors.cnpj.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label>Status *</Label>
        <Select
          value={statusValue}
          onValueChange={(v) =>
            setValue('status', v as ClinicFormValues['status'], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="inactive">Inativa</SelectItem>
            <SelectItem value="suspended">Suspensa</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-xs text-destructive">{errors.status.message}</p>
        )}
      </div>

      {/* Plano */}
      <div className="space-y-1.5">
        <Label htmlFor="plan">Plano</Label>
        <Input
          id="plan"
          placeholder="Ex: Básico, Pro, Enterprise"
          {...register('plan')}
        />
        {errors.plan && (
          <p className="text-xs text-destructive">{errors.plan.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar
      </Button>
    </form>
  )
}
