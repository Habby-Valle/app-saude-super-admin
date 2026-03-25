-- ============================================================
-- 002: Tabela users + função get_my_role() + policies
--
-- IMPORTANTE: A função get_my_role() é criada ANTES das policies
-- para evitar recursão: policies em public.users não podem
-- fazer subquery em public.users sem SECURITY DEFINER.
-- ============================================================

-- ── Tabela users ─────────────────────────────────────────────

create table if not exists public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  clinic_id       uuid references public.clinics(id) on delete set null,
  name            text not null,
  email           text not null,
  role            text not null
                    check (role in ('super_admin','clinic_admin','caregiver','family','emergency_contact')),
  status          text not null default 'active'
                    check (status in ('active', 'blocked')),
  created_at      timestamptz not null default now(),
  last_sign_in_at timestamptz
);

create index if not exists users_clinic_id_idx on public.users(clinic_id);
create index if not exists users_role_idx       on public.users(role);

alter table public.users enable row level security;

-- ── Função auxiliar (SECURITY DEFINER = sem RLS ao ler users) ──

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- ── Policies: public.users ────────────────────────────────────

-- Super admin tem acesso total
create policy "super_admin_all_users" on public.users
  for all
  using (public.get_my_role() = 'super_admin');

-- Cada usuário lê/edita o próprio perfil
create policy "self_read_users" on public.users
  for select
  using (id = auth.uid());

-- Clinic admin lê usuários da sua clínica
create policy "clinic_admin_read_own_clinic_users" on public.users
  for select
  using (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = (select clinic_id from public.users where id = auth.uid())
  );

-- ── Policies: public.clinics ──────────────────────────────────

-- Super admin tem acesso total
create policy "super_admin_all_clinics" on public.clinics
  for all
  using (public.get_my_role() = 'super_admin');

-- Clinic admin lê a própria clínica
create policy "clinic_admin_read_own_clinic" on public.clinics
  for select
  using (
    id = (select clinic_id from public.users where id = auth.uid())
  );
