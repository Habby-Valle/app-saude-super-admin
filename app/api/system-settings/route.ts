import { NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const { supabase } = await requireSuperAdmin()

    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      maintenance_mode: data?.maintenance_mode ?? false,
      maintenance_message:
        data?.maintenance_message ??
        "Sistema em manutenção. Em breve retornaremos.",
      maintenance_planned_end: data?.maintenance_planned_end,
      app_name: data?.app_name ?? "App Saúde",
      app_url: data?.app_url ?? "",
      app_site_url: data?.app_site_url ?? "",
      app_store_url: data?.app_store_url ?? "",
      play_store_url: data?.play_store_url ?? "",
      support_email: data?.support_email ?? "",
      support_phone: data?.support_phone ?? "",
      support_whatsapp: data?.support_whatsapp ?? "",
      admin_logo_url: data?.admin_logo_url ?? "",
      cnpj: data?.cnpj ?? "",
      address: data?.address ?? "",
      timezone: data?.timezone ?? "America/Sao_Paulo",
      currency: data?.currency ?? "BRL",
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireSuperAdmin()

    const body = await request.json()
    const {
      maintenance_mode,
      maintenance_message,
      maintenance_planned_end,
      app_name,
      app_url,
      app_site_url,
      app_store_url,
      play_store_url,
      support_email,
      support_phone,
      support_whatsapp,
      admin_logo_url,
      cnpj,
      address,
      timezone,
      currency,
    } = body

    const { data: existing } = await supabase
      .from("system_settings")
      .select("id")
      .limit(1)
      .maybeSingle()

    if (!existing?.id) {
      return NextResponse.json(
        { error: "Configuração não encontrada" },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from("system_settings")
      .update({
        maintenance_mode,
        maintenance_message,
        maintenance_planned_end: maintenance_planned_end || null,
        app_name,
        app_url,
        app_site_url,
        app_store_url,
        play_store_url,
        support_email,
        support_phone,
        support_whatsapp,
        admin_logo_url,
        cnpj,
        address,
        timezone,
        currency,
      })
      .eq("id", existing.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
