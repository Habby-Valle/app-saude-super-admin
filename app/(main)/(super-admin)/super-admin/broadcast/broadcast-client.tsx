"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Megaphone, Send, Users } from "lucide-react"
import { toast } from "sonner"

interface BroadcastNotification {
  id: string
  title: string
  message: string
  target_role: string
  status: string
  recipient_count: number
  sent_count: number
  failed_count: number
  created_at: string
  sent_at: string | null
}

interface BroadcastClientProps {
  notifications: BroadcastNotification[]
  page: number
  pageSize: number
}

const ROLE_LABELS: Record<string, string> = {
  all: "Todos (Cuidadores, Familiares, Emerg.)",
  caregiver: "Cuidadores",
  family: "Familiares",
  emergency_contact: "Contatos de Emerg.",
}

const STATUS_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  sending: "secondary",
  sent: "default",
  failed: "destructive",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  sending: "Enviando",
  sent: "Enviado",
  failed: "Falhou",
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function BroadcastClient({
  notifications: initialNotifications,
  page,
  pageSize,
}: BroadcastClientProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetRole, setTargetRole] = useState<string>("all")
  const [sending, setSending] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha o título e a mensagem")
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          target_role: targetRole,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          `Notificação enviada para ${result.recipientCount} destinatários`
        )
        setTitle("")
        setMessage("")

        const updated = await fetch("/api/broadcast", { cache: "no-store" })
        const refreshed = await updated.json()
        setNotifications(Array.isArray(refreshed) ? refreshed : [])
      } else {
        toast.error(result.error || "Erro ao enviar")
      }
    } catch {
      toast.error("Erro ao enviar notificação")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Nova Notificação
          </CardTitle>
          <CardDescription>
            Envie uma notificação por email para os usuários selecionados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Manutenção programada"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: O sistema estará em manutenção..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Destinatários</Label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <Users className="mr-2 inline h-4 w-4" />
                  Todos (Cuidadores, Familiares, Emerg.)
                </SelectItem>
                <SelectItem value="caregiver">Cuidadores</SelectItem>
                <SelectItem value="family">Familiares</SelectItem>
                <SelectItem value="emergency_contact">
                  Contatos de Emerg.
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSend} disabled={sending} className="gap-2">
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? "Enviando..." : "Enviar Notificação"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Configure a variável RESEND_API_KEY no .env.local para ativar o
            envio real de emails.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Histórico de Envios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma notificação enviada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{n.title}</p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {n.message.slice(0, 100)}
                      {n.message.length > 100 ? "..." : ""}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{ROLE_LABELS[n.target_role] ?? n.target_role}</span>
                      <span>•</span>
                      <span>{n.recipient_count} destinatários</span>
                      <span>•</span>
                      <span>
                        {n.sent_count}/{n.recipient_count} enviados
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={STATUS_COLORS[n.status] ?? "outline"}>
                      {STATUS_LABELS[n.status] ?? n.status}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(n.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
