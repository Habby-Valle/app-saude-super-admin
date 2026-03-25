-- ============================================================
-- 004: Templates de checklists (globais e por clínica)
-- ============================================================

create table if not exists public.checklists (
  id         uuid primary key default gen_random_uuid(),
  clinic_id  uuid references public.clinics(id) on delete cascade,
  name       text not null,
  icon       text,
  "order"    int not null default 0,
  created_at timestamptz not null default now()
  -- clinic_id null = template global
);

alter table public.checklists enable row level security;

create policy "super_admin_all_checklists" on public.checklists
  for all using (public.get_my_role() = 'super_admin');

create policy "clinic_users_read_checklists" on public.checklists
  for select
  using (
    clinic_id is null
    or clinic_id = (select clinic_id from public.users where id = auth.uid())
  );

-- ── Itens do checklist ────────────────────────────────────────

create table if not exists public.checklist_items (
  id               uuid primary key default gen_random_uuid(),
  checklist_id     uuid not null references public.checklists(id) on delete cascade,
  name             text not null,
  type             text not null check (type in ('text','boolean','select','number')),
  required         boolean not null default false,
  has_observation  boolean not null default false,
  "order"          int not null default 0
);

alter table public.checklist_items enable row level security;

create policy "super_admin_all_checklist_items" on public.checklist_items
  for all using (public.get_my_role() = 'super_admin');

-- ── Opções de item (tipo select) ──────────────────────────────

create table if not exists public.checklist_item_options (
  id                 uuid primary key default gen_random_uuid(),
  checklist_item_id  uuid not null references public.checklist_items(id) on delete cascade,
  label              text not null,
  value              text not null
);

alter table public.checklist_item_options enable row level security;

create policy "super_admin_all_checklist_item_options" on public.checklist_item_options
  for all using (public.get_my_role() = 'super_admin');
