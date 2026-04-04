"use client"

import { useState, useTransition } from "react"
import {
  Download,
  UserX,
  Clock,
  Lock,
  CheckCircle2,
  XCircle,
  Search,
  AlertTriangle,
  Info,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  updateRetentionPolicy,
  exportUserDataAction,
  exportPatientDataAction,
  anonymizeUserAction,
  anonymizePatientAction,
  searchUsersForLgpd,
  searchPatientsForLgpd,
} from "@/app/(main)/(super-admin)/super-admin/settings/lgpd-actions"
import type {
  LgpdConfig,
  RetentionPolicy,
  EncryptionStatus,
} from "@/app/(main)/(super-admin)/super-admin/settings/lgpd-actions"

interface LgpdSettingsProps {
  config: LgpdConfig
}

export function LgpdSettings({ config }: LgpdSettingsProps) {
  return (
    <div className="space-y-6">
      <EncryptionStatusSection
        statuses={config.encryption_statuses}
        keyConfigured={config.encryption_key_configured}
      />
      <Separator />
      <RetentionPoliciesSection policies={config.retention_policies} />
      <Separator />
      <ExportSection />
      <Separator />
      <AnonymizeSection />
    </div>
  )
}

// ─── Seção: Status de Criptografia ───────────────────────────────────────────

function EncryptionStatusSection({
  statuses,
  keyConfigured,
}: {
  statuses: EncryptionStatus[]
  keyConfigured: boolean
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Lock className="h-5 w-5 text-primary" />
          Criptografia de Dados
        </h2>
        <p className="text-sm text-muted-foreground">
          Status da criptografia AES-256-GCM nos campos sensíveis.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                Chave de criptografia (ENCRYPTION_KEY)
              </span>
            </div>
            {keyConfigured ? (
              <Badge variant="default" className="gap-1 bg-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Configurada
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Não configurada
              </Badge>
            )}
          </div>

          {!keyConfigured && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Adicione{" "}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
                  ENCRYPTION_KEY=&lt;string segura&gt;
                </code>{" "}
                no arquivo{" "}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
                  .env.local
                </code>{" "}
                para habilitar a criptografia.
              </span>
            </div>
          )}

          {statuses.length > 0 && (
            <>
              <Separator />
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Campos monitorados
              </p>
              {statuses.map((s) => (
                <div
                  key={`${s.table}.${s.field}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium">{s.label}</span>
                    <span className="ml-2 text-muted-foreground">
                      ({s.table}.{s.field})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!s.sample_checked && (
                      <span className="text-xs text-muted-foreground">
                        sem dados
                      </span>
                    )}
                    {s.sample_checked &&
                      (s.encrypted ? (
                        <Badge
                          variant="default"
                          className="gap-1 bg-green-600 text-xs"
                        >
                          <Lock className="h-3 w-3" />
                          Cifrado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Info className="h-3 w-3" />
                          Texto plano
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Seção: Políticas de Retenção ────────────────────────────────────────────

function RetentionPoliciesSection({
  policies,
}: {
  policies: RetentionPolicy[]
}) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState<Record<string, string>>({})

  const handleSave = (entity: string) => {
    const days = parseInt(editing[entity] ?? "")
    if (isNaN(days) || days < 1) {
      toast.error("Período inválido")
      return
    }
    startTransition(async () => {
      const result = await updateRetentionPolicy(entity, days)
      if (result.success) {
        toast.success("Política de retenção atualizada")
        setEditing((prev) => {
          const next = { ...prev }
          delete next[entity]
          return next
        })
      } else {
        toast.error(result.error ?? "Erro ao atualizar")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5 text-primary" />
          Política de Retenção de Dados
        </h2>
        <p className="text-sm text-muted-foreground">
          Por quanto tempo cada tipo de dado é mantido (LGPD Art. 15 e 16).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {policies.map((policy) => (
          <Card key={policy.entity}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{policy.label}</CardTitle>
              <CardDescription className="text-xs">
                {policy.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  className="w-24"
                  value={editing[policy.entity] ?? policy.retention_days}
                  onChange={(e) =>
                    setEditing((prev) => ({
                      ...prev,
                      [policy.entity]: e.target.value,
                    }))
                  }
                />
                <span className="text-sm text-muted-foreground">dias</span>
                {editing[policy.entity] !== undefined && (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleSave(policy.entity)}
                  >
                    Salvar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Seção: Exportação de Dados ───────────────────────────────────────────────

function ExportSection() {
  const [isPending, startTransition] = useTransition()
  const [userQuery, setUserQuery] = useState("")
  const [patientQuery, setPatientQuery] = useState("")
  const [userResults, setUserResults] = useState<
    { id: string; name: string; email: string; role: string }[]
  >([])
  const [patientResults, setPatientResults] = useState<
    { id: string; name: string; clinic_name: string }[]
  >([])

  const searchUsers = () => {
    if (!userQuery.trim()) return
    startTransition(async () => {
      const results = await searchUsersForLgpd(userQuery)
      setUserResults(results)
    })
  }

  const searchPatients = () => {
    if (!patientQuery.trim()) return
    startTransition(async () => {
      const results = await searchPatientsForLgpd(patientQuery)
      setPatientResults(results)
    })
  }

  const handleExportUser = (userId: string, userName: string) => {
    startTransition(async () => {
      const result = await exportUserDataAction(userId)
      if (result.success && result.data) {
        downloadJson(result.data, `lgpd-usuario-${userId.slice(0, 8)}.json`)
        toast.success(`Dados de ${userName} exportados com sucesso`)
      } else {
        toast.error(result.error ?? "Erro ao exportar dados")
      }
    })
  }

  const handleExportPatient = (patientId: string, patientName: string) => {
    startTransition(async () => {
      const result = await exportPatientDataAction(patientId)
      if (result.success && result.data) {
        downloadJson(result.data, `lgpd-paciente-${patientId.slice(0, 8)}.json`)
        toast.success(`Dados de ${patientName} exportados com sucesso`)
      } else {
        toast.error(result.error ?? "Erro ao exportar dados")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Download className="h-5 w-5 text-primary" />
          Exportação de Dados (Portabilidade)
        </h2>
        <p className="text-sm text-muted-foreground">
          Exporte todos os dados de um titular em formato JSON (LGPD Art. 18,
          V).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Exportar usuário */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dados de Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nome ou email..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={searchUsers}
                disabled={isPending}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {userResults.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleExportUser(u.id, u.name)}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Exportar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Exportar paciente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dados de Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do paciente..."
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPatients()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={searchPatients}
                disabled={isPending}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {patientResults.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.clinic_name}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleExportPatient(p.id, p.name)}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Exportar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Seção: Anonimização ─────────────────────────────────────────────────────

function AnonymizeSection() {
  const [isPending, startTransition] = useTransition()
  const [userQuery, setUserQuery] = useState("")
  const [patientQuery, setPatientQuery] = useState("")
  const [userResults, setUserResults] = useState<
    { id: string; name: string; email: string; role: string }[]
  >([])
  const [patientResults, setPatientResults] = useState<
    { id: string; name: string; clinic_name: string }[]
  >([])
  const [confirmUser, setConfirmUser] = useState<{
    id: string
    name: string
  } | null>(null)
  const [confirmPatient, setConfirmPatient] = useState<{
    id: string
    name: string
  } | null>(null)

  const searchUsers = () => {
    if (!userQuery.trim()) return
    startTransition(async () => {
      const results = await searchUsersForLgpd(userQuery)
      setUserResults(results)
    })
  }

  const searchPatients = () => {
    if (!patientQuery.trim()) return
    startTransition(async () => {
      const results = await searchPatientsForLgpd(patientQuery)
      setPatientResults(results)
    })
  }

  const handleAnonymizeUser = () => {
    if (!confirmUser) return
    const { id, name } = confirmUser
    setConfirmUser(null)
    startTransition(async () => {
      const result = await anonymizeUserAction(id)
      if (result.success) {
        toast.success(`Dados de ${name} anonimizados`)
        setUserResults((prev) => prev.filter((u) => u.id !== id))
      } else {
        toast.error(result.error ?? "Erro ao anonimizar")
      }
    })
  }

  const handleAnonymizePatient = () => {
    if (!confirmPatient) return
    const { id, name } = confirmPatient
    setConfirmPatient(null)
    startTransition(async () => {
      const result = await anonymizePatientAction(id)
      if (result.success) {
        toast.success(`Dados de ${name} anonimizados`)
        setPatientResults((prev) => prev.filter((p) => p.id !== id))
      } else {
        toast.error(result.error ?? "Erro ao anonimizar")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <UserX className="h-5 w-5 text-primary" />
          Anonimização (Direito ao Esquecimento)
        </h2>
        <p className="text-sm text-muted-foreground">
          Substitui dados pessoais por valores anônimos, mantendo registros
          operacionais. Irreversível. (LGPD Art. 18, VI)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Anonimizar usuário */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Anonimizar Usuário</CardTitle>
            <CardDescription className="text-xs">
              Remove nome, email e bloqueia o acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nome ou email..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={searchUsers}
                disabled={isPending}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {userResults.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setConfirmUser({ id: u.id, name: u.name })}
                >
                  <UserX className="mr-1 h-3 w-3" />
                  Anonimizar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Anonimizar paciente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Anonimizar Paciente</CardTitle>
            <CardDescription className="text-xs">
              Remove nome e data de nascimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do paciente..."
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPatients()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={searchPatients}
                disabled={isPending}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {patientResults.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.clinic_name}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setConfirmPatient({ id: p.id, name: p.name })}
                >
                  <UserX className="mr-1 h-3 w-3" />
                  Anonimizar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Confirmação usuário */}
      <AlertDialog
        open={!!confirmUser}
        onOpenChange={(open) => !open && setConfirmUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anonimizar usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Os dados pessoais de <strong>{confirmUser?.name}</strong> serão
              substituídos por valores anônimos e o acesso será bloqueado. Esta
              ação é <strong>irreversível</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleAnonymizeUser}
              disabled={isPending}
            >
              Confirmar Anonimização
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação paciente */}
      <AlertDialog
        open={!!confirmPatient}
        onOpenChange={(open) => !open && setConfirmPatient(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anonimizar paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Os dados pessoais de <strong>{confirmPatient?.name}</strong> (nome
              e data de nascimento) serão removidos. Esta ação é{" "}
              <strong>irreversível</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleAnonymizePatient}
              disabled={isPending}
            >
              Confirmar Anonimização
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadJson(json: string, filename: string) {
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
