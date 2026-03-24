-- ============================================================
-- Migration 009: Corrige recursão nas políticas RLS
-- Usa SECURITY DEFINER function para verificar role sem recursão
-- ============================================================

-- Função auxiliar que lê o role do usuário atual sem acionar RLS
-- SECURITY DEFINER = executa como owner da função, bypassando RLS
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- ── public.users — drop das políticas recursivas ─────────────

drop policy if exists "super_admin_all_users" on public.users;
drop policy if exists "clinic_admin_read_own_users" on public.users;

create policy "super_admin_all_users" on public.users
  for all
  using (public.get_my_role() = 'super_admin');

create policy "clinic_admin_read_own_users" on public.users
  for select
  using (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = (
      select clinic_id from public.users where id = auth.uid()
    )
  );

-- ── public.clinics ────────────────────────────────────────────

drop policy if exists "super_admin_all_clinics" on public.clinics;
drop policy if exists "clinic_admin_read_own" on public.clinics;

create policy "super_admin_all_clinics" on public.clinics
  for all
  using (public.get_my_role() = 'super_admin');

create policy "clinic_admin_read_own" on public.clinics
  for select
  using (
    id = (select clinic_id from public.users where id = auth.uid())
  );

-- ── public.patients ───────────────────────────────────────────

drop policy if exists "super_admin_all_patients" on public.patients;
drop policy if exists "clinic_users_read_own_patients" on public.patients;

create policy "super_admin_all_patients" on public.patients
  for all
  using (public.get_my_role() = 'super_admin');

create policy "clinic_users_read_own_patients" on public.patients
  for select
  using (
    clinic_id = (select clinic_id from public.users where id = auth.uid())
  );

-- ── public.caregiver_patient ──────────────────────────────────

drop policy if exists "super_admin_all_caregiver_patient" on public.caregiver_patient;

create policy "super_admin_all_caregiver_patient" on public.caregiver_patient
  for all
  using (public.get_my_role() = 'super_admin');

-- ── public.emergency_contacts ─────────────────────────────────

drop policy if exists "super_admin_all_emergency_contacts" on public.emergency_contacts;

create policy "super_admin_all_emergency_contacts" on public.emergency_contacts
  for all
  using (public.get_my_role() = 'super_admin');

-- ── public.checklists ─────────────────────────────────────────

drop policy if exists "super_admin_all_checklists" on public.checklists;
drop policy if exists "clinic_users_read_checklists" on public.checklists;

create policy "super_admin_all_checklists" on public.checklists
  for all
  using (public.get_my_role() = 'super_admin');

create policy "clinic_users_read_checklists" on public.checklists
  for select
  using (
    clinic_id is null
    or clinic_id = (select clinic_id from public.users where id = auth.uid())
  );

-- ── public.checklist_items ────────────────────────────────────

drop policy if exists "super_admin_all_checklist_items" on public.checklist_items;
drop policy if exists "clinic_users_read_checklist_items" on public.checklist_items;

create policy "super_admin_all_checklist_items" on public.checklist_items
  for all
  using (public.get_my_role() = 'super_admin');

create policy "clinic_users_read_checklist_items" on public.checklist_items
  for select
  using (
    exists (
      select 1 from public.checklists c
      where c.id = checklist_id
        and (
          c.clinic_id is null
          or c.clinic_id = (select clinic_id from public.users where id = auth.uid())
        )
    )
  );

-- ── public.checklist_item_options ─────────────────────────────

drop policy if exists "super_admin_all_checklist_item_options" on public.checklist_item_options;
drop policy if exists "clinic_users_read_checklist_item_options" on public.checklist_item_options;

create policy "super_admin_all_checklist_item_options" on public.checklist_item_options
  for all
  using (public.get_my_role() = 'super_admin');

create policy "clinic_users_read_checklist_item_options" on public.checklist_item_options
  for select
  using (
    exists (
      select 1 from public.checklist_items ci
      join public.checklists c on c.id = ci.checklist_id
      where ci.id = checklist_item_id
        and (
          c.clinic_id is null
          or c.clinic_id = (select clinic_id from public.users where id = auth.uid())
        )
    )
  );

-- ── public.shifts ─────────────────────────────────────────────

drop policy if exists "super_admin_all_shifts" on public.shifts;
drop policy if exists "clinic_users_read_own_shifts" on public.shifts;

create policy "super_admin_all_shifts" on public.shifts
  for all
  using (public.get_my_role() = 'super_admin');

create policy "clinic_users_read_own_shifts" on public.shifts
  for select
  using (
    clinic_id = (select clinic_id from public.users where id = auth.uid())
  );

-- ── public.shift_checklists ───────────────────────────────────

drop policy if exists "super_admin_all_shift_checklists" on public.shift_checklists;

create policy "super_admin_all_shift_checklists" on public.shift_checklists
  for all
  using (public.get_my_role() = 'super_admin');

-- ── public.shift_checklist_items ─────────────────────────────

drop policy if exists "super_admin_all_shift_checklist_items" on public.shift_checklist_items;

create policy "super_admin_all_shift_checklist_items" on public.shift_checklist_items
  for all
  using (public.get_my_role() = 'super_admin');

-- ── public.audit_logs ─────────────────────────────────────────

drop policy if exists "super_admin_read_audit_logs" on public.audit_logs;
drop policy if exists "super_admin_insert_audit_logs" on public.audit_logs;

create policy "super_admin_read_audit_logs" on public.audit_logs
  for select
  using (public.get_my_role() = 'super_admin');

create policy "super_admin_insert_audit_logs" on public.audit_logs
  for insert
  with check (public.get_my_role() = 'super_admin');
