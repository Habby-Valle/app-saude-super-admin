'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

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
  onSubmit: (values: ClinicFormValues) => Promise<void>
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

export function ClinicForm({ defaultValues, onSubmit, isLoading }: ClinicFormProps) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
