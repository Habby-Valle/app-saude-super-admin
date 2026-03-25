-- ============================================================
-- 006: Logs de auditoria (imutáveis — sem UPDATE nem DELETE)
-- ============================================================

create table if not exists public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id),
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_user_id_idx    on public.audit_logs(user_id);
create index if not exists audit_logs_entity_idx     on public.audit_logs(entity, entity_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

create policy "super_admin_read_audit_logs" on public.audit_logs
  for select using (public.get_my_role() = 'super_admin');

create policy "super_admin_insert_audit_logs" on public.audit_logs
  for insert with check (public.get_my_role() = 'super_admin');

-- Sem policy de UPDATE ou DELETE → registros são imutáveis
