import { NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth"

interface BroadcastNotification {
  title: string
  message: string
  target_role: "all" | "caregiver" | "family" | "emergency_contact"
}

export async function GET() {
  try {
    const { supabase } = await requireSuperAdmin()

    const { data, error } = await supabase
      .from("broadcast_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireSuperAdmin()

    const body: BroadcastNotification = await request.json()
    const { title, message, target_role } = body

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Título e mensagem são obrigatórios" },
        { status: 400 }
      )
    }

    const roleFilter =
      target_role === "all"
        ? ["caregiver", "family", "emergency_contact"]
        : [target_role]

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, name, role")
      .in("role", roleFilter)
      .eq("status", "active")

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    const recipientCount = users?.length ?? 0

    const { data: notification, error: insertError } = await supabase
      .from("broadcast_notifications")
      .insert({
        title: title.trim(),
        message: message.trim(),
        target_role: target_role ?? "all",
        status: "pending",
        recipient_count: recipientCount,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    let sentCount = 0
    let failedCount = 0

    // Envio via Resend (se configurado)
    // Configure RESEND_API_KEY no .env.local para ativar
    if (recipientCount > 0 && process.env.RESEND_API_KEY) {
      sentCount = recipientCount // Simulado - em produção implementar com API real
      console.log(
        `[broadcast] Would send to ${recipientCount} users via Resend`
      )
    }

    await supabase
      .from("broadcast_notifications")
      .update({
        status: sentCount > 0 ? "sent" : "pending",
        sent_count: sentCount,
        failed_count: failedCount,
        sent_at: sentCount > 0 ? new Date().toISOString() : null,
      })
      .eq("id", notification.id)

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      recipientCount,
      sentCount,
      failedCount,
    })
  } catch (error) {
    console.error("[broadcast] Error:", error)
    return NextResponse.json(
      { error: "Erro ao enviar notificação" },
      { status: 500 }
    )
  }
}
