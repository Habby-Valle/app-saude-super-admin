-- ============================================================
-- 008: Sistema SOS
--
-- sos_alerts   → alertas disparados por cuidadores/familiares
-- sos_notifications → registro de notificações enviadas
-- ============================================================

-- ── sos_alerts ───────────────────────────────────────────────

create table if not exists public.sos_alerts (
  id               uuid primary key default gen_random_uuid(),
  clinic_id        uuid not null references public.clinics(id) on delete cascade,
  patient_id       uuid not null references public.patients(id) on delete cascade,
  triggered_by     uuid not null references public.users(id) on delete cascade,
  status           text not null default 'active'
                     check (status in ('active', 'acknowledged', 'resolved')),
  location_lat     decimal(10, 8),
  location_lng     decimal(11, 8),
  notes            text,
  acknowledged_by  uuid references public.users(id) on delete set null,
  acknowledged_at  timestamptz,
  resolved_by      uuid references public.users(id) on delete set null,
  resolved_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists sos_alerts_clinic_id_idx  on public.sos_alerts(clinic_id);
create index if not exists sos_alerts_status_idx     on public.sos_alerts(status);
create index if not exists sos_alerts_created_at_idx on public.sos_alerts(created_at desc);

alter table public.sos_alerts enable row level security;

-- Super admin vê tudo
create policy "super_admin_all_sos_alerts" on public.sos_alerts
  for all using (public.get_my_role() = 'super_admin');

-- Clinic admin vê apenas alertas da própria clínica
create policy "clinic_admin_read_own_sos_alerts" on public.sos_alerts
  for select
  using (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  );

-- Clinic admin pode atualizar (acknowledge/resolve) alertas da própria clínica
create policy "clinic_admin_update_own_sos_alerts" on public.sos_alerts
  for update
  using (
    public.get_my_role() = 'clinic_admin'
    and clinic_id = public.get_my_clinic_id()
  );

-- Cuidadores e familiares podem criar alertas da própria clínica
create policy "clinic_users_insert_sos_alerts" on public.sos_alerts
  for insert
  with check (clinic_id = public.get_my_clinic_id());

-- Cuidadores e familiares podem ler alertas de seus próprios pacientes
create policy "clinic_users_read_own_sos_alerts" on public.sos_alerts
  for select
  using (
    public.get_my_role() in ('caregiver', 'family', 'emergency_contact')
    and clinic_id = public.get_my_clinic_id()
  );

-- ── sos_notifications ────────────────────────────────────────

create table if not exists public.sos_notifications (
  id             uuid primary key default gen_random_uuid(),
  sos_alert_id   uuid not null references public.sos_alerts(id) on delete cascade,
  user_id        uuid references public.users(id) on delete set null,
  channel        text not null check (channel in ('push', 'email', 'sms', 'in_app')),
  recipient      text not null,  -- email, phone ou device token
  status         text not null default 'pending'
                   check (status in ('pending', 'sent', 'delivered', 'failed')),
  sent_at        timestamptz,
  error_message  text,
  created_at     timestamptz not null default now()
);

create index if not exists sos_notifications_alert_id_idx on public.sos_notifications(sos_alert_id);
create index if not exists sos_notifications_status_idx   on public.sos_notifications(status);

alter table public.sos_notifications enable row level security;

create policy "super_admin_all_sos_notifications" on public.sos_notifications
  for all using (public.get_my_role() = 'super_admin');

-- Clinic admin lê notificações de alertas da própria clínica (via join)
create policy "clinic_admin_read_sos_notifications" on public.sos_notifications
  for select
  using (
    public.get_my_role() = 'clinic_admin'
    and exists (
      select 1 from public.sos_alerts a
      where a.id = sos_alert_id
        and a.clinic_id = public.get_my_clinic_id()
    )
  );
