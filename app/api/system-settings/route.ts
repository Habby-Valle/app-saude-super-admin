import { NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const { supabase } = await requireSuperAdmin()

    const { data, error } = await supabase
      .from("system_settings")
      .select("maintenance_mode, maintenance_message, maintenance_planned_end")
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
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireSuperAdmin()

    const body = await request.json()
    const { maintenance_mode, maintenance_message, maintenance_planned_end } =
      body

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
