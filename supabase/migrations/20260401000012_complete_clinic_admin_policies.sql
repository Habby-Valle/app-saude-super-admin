-- ============================================================
-- 012: Policies completas para clinic_admin
--
-- Situação anterior: clinic_admin tinha apenas SELECT em
-- algumas tabelas e zero acesso em outras (caregiver_patient,
-- checklist_items, checklist_item_options, shift_checklists,
-- shift_checklist_items).
--
-- Todas as policies usam get_my_role() e get_my_clinic_id()
-- (SECURITY DEFINER, definidas em migrations anteriores)
-- para evitar recursão no RLS.
-- ============================================================

-- ── clinics: UPDATE da própria clínica ───────────────────────

create policy "clinic_admin_update_own_clinic" on public.clinics
  for update
  using (
    public.get_my_role() = 'clinic_admin'
    and id = public.get_my_clinic_id()
  )
  with check (
    public.get_my_role() = 'clinic_admin'
    and id = public.get_my_clinic_id()
  );

-- ── users: INSERT e UPDATE de usuários da clínica ────────────

create policy "clinic_admin_insert_users" on public.users
  for insert
  with check (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  );

create policy "clinic_admin_update_users" on public.users
  for update
  using (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
    and role != 'super_admin'
  )
  with check (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
    and role != 'super_admin'
  );

-- ── patients: INSERT / UPDATE / DELETE ───────────────────────

create policy "clinic_admin_insert_patients" on public.patients
  for insert
  with check (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  );

create policy "clinic_admin_update_patients" on public.patients
  for update
  using (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  )
  with check (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  );

create policy "clinic_admin_delete_patients" on public.patients
  for delete
  using (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  );

-- ── caregiver_patient: acesso completo via pacientes da clínica

create policy "clinic_admin_all_caregiver_patient" on public.caregiver_patient
  for all
  using (
    public.get_my_role() = 'clinic_admin'
    and exists (
      select 1 from public.patients
      where id = patient_id
        and clinic_id = public.get_my_clinic_id()
    )
  )
  with check (
    public.get_my_role() = 'clinic_admin'
    and exists (
      select 1 from public.patients
      where id = patient_id
        and clinic_id = public.get_my_clinic_id()
    )
  );

-- Cuidadores lêem seus próprios vínculos
create policy "caregiver_read_own_links" on public.caregiver_patient
  for select
  using (caregiver_id = auth.uid());

-- ── checklists: INSERT / UPDATE / DELETE da própria clínica ──

create policy "clinic_admin_insert_checklists" on public.checklists
  for insert
  with check (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  );

create policy "clinic_admin_update_checklists" on public.checklists
  for update
  using (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  )
  with check (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  );

create policy "clinic_admin_delete_checklists" on public.checklists
  for delete
  using (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  );

-- ── checklist_items: acesso via checklists ────────────────────
-- USING: lê itens de checklists globais OU da própria clínica
-- WITH CHECK: só escreve em checklists da própria clínica

create policy "clinic_admin_all_checklist_items" on public.checklist_items
  for all
  using (
    public.get_my_role() = 'clinic_admin'
    and exists (
      select 1 from public.checklists
      where id = checklist_id
        and (clinic_id = public.get_my_clinic_id() or clinic_id is null)
    )
  )
  with check (
    public.get_my_role() = 'clinic_admin'
    and exists (
      select 1 from public.checklists
      where id = checklist_id
        and clinic_id = public.get_my_clinic_id()
    )
  );

-- ── checklist_item_options: acesso via items ──────────────────

create policy "clinic_admin_all_checklist_item_options" on public.checklist_item_options
  for all
  using (
    public.get_my_role() = 'clinic_admin'
    and exists (
      select 1 from public.checklist_items ci
      join public.checklists c on c.id = ci.checklist_id
      where ci.id = checklist_item_id
        and (c.clinic_id = public.get_my_clinic_id() or c.clinic_id is null)
    )
  )
  with check (
    public.get_my_role() = 'clinic_admin'
    and exists (
      select 1 from public.checklist_items ci
      join public.checklists c on c.id = ci.checklist_id
      where ci.id = checklist_item_id
        and c.clinic_id = public.get_my_clinic_id()
    )
  );

-- ── shifts: INSERT / UPDATE / DELETE ─────────────────────────

-- create policy "clinic_admin_insert_shifts" on public.shifts
--   for insert
--   with check (
--     public.get_my_role() = 'clinic_admin'
--     and clinic_id = public.get_my_clinic_id()
--   );

-- create policy "clinic_admin_update_shifts" on public.shifts
--   for update
--   using (
--     public.get_my_role() = 'clinic_admin'
--     and clinic_id = public.get_my_clinic_id()
--   )
--   with check (
--     public.get_my_role() = 'clinic_admin'
--     and clinic_id = public.get_my_clinic_id()
--   );

-- create policy "clinic_admin_delete_shifts" on public.shifts
--   for delete
--   using (
--     public.get_my_role() = 'clinic_admin'
--     and clinic_id = public.get_my_clinic_id()
--   );

-- ── shift_checklists: acesso completo via shifts da clínica ──

create policy "clinic_admin_all_shift_checklists" on public.shift_checklists
  for all
  using (
    public.get_my_role() = 'clinic_admin'
    and exists (
      select 1 from public.shifts
      where id = shift_id
        and clinic_id = public.get_my_clinic_id()
    )
  )
  with check (
    public.get_my_role() = 'clinic_admin'
    and exists (
      select 1 from public.shifts
      where id = shift_id
        and clinic_id = public.get_my_clinic_id()
    )
  );

-- ── shift_checklist_items: acesso via shift_checklists ────────

create policy "clinic_admin_all_shift_checklist_items" on public.shift_checklist_items
  for all
  using (
    public.get_my_role() = 'clinic_admin'
    and exists (
      select 1 from public.shift_checklists sc
      join public.shifts s on s.id = sc.shift_id
      where sc.id = shift_checklist_id
        and s.clinic_id = public.get_my_clinic_id()
    )
  )
  with check (
    public.get_my_role() = 'clinic_admin'
    and exists (
      select 1 from public.shift_checklists sc
      join public.shifts s on s.id = sc.shift_id
      where sc.id = shift_checklist_id
        and s.clinic_id = public.get_my_clinic_id()
    )
  );

-- ── audit_logs: INSERT para clinic_admin ─────────────────────
-- SELECT permanece restrito ao super_admin (logs globais)

create policy "clinic_admin_insert_audit_logs" on public.audit_logs
  for insert
  with check (
    public.get_my_role() = 'clinic_admin'
    and user_id = auth.uid()
  );
