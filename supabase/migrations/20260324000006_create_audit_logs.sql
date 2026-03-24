-- ============================================================
-- Migration 006: Auditoria do Super Admin
-- ============================================================

create table if not exists public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id),
  action     text not null,   -- ex: 'CREATE', 'UPDATE', 'DELETE', 'BLOCK'
  entity     text not null,   -- ex: 'clinic', 'user', 'patient'
  entity_id  uuid,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_user_id_idx on public.audit_logs(user_id);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity, entity_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

-- Apenas super admin pode ver e inserir logs
create policy "super_admin_read_audit_logs" on public.audit_logs
  for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );

create policy "super_admin_insert_audit_logs" on public.audit_logs
  for insert
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );

-- Logs são imutáveis: sem UPDATE nem DELETE
