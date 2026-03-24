-- ============================================================
-- Migration 005: Turnos e execução de checklists
-- ============================================================

-- Turnos
create table if not exists public.shifts (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references public.clinics(id) on delete cascade,
  patient_id   uuid not null references public.patients(id) on delete cascade,
  caregiver_id uuid not null references public.users(id) on delete cascade,
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  status       text not null default 'in_progress'
                 check (status in ('in_progress','completed','cancelled')),
  created_at   timestamptz not null default now()
);

create index if not exists shifts_clinic_id_idx on public.shifts(clinic_id);
create index if not exists shifts_patient_id_idx on public.shifts(patient_id);
create index if not exists shifts_caregiver_id_idx on public.shifts(caregiver_id);
create index if not exists shifts_status_idx on public.shifts(status);

alter table public.shifts enable row level security;

create policy "super_admin_all_shifts" on public.shifts
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );

create policy "clinic_users_read_own_shifts" on public.shifts
  for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.clinic_id = public.shifts.clinic_id
    )
  );

-- Execução de checklist em um turno
create table if not exists public.shift_checklists (
  id           uuid primary key default gen_random_uuid(),
  shift_id     uuid not null references public.shifts(id) on delete cascade,
  checklist_id uuid not null references public.checklists(id),
  status       text not null default 'pending'
                 check (status in ('pending','completed')),
  observation  text,
  created_at   timestamptz not null default now()
);

alter table public.shift_checklists enable row level security;

create policy "super_admin_all_shift_checklists" on public.shift_checklists
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );

-- Respostas por item de checklist (imutáveis após conclusão)
create table if not exists public.shift_checklist_items (
  id                  uuid primary key default gen_random_uuid(),
  shift_checklist_id  uuid not null references public.shift_checklists(id) on delete cascade,
  checklist_item_id   uuid not null references public.checklist_items(id),
  value               text,
  option_id           uuid references public.checklist_item_options(id),
  observation         text,
  created_at          timestamptz not null default now()
);

alter table public.shift_checklist_items enable row level security;

create policy "super_admin_all_shift_checklist_items" on public.shift_checklist_items
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );
