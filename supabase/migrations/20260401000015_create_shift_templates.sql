-- ============================================================
-- Template de Turnos
-- ============================================================

create table if not exists public.shift_templates (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  name          text not null,
  start_time    text not null, -- HH:MM formato 24h
  end_time      text not null, -- HH:MM formato 24h
  instructions  text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists shift_templates_clinic_id_idx on public.shift_templates(clinic_id);
create index if not exists shift_templates_is_active_idx on public.shift_templates(is_active);

-- Adicionar campo instructions na tabela shifts
alter table public.shifts add column if not exists instructions text;

-- RLS
alter table public.shift_templates enable row level security;

create policy "super_admin_all_shift_templates" on public.shift_templates
  for all using (public.get_my_role() = 'super_admin');

create policy "clinic_users_crud_shift_templates" on public.shift_templates
  for all using (clinic_id = (select clinic_id from public.users where id = auth.uid()));
