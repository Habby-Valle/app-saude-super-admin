"use server"

import { revalidatePath } from "next/cache"
import { requireSuperAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { checklistFormSchema } from "@/lib/validations/checklist"
import type {
  ChecklistFormValues,
  ChecklistItemType,
} from "@/lib/validations/checklist"
import type { Clinic } from "@/types/database"
import { logAuditEvent } from "@/app/(main)/(super-admin)/super-admin/audit-logs/actions"

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"]
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

export async function uploadChecklistIcon(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  await requireSuperAdmin()

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return { success: false, error: "Arquivo não enviado" }
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return { success: false, error: "Formato inválido. Use PNG, JPG ou WebP" }
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { success: false, error: "Arquivo muito grande. Máximo 2MB" }
  }

  const ext = file.name.split(".").pop() ?? "png"
  const fileName = `${crypto.randomUUID()}.${ext}`
  const admin = createAdminClient()

  const { error: uploadError } = await admin.storage
    .from("checklist-icons")
    .upload(fileName, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error("[uploadChecklistIcon]", uploadError)
    return { success: false, error: uploadError.message }
  }

  const { data } = admin.storage.from("checklist-icons").getPublicUrl(fileName)
  return { success: true, url: data.publicUrl }
}

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

export interface ChecklistWithDetails {
  id: string
  name: string
  icon: string | null
  clinic_id: string | null
  order: number
  created_at: string
  clinic_name: string | null
  item_count: number
  is_used: boolean
  checklist_items?: ChecklistItemWithOptions[]
}

export interface ChecklistsResult {
  checklists: ChecklistWithDetails[]
  total: number
}

export async function getChecklists(params: {
  search?: string
  scope?: "all" | "global" | "clinic"
  clinicId?: string
  page?: number
  pageSize?: number
}): Promise<ChecklistsResult> {
  const { supabase } = await requireSuperAdmin()

  const {
    search = "",
    scope = "all",
    clinicId,
    page = 1,
    pageSize = 10,
  } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("checklists")
    .select(
      `
      *,
      clinic:clinics(name)
    `,
      { count: "exact" }
    )
    .order("name")
    .range(from, to)

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`)
  }

  if (scope === "global") {
    query = query.is("clinic_id", null)
  } else if (scope === "clinic") {
    query = query.not("clinic_id", "is", null)
    if (clinicId && clinicId !== "all") {
      query = query.eq("clinic_id", clinicId)
    }
  }

  const { data, count, error } = await query

  if (error) {
    console.error("[getChecklists] Supabase error:", error)
    throw new Error(error.message)
  }

  // Busca contagem de itens em lote
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

  const checklists: ChecklistWithDetails[] = (data ?? []).map((c) => ({
    ...c,
    clinic_name: (c.clinic as { name: string } | null)?.name ?? null,
    item_count: itemCounts[c.id] ?? 0,
    is_used: false,
  }))

  return { checklists, total: count ?? 0 }
}

export async function getChecklistById(
  id: string
): Promise<ChecklistWithDetails | null> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("checklists")
    .select(
      `
      *,
      clinic:clinics(name),
      checklist_items(
        *,
        checklist_item_options(*)
      )
    `
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("[getChecklistById] Supabase error:", error)
    return null
  }

  return {
    ...data,
    clinic_name: (data.clinic as { name: string } | null)?.name ?? null,
    item_count: (data.checklist_items as unknown[])?.length ?? 0,
    is_used: false,
  }
}

export async function getClinicsForChecklist(): Promise<
  Pick<Clinic, "id" | "name">[]
> {
  const { supabase } = await requireSuperAdmin()

  const { data, error } = await supabase
    .from("clinics")
    .select("id, name")
    .eq("status", "active")
    .order("name")

  if (error) {
    console.error("[getClinicsForChecklist] Supabase error:", error)
    return []
  }

  return data ?? []
}

export async function createChecklist(
  raw: ChecklistFormValues
): Promise<{ success: boolean; error?: string; id?: string }> {
  const { supabase } = await requireSuperAdmin()

  const result = checklistFormSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { name, icon, clinic_id, items } = result.data

  const { data: checklist, error: checklistError } = await supabase
    .from("checklists")
    .insert({
      name,
      icon: icon ?? null,
      clinic_id: clinic_id ?? null,
      order: 0,
    })
    .select()
    .single()

  if (checklistError) {
    console.error("[createChecklist] Supabase error:", checklistError)
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
      console.error("[createChecklist] items error:", itemsError)
      await supabase.from("checklists").delete().eq("id", checklist.id)
      return { success: false, error: itemsError.message }
    }

    for (let i = 0; i < (insertedItems ?? []).length; i++) {
      const item = items[i]
      const insertedItem = insertedItems![i]

      if (item.type === "select" && item.options && item.options.length > 0) {
        const optionsToInsert = item.options.map((opt) => ({
          checklist_item_id: insertedItem.id,
          label: opt.label,
          value: opt.value,
        }))

        await supabase.from("checklist_item_options").insert(optionsToInsert)
      }
    }
  }

  await logAuditEvent("create", "checklist", checklist.id).catch(() => {})
  revalidatePath("/checklists")
  return { success: true, id: checklist.id }
}

export async function updateChecklist(
  id: string,
  raw: ChecklistFormValues
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()

  const result = checklistFormSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { name, icon, clinic_id, items } = result.data

  const { error: updateError } = await supabase
    .from("checklists")
    .update({
      name,
      icon: icon ?? null,
      clinic_id: clinic_id ?? null,
    })
    .eq("id", id)

  if (updateError) {
    console.error("[updateChecklist] Supabase error:", updateError)
    return { success: false, error: updateError.message }
  }

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
      console.error("[updateChecklist] items error:", itemsError)
      return { success: false, error: itemsError.message }
    }

    for (let i = 0; i < (insertedItems ?? []).length; i++) {
      const item = items[i]
      const insertedItem = insertedItems![i]

      if (item.type === "select" && item.options && item.options.length > 0) {
        const optionsToInsert = item.options.map((opt) => ({
          checklist_item_id: insertedItem.id,
          label: opt.label,
          value: opt.value,
        }))

        await supabase.from("checklist_item_options").insert(optionsToInsert)
      }
    }
  }

  await logAuditEvent("update", "checklist", id).catch(() => {})
  revalidatePath("/checklists")
  return { success: true }
}

export async function deleteChecklist(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()

  const { count } = await supabase
    .from("shift_checklists")
    .select("*", { count: "exact", head: true })
    .eq("checklist_id", id)

  if (count && count > 0) {
    return {
      success: false,
      error: "Este template já foi usado e não pode ser excluído",
    }
  }

  await supabase
    .from("checklist_item_options")
    .delete()
    .in(
      "checklist_item_id",
      (
        await supabase
          .from("checklist_items")
          .select("id")
          .eq("checklist_id", id)
      ).data?.map((i) => i.id) ?? []
    )

  await supabase.from("checklist_items").delete().eq("checklist_id", id)

  const { error } = await supabase.from("checklists").delete().eq("id", id)

  if (error) {
    console.error("[deleteChecklist] Supabase error:", error)
    return { success: false, error: error.message }
  }

  await logAuditEvent("delete", "checklist", id).catch(() => {})
  revalidatePath("/checklists")
  return { success: true }
}

export async function duplicateChecklist(
  id: string,
  targetClinicId: string | null
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireSuperAdmin()

  const checklist = await getChecklistById(id)
  if (!checklist) {
    return { success: false, error: "Template não encontrado" }
  }

  const originalItems = checklist.checklist_items as unknown as {
    id: string
    name: string
    type: string
    required: boolean
    has_observation: boolean
    checklist_item_options?: { label: string; value: string }[]
  }[]

  const { data: newChecklist, error: checklistError } = await supabase
    .from("checklists")
    .insert({
      name: `${checklist.name} (cópia)`,
      icon: checklist.icon,
      clinic_id: targetClinicId,
      order: 0,
    })
    .select()
    .single()

  if (checklistError) {
    console.error("[duplicateChecklist] Supabase error:", checklistError)
    return { success: false, error: checklistError.message }
  }

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
      console.error("[duplicateChecklist] items error:", itemsError)
      return { success: false, error: itemsError.message }
    }

    for (let i = 0; i < (insertedItems ?? []).length; i++) {
      const originalItem = originalItems[i]

      if (
        originalItem.type === "select" &&
        originalItem.checklist_item_options &&
        originalItem.checklist_item_options.length > 0
      ) {
        const optionsToInsert = originalItem.checklist_item_options.map(
          (opt) => ({
            checklist_item_id: insertedItems![i].id,
            label: opt.label,
            value: opt.value,
          })
        )

        await supabase.from("checklist_item_options").insert(optionsToInsert)
      }
    }
  }

  await logAuditEvent("create", "checklist", newChecklist.id).catch(() => {})
  revalidatePath("/checklists")
  return { success: true }
}
