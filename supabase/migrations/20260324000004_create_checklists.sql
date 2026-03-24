-- ============================================================
-- Migration 004: Checklists (templates)
-- ============================================================

-- Template de checklist
create table if not exists public.checklists (
  id         uuid primary key default gen_random_uuid(),
  clinic_id  uuid references public.clinics(id) on delete cascade,  -- null = global
  name       text not null,
  icon       text,
  "order"    int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists checklists_clinic_id_idx on public.checklists(clinic_id);

alter table public.checklists enable row level security;

create policy "super_admin_all_checklists" on public.checklists
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );

create policy "clinic_users_read_checklists" on public.checklists
  for select
  using (
    clinic_id is null  -- templates globais
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.clinic_id = public.checklists.clinic_id
    )
  );

-- Itens do checklist
create table if not exists public.checklist_items (
  id              uuid primary key default gen_random_uuid(),
  checklist_id    uuid not null references public.checklists(id) on delete cascade,
  name            text not null,
  type            text not null check (type in ('text','boolean','select','number')),
  required        boolean not null default false,
  has_observation boolean not null default false,
  "order"         int not null default 0
);

alter table public.checklist_items enable row level security;

create policy "super_admin_all_checklist_items" on public.checklist_items
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );

create policy "clinic_users_read_checklist_items" on public.checklist_items
  for select
  using (
    exists (
      select 1 from public.checklists c
      where c.id = public.checklist_items.checklist_id
        and (
          c.clinic_id is null
          or exists (
            select 1 from public.users u
            where u.id = auth.uid() and u.clinic_id = c.clinic_id
          )
        )
    )
  );

-- Opções de seleção de cada item
create table if not exists public.checklist_item_options (
  id               uuid primary key default gen_random_uuid(),
  checklist_item_id uuid not null references public.checklist_items(id) on delete cascade,
  label            text not null,
  value            text not null
);

alter table public.checklist_item_options enable row level security;

create policy "super_admin_all_checklist_item_options" on public.checklist_item_options
  for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'super_admin'
    )
  );

create policy "clinic_users_read_checklist_item_options" on public.checklist_item_options
  for select
  using (
    exists (
      select 1 from public.checklist_items ci
      join public.checklists c on c.id = ci.checklist_id
      where ci.id = public.checklist_item_options.checklist_item_id
        and (
          c.clinic_id is null
          or exists (
            select 1 from public.users u
            where u.id = auth.uid() and u.clinic_id = c.clinic_id
          )
        )
    )
  );
