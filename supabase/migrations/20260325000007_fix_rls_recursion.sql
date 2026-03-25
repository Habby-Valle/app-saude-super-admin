-- ============================================================
-- 007: Corrige recursão nas policies
--
-- Problema: policies que fazem (select ... from public.users)
-- dentro de policies de public.users causam recursão infinita,
-- mesmo com get_my_role() sendo SECURITY DEFINER.
--
-- Solução: criar get_my_clinic_id() também SECURITY DEFINER
-- e substituir todos os subqueries recursivos.
-- ============================================================

-- Função auxiliar para obter clinic_id sem acionar RLS
create or replace function public.get_my_clinic_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select clinic_id from public.users where id = auth.uid();
$$;

-- ── Corrigir policies recursivas em public.users ─────────────

drop policy if exists "clinic_admin_read_own_clinic_users" on public.users;

create policy "clinic_admin_read_own_clinic_users" on public.users
  for select
  using (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  );

-- ── Corrigir policy em public.clinics ─────────────────────────

drop policy if exists "clinic_admin_read_own_clinic" on public.clinics;

create policy "clinic_admin_read_own_clinic" on public.clinics
  for select
  using (id = public.get_my_clinic_id());

-- ── Corrigir policies em public.patients ─────────────────────

drop policy if exists "clinic_users_read_own_patients" on public.patients;

create policy "clinic_users_read_own_patients" on public.patients
  for select
  using (clinic_id = public.get_my_clinic_id());

-- ── Corrigir policies em public.shifts ───────────────────────

drop policy if exists "clinic_users_read_own_shifts" on public.shifts;

create policy "clinic_users_read_own_shifts" on public.shifts
  for select
  using (clinic_id = public.get_my_clinic_id());

-- ── Corrigir policies em public.checklists ────────────────────

drop policy if exists "clinic_users_read_checklists" on public.checklists;

create policy "clinic_users_read_checklists" on public.checklists
  for select
  using (
    clinic_id is null
    or clinic_id = public.get_my_clinic_id()
  );
