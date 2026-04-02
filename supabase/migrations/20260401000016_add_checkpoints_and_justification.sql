-- ============================================================
-- Checkpoints e Validação de Checklists
-- ============================================================

-- Checkpoints a cada 2h
create table if not exists public.shift_checkpoints (
  id           uuid primary key default gen_random_uuid(),
  shift_id     uuid not null references public.shifts(id) on delete cascade,
  caregiver_id uuid not null references public.users(id),
  notes        text,
  checked_at   timestamptz not null default now()
);

create index if not exists shift_checkpoints_shift_id_idx on public.shift_checkpoints(shift_id);
create index if not exists shift_checkpoints_checked_at_idx on public.shift_checkpoints(checked_at desc);

-- Adicionar campos em shifts
alter table public.shifts add column if not exists last_checkpoint_at timestamptz;
alter table public.shifts add column if not exists completed_with_justification boolean not null default false;

-- Adicionar campo justification em shift_checklists
alter table public.shift_checklists add column if not exists justification text;

-- RLS para shift_checkpoints
alter table public.shift_checkpoints enable row level security;

create policy "super_admin_all_shift_checkpoints" on public.shift_checkpoints
  for all using (public.get_my_role() = 'super_admin');

create policy "clinic_users_crud_shift_checkpoints" on public.shift_checkpoints
  for all using (
    exists (
      select 1 from public.shifts s
      where s.id = shift_checkpoints.shift_id
        and s.caregiver_id = auth.uid()
    )
  );
