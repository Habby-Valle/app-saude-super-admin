"use server"

import { revalidatePath } from "next/cache"
import { requireClinicAdmin } from "@/lib/auth"
import type { ChecklistFormValues, ChecklistItemType } from "@/lib/validations/checklist"
import { checklistFormSchema } from "@/lib/validations/checklist"

export interface ChecklistItemOption {
  id: string
  label: string
  value: string
}

export interface ChecklistItemWithOptions {
  id: string
  name: string
  type: string
  required: boolean
  has_observation: boolean
  checklist_item_options?: ChecklistItemOption[]
}

export interface ClinicChecklistWithDetails {
  id: string
  name: string
  icon: string | null
  clinic_id: string | null
  order: number
  created_at: string
  item_count: number
  is_global: boolean // clinic_id IS NULL
  is_mine: boolean   // clinic_id = clinicId (pode editar/excluir)
  checklist_items?: ChecklistItemWithOptions[]
}

export interface ClinicChecklistsResult {
  checklists: ClinicChecklistWithDetails[]
  total: number
}

export async function getClinicChecklists(params: {
  search?: string
  scope?: "all" | "global" | "mine"
  page?: number
  pageSize?: number
}): Promise<ClinicChecklistsResult> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const { search = "", scope = "all", page = 1, pageSize = 10 } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("checklists")
    .select(`*`, { count: "exact" })
    .order("name")
    .range(from, to)

  if (scope === "global") {
    query = query.is("clinic_id", null)
  } else if (scope === "mine") {
    query = query.eq("clinic_id", clinicId)
  } else {
    // all: global + da clínica
    query = query.or(`clinic_id.is.null,clinic_id.eq.${clinicId}`)
  }

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`)
  }

  const { data, count, error } = await query

  if (error) {
    console.error("[getClinicChecklists] Supabase error:", error)
    throw new Error(error.message)
  }

  // Busca contagem de itens em lote (mesmo padrão de pacientes nos cuidadores)
  const checklistIds = (data ?? []).map((c) => c.id)
  const itemCounts: Record<string, number> = {}

  if (checklistIds.length > 0) {
    const { data: allItems } = await supabase
      .from("checklist_items")
      .select("checklist_id")
      .in("checklist_id", checklistIds)

    allItems?.forEach((item) => {
      itemCounts[item.checklist_id] = (itemCounts[item.checklist_id] || 0) + 1
    })
  }

  const checklists: ClinicChecklistWithDetails[] = (data ?? []).map((c) => ({
    ...c,
    item_count: itemCounts[c.id] ?? 0,
    is_global: c.clinic_id === null,
    is_mine: c.clinic_id === clinicId,
  }))

  return { checklists, total: count ?? 0 }
}

export async function getClinicChecklistById(
  id: string
): Promise<ClinicChecklistWithDetails | null> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const { data, error } = await supabase
    .from("checklists")
    .select(`*, checklist_items(*, checklist_item_options(*))`)
    .eq("id", id)
    .single()

  if (error || !data) return null

  // Somente pode buscar detalhes de checklists globais ou da própria clínica
  if (data.clinic_id !== null && data.clinic_id !== clinicId) return null

  return {
    ...data,
    item_count: (data.checklist_items as unknown[])?.length ?? 0,
    is_global: data.clinic_id === null,
    is_mine: data.clinic_id === clinicId,
  }
}

export async function createClinicChecklist(
  raw: ChecklistFormValues
): Promise<{ success: boolean; error?: string }> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const result = checklistFormSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { name, icon, items } = result.data

  const { data: checklist, error: checklistError } = await supabase
    .from("checklists")
    .insert({ name, icon: icon ?? null, clinic_id: clinicId, order: 0 })
    .select()
    .single()

  if (checklistError) {
    console.error("[createClinicChecklist] error:", checklistError)
    return { success: false, error: checklistError.message }
  }

  if (items.length > 0) {
    const itemsToInsert = items.map((item) => ({
      checklist_id: checklist.id,
      name: item.name,
      type: item.type as ChecklistItemType,
      required: item.required,
      has_observation: item.has_observation,
    }))

    const { data: insertedItems, error: itemsError } = await supabase
      .from("checklist_items")
      .insert(itemsToInsert)
      .select()

    if (itemsError) {
      console.error("[createClinicChecklist] items error:", itemsError)
      await supabase.from("checklists").delete().eq("id", checklist.id)
      return { success: false, error: itemsError.message }
    }

    for (let i = 0; i < (insertedItems ?? []).length; i++) {
      const item = items[i]
      const inserted = insertedItems![i]
      if (item.type === "select" && item.options && item.options.length > 0) {
        await supabase.from("checklist_item_options").insert(
          item.options.map((opt) => ({
            checklist_item_id: inserted.id,
            label: opt.label,
            value: opt.value,
          }))
        )
      }
    }
  }

  revalidatePath("/admin/checklists")
  return { success: true }
}

export async function updateClinicChecklist(
  id: string,
  raw: ChecklistFormValues
): Promise<{ success: boolean; error?: string }> {
  const { supabase, clinicId } = await requireClinicAdmin()

  // Garante que só edita checklists da própria clínica
  const { data: existing } = await supabase
    .from("checklists")
    .select("clinic_id")
    .eq("id", id)
    .single()

  if (!existing || existing.clinic_id !== clinicId) {
    return { success: false, error: "Você não tem permissão para editar este checklist." }
  }

  const result = checklistFormSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { name, icon, items } = result.data

  const { error: updateError } = await supabase
    .from("checklists")
    .update({ name, icon: icon ?? null })
    .eq("id", id)

  if (updateError) {
    console.error("[updateClinicChecklist] error:", updateError)
    return { success: false, error: updateError.message }
  }

  // Recria todos os itens (delete + insert)
  await supabase.from("checklist_items").delete().eq("checklist_id", id)

  if (items.length > 0) {
    const itemsToInsert = items.map((item) => ({
      checklist_id: id,
      name: item.name,
      type: item.type as ChecklistItemType,
      required: item.required,
      has_observation: item.has_observation,
    }))

    const { data: insertedItems, error: itemsError } = await supabase
      .from("checklist_items")
      .insert(itemsToInsert)
      .select()

    if (itemsError) {
      console.error("[updateClinicChecklist] items error:", itemsError)
      return { success: false, error: itemsError.message }
    }

    for (let i = 0; i < (insertedItems ?? []).length; i++) {
      const item = items[i]
      const inserted = insertedItems![i]
      if (item.type === "select" && item.options && item.options.length > 0) {
        await supabase.from("checklist_item_options").insert(
          item.options.map((opt) => ({
            checklist_item_id: inserted.id,
            label: opt.label,
            value: opt.value,
          }))
        )
      }
    }
  }

  revalidatePath("/admin/checklists")
  return { success: true }
}

export async function deleteClinicChecklist(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, clinicId } = await requireClinicAdmin()

  // Garante que só exclui checklists da própria clínica
  const { data: existing } = await supabase
    .from("checklists")
    .select("clinic_id")
    .eq("id", id)
    .single()

  if (!existing || existing.clinic_id !== clinicId) {
    return { success: false, error: "Você não tem permissão para excluir este checklist." }
  }

  // Verifica se já foi utilizado em turnos
  const { count } = await supabase
    .from("shift_checklists")
    .select("*", { count: "exact", head: true })
    .eq("checklist_id", id)

  if (count && count > 0) {
    return { success: false, error: "Este checklist já foi utilizado e não pode ser excluído." }
  }

  // Remove opções → itens → checklist
  const { data: itemIds } = await supabase
    .from("checklist_items")
    .select("id")
    .eq("checklist_id", id)

  if (itemIds && itemIds.length > 0) {
    await supabase
      .from("checklist_item_options")
      .delete()
      .in("checklist_item_id", itemIds.map((i) => i.id))
  }

  await supabase.from("checklist_items").delete().eq("checklist_id", id)

  const { error } = await supabase.from("checklists").delete().eq("id", id)

  if (error) {
    console.error("[deleteClinicChecklist] error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/checklists")
  return { success: true }
}

export async function duplicateToClinic(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, clinicId } = await requireClinicAdmin()

  const checklist = await getClinicChecklistById(id)
  if (!checklist) {
    return { success: false, error: "Checklist não encontrado." }
  }

  const { data: newChecklist, error: clError } = await supabase
    .from("checklists")
    .insert({
      name: `${checklist.name} (cópia)`,
      icon: checklist.icon,
      clinic_id: clinicId,
      order: 0,
    })
    .select()
    .single()

  if (clError) {
    console.error("[duplicateToClinic] error:", clError)
    return { success: false, error: clError.message }
  }

  const originalItems = (checklist.checklist_items ?? []) as ChecklistItemWithOptions[]

  if (originalItems.length > 0) {
    const itemsToInsert = originalItems.map((item) => ({
      checklist_id: newChecklist.id,
      name: item.name,
      type: item.type,
      required: item.required,
      has_observation: item.has_observation,
    }))

    const { data: insertedItems, error: itemsError } = await supabase
      .from("checklist_items")
      .insert(itemsToInsert)
      .select()

    if (itemsError) {
      console.error("[duplicateToClinic] items error:", itemsError)
      return { success: false, error: itemsError.message }
    }

    for (let i = 0; i < (insertedItems ?? []).length; i++) {
      const orig = originalItems[i]
      if (
        orig.type === "select" &&
        orig.checklist_item_options &&
        orig.checklist_item_options.length > 0
      ) {
        await supabase.from("checklist_item_options").insert(
          orig.checklist_item_options.map((opt) => ({
            checklist_item_id: insertedItems![i].id,
            label: opt.label,
            value: opt.value,
          }))
        )
      }
    }
  }

  revalidatePath("/admin/checklists")
  return { success: true }
}
