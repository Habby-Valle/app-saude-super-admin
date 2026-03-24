-- ============================================================
-- Migration 002: Usuários + policies de clinics e users
-- ============================================================

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
create index if not exists users_role_idx on public.users(role);

alter table public.users enable row level security;

-- ── Policies: users ──────────────────────────────────────────

create policy "super_admin_all_users" on public.users
  for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'super_admin')
  );

create policy "self_read_users" on public.users
  for select using (id = auth.uid());

create policy "clinic_admin_read_own_users" on public.users
  for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.clinic_id = public.users.clinic_id
        and u.role = 'clinic_admin'
    )
  );

-- ── Policies: clinics (agora que users existe) ───────────────

create policy "super_admin_all_clinics" on public.clinics
  for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'super_admin')
  );

create policy "clinic_admin_read_own" on public.clinics
  for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.clinic_id = public.clinics.id
    )
  );

-- ── Função auxiliar ──────────────────────────────────────────

create or replace function public.handle_user_sign_in(user_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.users set last_sign_in_at = now() where id = user_id;
end;
$$;
