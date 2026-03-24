-- ============================================================
-- Migration 003: Pacientes e relações
-- ============================================================

-- Pacientes
create table if not exists public.patients (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  contractor_id uuid references public.users(id) on delete set null,
  name          text not null,
  birth_date    date,
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index if not exists patients_clinic_id_idx on public.patients(clinic_id);

alter table public.patients enable row level security;

create policy "super_admin_all_patients" on public.patients
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );

create policy "clinic_users_read_own_patients" on public.patients
  for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.clinic_id = public.patients.clinic_id
    )
  );

-- Cuidador <> Paciente (n:n)
create table if not exists public.caregiver_patient (
  id           uuid primary key default gen_random_uuid(),
  caregiver_id uuid not null references public.users(id) on delete cascade,
  patient_id   uuid not null references public.patients(id) on delete cascade,
  unique(caregiver_id, patient_id)
);

alter table public.caregiver_patient enable row level security;

create policy "super_admin_all_caregiver_patient" on public.caregiver_patient
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );

-- Contatos de emergência
create table if not exists public.emergency_contacts (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  priority   int not null default 1,
  unique(patient_id, user_id)
);

alter table public.emergency_contacts enable row level security;

create policy "super_admin_all_emergency_contacts" on public.emergency_contacts
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );
