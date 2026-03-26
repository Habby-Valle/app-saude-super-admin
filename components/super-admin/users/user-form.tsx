"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { inviteUserSchema, updateUserSchema } from "@/lib/validations/user"
import type {
  InviteUserValues,
  UpdateUserValues,
  UserFormValues,
} from "@/lib/validations/user"
import type { User } from "@/types/database"
import type { Clinic } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UserFormProps {
  user?: User
  clinics: Pick<Clinic, "id" | "name">[]
  onSubmit: (data: InviteUserValues | UpdateUserValues) => Promise<void>
  isLoading: boolean
}

export function UserForm({
  user,
  clinics,
  onSubmit,
  isLoading,
}: UserFormProps) {
  const isEditing = !!user

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? updateUserSchema : inviteUserSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: (user?.role as UserFormValues["role"]) ?? "clinic_admin",
      clinic_id: user?.clinic_id ?? null,
    },
  })

  const roleValue = watch("role")
  const clinicValue = watch("clinic_id")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          placeholder="Ex: Maria Silva"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email — só no convite */}
      {!isEditing && (
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="usuario@clinica.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      )}

      {/* Perfil */}
      <div className="space-y-1.5">
        <Label>Perfil</Label>
        <Select
          value={roleValue}
          onValueChange={(v) =>
            setValue("role", v as InviteUserValues["role"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger aria-invalid={!!errors.role}>
            <SelectValue placeholder="Selecione o perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clinic_admin">Admin Clínica</SelectItem>
            <SelectItem value="caregiver">Cuidador</SelectItem>
            <SelectItem value="family">Familiar</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-xs text-destructive">{errors.role.message}</p>
        )}
      </div>

      {/* Clínica */}
      <div className="space-y-1.5">
        <Label>Clínica</Label>
        <Select
          value={clinicValue ?? "none"}
          onValueChange={(v) =>
            setValue("clinic_id", v === "none" ? null : v, {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a clínica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem clínica</SelectItem>
            {clinics.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.clinic_id && (
          <p className="text-xs text-destructive">{errors.clinic_id.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading
          ? isEditing
            ? "Salvando..."
            : "Enviando convite..."
          : isEditing
            ? "Salvar alterações"
            : "Enviar convite"}
      </Button>
    </form>
  )
}
