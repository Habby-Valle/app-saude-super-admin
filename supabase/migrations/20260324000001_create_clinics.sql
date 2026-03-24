-- ============================================================
-- Migration 001: Clínicas
-- (policies adicionadas em 002 após tabela users existir)
-- ============================================================

create table if not exists public.clinics (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  cnpj       text not null unique,
  status     text not null default 'active'
               check (status in ('active', 'inactive', 'suspended')),
  plan       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clinics_updated_at
  before update on public.clinics
  for each row execute function public.set_updated_at();

alter table public.clinics enable row level security;
