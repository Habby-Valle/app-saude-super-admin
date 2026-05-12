-- ============================================================
-- Zelo - Schema Completo Consolidado
-- Execute este arquivo no Supabase SQL Editor para restaurar todas as tabelas
-- Data: 2026-05-08
-- ============================================================

-- ============================================================
-- 1. EXTENSÕES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- 2. TABELAS BASE
-- ============================================================

-- ── Clinics ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clinics (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  cnpj       text not null unique,
  status     text not null default 'active'
             check (status in ('active', 'inactive', 'suspended')),
  plan       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS clinics_deleted_at_idx ON clinics (deleted_at)
  WHERE deleted_at IS NULL;

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  clinic_id       uuid references public.clinics(id) on delete set null,
  name            text not null,
  email           text not null,
  role            text not null
                  check (role in ('super_admin','clinic_admin','caregiver','family','emergency_contact')),
  status          text not null default 'active'
                  check (status in ('active', 'blocked')),
  created_at      timestamptz not null default now(),
  last_sign_in_at timestamptz,
  anonymized_at   TIMESTAMPTZ,
  invitation_token TEXT
);

CREATE INDEX IF NOT EXISTS users_clinic_id_idx on public.users(clinic_id);
CREATE INDEX IF NOT EXISTS users_role_idx       on public.users(role);

-- ── Patients ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patients (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references public.clinics(id) on delete cascade,
  name         text not null,
  birth_date   date,
  status       text default 'active' check (status in ('active', 'inactive')),
  created_at   timestamptz not null default now(),
  anonymized_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS patients_clinic_id_idx on public.patients(clinic_id);

-- ── Cuidador <> Paciente ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.caregiver_patient (
  id           uuid primary key default gen_random_uuid(),
  caregiver_id uuid not null references public.users(id) on delete cascade,
  patient_id   uuid not null references public.patients(id) on delete cascade,
  unique (caregiver_id, patient_id)
);

-- ── Contatos de emergência ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  priority   int not null default 1,
  unique (patient_id, user_id)
);

-- ============================================================
-- 3. CHECKLISTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.checklists (
  id         uuid primary key default gen_random_uuid(),
  clinic_id  uuid references public.clinics(id) on delete cascade,
  name       text not null,
  icon       text,
  "order"    int not null default 0,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.checklist_items (
  id               uuid primary key default gen_random_uuid(),
  checklist_id     uuid not null references public.checklists(id) on delete cascade,
  name             text not null,
  type             text not null check (type in ('text','boolean','select','number')),
  required         boolean not null default false,
  has_observation  boolean not null default false,
  "order"          int not null default 0,
  checkpoints      TEXT[],
  justification    BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.checklist_item_options (
  id                 uuid primary key default gen_random_uuid(),
  checklist_item_id  uuid not null references public.checklist_items(id) on delete cascade,
  label              text not null,
  value              text not null
);

-- ── Shift Templates ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shift_templates (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  name        text not null,
  start_time  text not null,
  end_time    text not null,
  days        text[] DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 4. TURNOS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shifts (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references public.clinics(id) on delete cascade,
  patient_id   uuid not null references public.patients(id) on delete cascade,
  caregiver_id uuid not null references public.users(id) on delete cascade,
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  status       text not null default 'in_progress'
               check (status in ('in_progress','completed','cancelled'))
);

CREATE INDEX IF NOT EXISTS shifts_clinic_id_idx on public.shifts(clinic_id);
CREATE INDEX IF NOT EXISTS shifts_status_idx    on public.shifts(status);

CREATE TABLE IF NOT EXISTS public.shift_checklists (
  id           uuid primary key default gen_random_uuid(),
  shift_id     uuid not null references public.shifts(id) on delete cascade,
  checklist_id uuid not null references public.checklists(id),
  status       text not null default 'pending'
               check (status in ('pending','completed')),
  observation  text,
  created_at   timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS shift_checklists_shift_id_idx    on public.shift_checklists(shift_id);
CREATE INDEX IF NOT EXISTS shift_checklists_created_at_idx  on public.shift_checklists(created_at desc);

CREATE TABLE IF NOT EXISTS public.shift_checklist_items (
  id                  uuid primary key default gen_random_uuid(),
  shift_checklist_id  uuid not null references public.shift_checklists(id) on delete cascade,
  checklist_item_id   uuid not null references public.checklist_items(id),
  value               text,
  option_id           uuid references public.checklist_item_options(id),
  observation         text
);

-- ============================================================
-- 5. AUDITORIA
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id),
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx    on public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx     on public.audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx on public.audit_logs(created_at desc);

-- ============================================================
-- 6. SOS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sos_alerts (
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

CREATE INDEX IF NOT EXISTS sos_alerts_clinic_id_idx  on public.sos_alerts(clinic_id);
CREATE INDEX IF NOT EXISTS sos_alerts_status_idx     on public.sos_alerts(status);
CREATE INDEX IF NOT EXISTS sos_alerts_created_at_idx on public.sos_alerts(created_at desc);

CREATE TABLE IF NOT EXISTS public.sos_notifications (
  id             uuid primary key default gen_random_uuid(),
  sos_alert_id   uuid not null references public.sos_alerts(id) on delete cascade,
  user_id        uuid references public.users(id) on delete set null,
  channel        text not null check (channel in ('push', 'email', 'sms', 'in_app')),
  recipient      text not null,
  status         text not null default 'pending'
                 check (status in ('pending', 'sent', 'delivered', 'failed')),
  sent_at        timestamptz,
  error_message  text,
  created_at     timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS sos_notifications_alert_id_idx on public.sos_notifications(sos_alert_id);
CREATE INDEX IF NOT EXISTS sos_notifications_status_idx   on public.sos_notifications(status);

-- ============================================================
-- 7. LGPD
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_consents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  consent_type  TEXT        NOT NULL,
  consented     BOOLEAN     NOT NULL DEFAULT true,
  ip_address    INET,
  user_agent    TEXT,
  policy_version TEXT       NOT NULL DEFAULT '1.0',
  consented_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at    TIMESTAMPTZ,
  CONSTRAINT user_consents_type_check
    CHECK (consent_type IN ('data_processing', 'marketing', 'health_data', 'emergency_contact'))
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type    ON user_consents(consent_type);

CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  entity         TEXT    NOT NULL UNIQUE,
  label          TEXT    NOT NULL,
  retention_days INTEGER NOT NULL CHECK (retention_days > 0),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by     UUID    REFERENCES users(id)
);

INSERT INTO data_retention_policies (entity, label, retention_days) VALUES
  ('audit_logs', 'Logs de Auditoria', 365),
  ('sos_alerts', 'Alertas SOS', 730),
  ('shifts', 'Histórico de Turnos', 1825),
  ('patients', 'Dados de Pacientes', 3650)
ON CONFLICT (entity) DO NOTHING;

-- ============================================================
-- 8. PLANOS E ASSINATURAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  features JSONB NOT NULL DEFAULT '[]',
  max_users INTEGER NOT NULL DEFAULT 10,
  max_patients INTEGER NOT NULL DEFAULT 50,
  max_storage INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('feature', 'limit', 'addon', 'integration')),
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan_benefit_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES plan_benefits(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(plan_id, benefit_id)
);

CREATE TABLE IF NOT EXISTS public.clinic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled', 'free')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  trial_ends_at TIMESTAMPTZ,
  last_plan_status TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  payment_failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clinic_plan_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_plan_id UUID NOT NULL REFERENCES clinic_plans(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES plan_benefits(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_plan_id, benefit_id)
);

CREATE TABLE IF NOT EXISTS public.user_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES plan_benefits(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  granted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, benefit_id)
);

-- Índices para planos
CREATE INDEX IF NOT EXISTS idx_plan_benefit_relations_plan_id ON plan_benefit_relations(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_benefit_relations_benefit_id ON plan_benefit_relations(benefit_id);
CREATE INDEX IF NOT EXISTS idx_clinic_plans_clinic_id ON clinic_plans(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_plans_status ON clinic_plans(status);
CREATE INDEX IF NOT EXISTS idx_clinic_plan_benefits_clinic_plan_id ON clinic_plan_benefits(clinic_plan_id);
CREATE INDEX IF NOT EXISTS idx_user_benefits_user_id ON user_benefits(user_id);

-- ── Subscription Payments ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  clinic_plan_id UUID REFERENCES clinic_plans(id),
  stripe_payment_id TEXT,
  stripe_subscription_id TEXT,
  stripe_session_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
  payment_method TEXT,
  billing_cycle TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_clinic_id ON subscription_payments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_clinic_plan_id ON subscription_payments(clinic_plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_paid_at ON subscription_payments(paid_at DESC);

-- ── Subscription Notifications ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscription_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  clinic_plan_id UUID NOT NULL REFERENCES clinic_plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trial_reminder', 'expired', 'renewal')),
  days_before INTEGER,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'in_app', 'sms')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_notifications_clinic_id ON subscription_notifications(clinic_id);
CREATE INDEX IF NOT EXISTS idx_subscription_notifications_clinic_plan_id ON subscription_notifications(clinic_plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_notifications_status ON subscription_notifications(status);

-- ============================================================
-- 9. SISTEMA
-- ============================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT DEFAULT 'Sistema em manutenção. Em breve retornaremos.',
  maintenance_planned_end TIMESTAMPTZ,
  system_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_settings (id, maintenance_mode, maintenance_message)
VALUES (gen_random_uuid(), false, 'Sistema em manutenção. Em breve retornaremos.')
ON CONFLICT DO NOTHING;

-- ── Broadcast Notifications ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.broadcast_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_role TEXT NOT NULL DEFAULT 'all'
      CHECK (target_role IN ('all', 'caregiver', 'family', 'emergency_contact')),
  status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_broadcast_notifications_created_at
  ON broadcast_notifications(created_at DESC);

-- ============================================================
-- 10. FUNÇÕES AUXILIARES (RLS)
-- ============================================================

-- Função para obter role do usuário atual (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET SEARCH_PATH = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Função para obter clinic_id do usuário atual (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_my_clinic_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET SEARCH_PATH = public
AS $$
  SELECT clinic_id FROM public.users WHERE id = auth.uid();
$$;

-- ── Trigger updated_at genérico
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Função de expiração de assinaturas
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE clinic_plans
  SET
    status = 'expired',
    updated_at = now()
  WHERE
    status IN ('trial', 'active')
    AND expires_at IS NOT NULL
    AND expires_at < now();
END;
$$;

-- ── Função de notificações de expiração
CREATE OR REPLACE FUNCTION notify_expiring_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
  v_days INTEGER;
  v_days_before INTEGER;
BEGIN
  FOR v_days IN SELECT unnest(ARRAY[7, 3, 1]) LOOP
    v_days_before := v_days;
    FOR v_record IN
      SELECT
        cp.id AS clinic_plan_id,
        cp.clinic_id,
        cp.expires_at,
        cp.status
      FROM clinic_plans cp
      WHERE cp.status IN ('trial', 'active')
        AND cp.expires_at IS NOT NULL
        AND cp.expires_at > now()
        AND cp.expires_at <= (now() + (v_days_before || ' days')::interval)
        AND cp.expires_at > (now() + ((v_days_before - 1) || ' days')::interval)
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM subscription_notifications sn
        WHERE sn.clinic_plan_id = v_record.clinic_plan_id
          AND sn.days_before = v_days_before
          AND sn.channel = 'email'
          AND sn.status = 'sent'
      ) THEN
        INSERT INTO subscription_notifications (
          clinic_id,
          clinic_plan_id,
          type,
          days_before,
          channel,
          status
        ) VALUES (
          v_record.clinic_id,
          v_record.clinic_plan_id,
          'trial_reminder',
          v_days_before,
          'email',
          'pending'
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- ── Função update_updated_at para planos
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Função system settings timestamp
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 11. TRIGGERS
-- ============================================================

-- Clinics updated_at
CREATE TRIGGER clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Plans updated_at
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Clinic_plans updated_at
CREATE TRIGGER clinic_plans_updated_at BEFORE UPDATE ON clinic_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Clinic_plan_benefits updated_at
CREATE TRIGGER clinic_plan_benefits_updated_at BEFORE UPDATE ON clinic_plan_benefits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- User_benefits updated_at
CREATE TRIGGER user_benefits_updated_at BEFORE UPDATE ON user_benefits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- System_settings timestamp
CREATE TRIGGER update_system_settings_timestamp
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_system_settings_timestamp();

-- ============================================================
-- 12. JOBS AGENDADOS (pg_cron)
-- ============================================================

-- Expiração de assinaturas (diário à meia-noite)
SELECT cron.schedule(
  'expire-subscriptions',
  '0 0 * * *',
  'SELECT expire_subscriptions()'
);

-- Notificações de expiração (diário às 8h)
SELECT cron.schedule(
  'notify-expiring-subscriptions',
  '0 8 * * *',
  'SELECT notify_expiring_subscriptions()'
);

-- ============================================================
-- 13. DADOS SEED
-- ============================================================

-- Seed: Planos
INSERT INTO plans (id, name, description, price, billing_cycle, is_active, features, max_users, max_patients, max_storage, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Trial', 'Plano de avaliação gratuito', 0, 'monthly', true, '["basic_checklists"]', 3, 5, 1, 1),
  ('00000000-0000-0000-0000-000000000002', 'Basic', 'Para pequenas clínicas', 99.90, 'monthly', true, '["basic_checklists", "reports"]', 10, 50, 5, 2),
  ('00000000-0000-0000-0000-000000000003', 'Premium', 'Para clínicas em crescimento', 199.90, 'monthly', true, '["advanced_checklists", "reports", "sos_system", "priority_support"]', 50, 200, 20, 3),
  ('00000000-0000-0000-0000-000000000004', 'Enterprise', 'Para grandes operações', 499.90, 'monthly', true, '["all_features"]', 999, 9999, 100, 4),
  ('00000000-0000-0000-0000-000000000005', 'Free', 'Plano gratuito', 0, 'monthly', true, '["basic_checklists"]', 3, 5, 1, 0)
ON CONFLICT DO NOTHING;

-- Seed: Benefícios
INSERT INTO plan_benefits (id, name, code, category, icon, is_active) VALUES
  ('00000000-0000-0000-0001-000000000001', 'Checklists Básicos', 'BASIC_CHECKLISTS', 'feature', 'ClipboardList', true),
  ('00000000-0000-0000-0001-000000000002', 'Checklists Avançados', 'ADVANCED_CHECKLISTS', 'feature', 'ClipboardCheck', true),
  ('00000000-0000-0000-0001-000000000003', 'Relatórios', 'REPORTS', 'feature', 'BarChart3', true),
  ('00000000-0000-0000-0001-000000000004', 'Sistema SOS', 'SOS_SYSTEM', 'feature', 'Siren', true),
  ('00000000-0000-0000-0001-000000000005', 'Suporte Prioritário', 'PRIORITY_SUPPORT', 'addon', 'Headphones', true),
  ('00000000-0000-0000-0001-000000000006', 'Dashboard Avançado', 'ADVANCED_DASHBOARD', 'feature', 'LayoutDashboard', true),
  ('00000000-0000-0000-0001-000000000007', 'Integração API', 'API_INTEGRATION', 'integration', 'Plug', true),
  ('00000000-0000-0000-0001-000000000008', 'Todos os Recursos', 'ALL_FEATURES', 'feature', 'Sparkles', true)
ON CONFLICT (code) DO NOTHING;

-- Seed: Relations (benefícios por plano)
-- Trial
INSERT INTO plan_benefit_relations (plan_id, benefit_id, is_enabled) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', true)
ON CONFLICT DO NOTHING;

-- Basic
INSERT INTO plan_benefit_relations (plan_id, benefit_id, is_enabled) VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000001', true),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000003', true)
ON CONFLICT DO NOTHING;

-- Premium
INSERT INTO plan_benefit_relations (plan_id, benefit_id, is_enabled) VALUES
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000001', true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000002', true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000003', true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000004', true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000005', true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000006', true)
ON CONFLICT DO NOTHING;

-- Enterprise
INSERT INTO plan_benefit_relations (plan_id, benefit_id, is_enabled) VALUES
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000001', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000002', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000003', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000004', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000005', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000006', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000007', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000008', true)
ON CONFLICT DO NOTHING;

-- Free
INSERT INTO plan_benefit_relations (plan_id, benefit_id, is_enabled) VALUES
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0001-000000000001', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 14. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_patient ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_benefit_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_plan_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- ── Policies: Clinics
DROP POLICY IF EXISTS "super_admin_all_clinics" ON public.clinics;
CREATE POLICY "super_admin_all_clinics" ON public.clinics
  FOR ALL USING (public.get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "clinic_admin_read_own_clinic" ON public.clinics;
CREATE POLICY "clinic_admin_read_own_clinic" ON public.clinics
  FOR SELECT USING (id = public.get_my_clinic_id());

-- ── Policies: Users
DROP POLICY IF EXISTS "super_admin_all_users" ON public.users;
CREATE POLICY "super_admin_all_users" ON public.users
  FOR ALL USING (public.get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "self_read_users" ON public.users;
CREATE POLICY "self_read_users" ON public.users
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "clinic_admin_read_own_clinic_users" ON public.users;
CREATE POLICY "clinic_admin_read_own_clinic_users" ON public.users
  FOR SELECT USING (
    public.get_my_role() = 'clinic_admin'
    AND clinic_id = public.get_my_clinic_id()
  );

-- ── Policies: Patients
DROP POLICY IF EXISTS "super_admin_all_patients" ON public.patients;
CREATE POLICY "super_admin_all_patients" ON public.patients
  FOR ALL USING (public.get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "clinic_users_read_own_patients" ON public.patients;
CREATE POLICY "clinic_users_read_own_patients" ON public.patients
  FOR SELECT USING (clinic_id = public.get_my_clinic_id());

-- ── Policies: Caregiver Patient
DROP POLICY IF EXISTS "super_admin_all_caregiver_patient" ON public.caregiver_patient;
CREATE POLICY "super_admin_all_caregiver_patient" ON public.caregiver_patient
  FOR ALL USING (public.get_my_role() = 'super_admin');

-- ── Policies: Emergency Contacts
DROP POLICY IF EXISTS "super_admin_all_emergency_contacts" ON public.emergency_contacts;
CREATE POLICY "super_admin_all_emergency_contacts" ON public.emergency_contacts
  FOR ALL USING (public.get_my_role() = 'super_admin');

-- ── Policies: Checklists
DROP POLICY IF EXISTS "super_admin_all_checklists" ON public.checklists;
CREATE POLICY "super_admin_all_checklists" ON public.checklists
  FOR ALL USING (public.get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "clinic_users_read_checklists" ON public.checklists;
CREATE POLICY "clinic_users_read_checklists" ON public.checklists
  FOR SELECT USING (
    clinic_id IS NULL
    OR clinic_id = public.get_my_clinic_id()
  );

-- ── Policies: Checklist Items
DROP POLICY IF EXISTS "super_admin_all_checklist_items" ON public.checklist_items;
CREATE POLICY "super_admin_all_checklist_items" ON public.checklist_items
  FOR ALL USING (public.get_my_role() = 'super_admin');

-- ── Policies: Checklist Item Options
DROP POLICY IF EXISTS "super_admin_all_checklist_item_options" ON public.checklist_item_options;
CREATE POLICY "super_admin_all_checklist_item_options" ON public.checklist_item_options
  FOR ALL USING (public.get_my_role() = 'super_admin');

-- ── Policies: Shift Templates
DROP POLICY IF EXISTS "super_admin_all_shift_templates" ON public.shift_templates;
CREATE POLICY "super_admin_all_shift_templates" ON public.shift_templates
  FOR ALL USING (public.get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "clinic_users_read_own_shift_templates" ON public.shift_templates;
CREATE POLICY "clinic_users_read_own_shift_templates" ON public.shift_templates
  FOR SELECT USING (clinic_id = public.get_my_clinic_id());

-- ── Policies: Shifts
DROP POLICY IF EXISTS "super_admin_all_shifts" ON public.shifts;
CREATE POLICY "super_admin_all_shifts" ON public.shifts
  FOR ALL USING (public.get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "clinic_users_read_own_shifts" ON public.shifts;
CREATE POLICY "clinic_users_read_own_shifts" ON public.shifts
  FOR SELECT USING (clinic_id = public.get_my_clinic_id());

-- ── Policies: Shift Checklists
DROP POLICY IF EXISTS "super_admin_all_shift_checklists" ON public.shift_checklists;
CREATE POLICY "super_admin_all_shift_checklists" ON public.shift_checklists
  FOR ALL USING (public.get_my_role() = 'super_admin');

-- ── Policies: Shift Checklist Items
DROP POLICY IF EXISTS "super_admin_all_shift_checklist_items" ON public.shift_checklist_items;
CREATE POLICY "super_admin_all_shift_checklist_items" ON public.shift_checklist_items
  FOR ALL USING (public.get_my_role() = 'super_admin');

-- ── Policies: Audit Logs
DROP POLICY IF EXISTS "super_admin_read_audit_logs" ON public.audit_logs;
CREATE POLICY "super_admin_read_audit_logs" ON public.audit_logs
  FOR SELECT USING (public.get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "super_admin_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "super_admin_insert_audit_logs" ON public.audit_logs
  FOR INSERT WITH CHECK (public.get_my_role() = 'super_admin');

-- ── Policies: SOS Alerts
DROP POLICY IF EXISTS "super_admin_all_sos_alerts" ON public.sos_alerts;
CREATE POLICY "super_admin_all_sos_alerts" ON public.sos_alerts
  FOR ALL USING (public.get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "clinic_admin_read_own_sos_alerts" ON public.sos_alerts;
CREATE POLICY "clinic_admin_read_own_sos_alerts" ON public.sos_alerts
  FOR SELECT USING (
    public.get_my_role() = 'clinic_admin'
    AND clinic_id = public.get_my_clinic_id()
  );

DROP POLICY IF EXISTS "clinic_admin_update_own_sos_alerts" ON public.sos_alerts;
CREATE POLICY "clinic_admin_update_own_sos_alerts" ON public.sos_alerts
  FOR UPDATE USING (
    public.get_my_role() = 'clinic_admin'
    AND clinic_id = public.get_my_clinic_id()
  );

DROP POLICY IF EXISTS "clinic_users_insert_sos_alerts" ON public.sos_alerts;
CREATE POLICY "clinic_users_insert_sos_alerts" ON public.sos_alerts
  FOR INSERT WITH CHECK (clinic_id = public.get_my_clinic_id());

DROP POLICY IF EXISTS "clinic_users_read_own_sos_alerts" ON public.sos_alerts;
CREATE POLICY "clinic_users_read_own_sos_alerts" ON public.sos_alerts
  FOR SELECT USING (
    public.get_my_role() IN ('caregiver', 'family', 'emergency_contact')
    AND clinic_id = public.get_my_clinic_id()
  );

-- ── Policies: SOS Notifications
DROP POLICY IF EXISTS "super_admin_all_sos_notifications" ON public.sos_notifications;
CREATE POLICY "super_admin_all_sos_notifications" ON public.sos_notifications
  FOR ALL USING (public.get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "clinic_admin_read_sos_notifications" ON public.sos_notifications;
CREATE POLICY "clinic_admin_read_sos_notifications" ON public.sos_notifications
  FOR SELECT USING (
    public.get_my_role() = 'clinic_admin'
    AND EXISTS (
      SELECT 1 FROM public.sos_alerts a
      WHERE a.id = sos_alert_id
        AND a.clinic_id = public.get_my_clinic_id()
    )
  );

-- ── Policies: User Consents
DROP POLICY IF EXISTS "users access own consents" ON user_consents;
CREATE POLICY "users access own consents" ON user_consents FOR ALL
  USING (user_id = auth.uid());

-- ── Policies: Data Retention Policies
DROP POLICY IF EXISTS "authenticated users view retention policies" ON data_retention_policies;
CREATE POLICY "authenticated users view retention policies" ON data_retention_policies FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── Policies: Plans
DROP POLICY IF EXISTS "Plans are viewable by all" ON plans;
CREATE POLICY "Plans are viewable by all" ON plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only super_admin can manage plans" ON plans;
CREATE POLICY "Only super_admin can manage plans" ON plans FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- ── Policies: Plan Benefits
DROP POLICY IF EXISTS "Benefits are viewable by all" ON plan_benefits;
CREATE POLICY "Benefits are viewable by all" ON plan_benefits FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only super_admin can manage benefits" ON plan_benefits;
CREATE POLICY "Only super_admin can manage benefits" ON plan_benefits FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- ── Policies: Plan Benefit Relations
DROP POLICY IF EXISTS "Plan benefit relations are viewable by all" ON plan_benefit_relations;
CREATE POLICY "Plan benefit relations are viewable by all" ON plan_benefit_relations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only super_admin can manage plan benefit relations" ON plan_benefit_relations;
CREATE POLICY "Only super_admin can manage plan benefit relations" ON plan_benefit_relations FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- ── Policies: Clinic Plans
DROP POLICY IF EXISTS "Super admin can view all clinic plans" ON clinic_plans;
CREATE POLICY "Super admin can view all clinic plans" ON clinic_plans FOR SELECT USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

DROP POLICY IF EXISTS "Clinic admin can view own clinic plans" ON clinic_plans;
CREATE POLICY "Clinic admin can view own clinic plans" ON clinic_plans FOR SELECT USING (
  auth.jwt() ->> 'role' = 'clinic_admin' AND clinic_id = (
    SELECT clinic_id FROM users WHERE id = (auth.jwt() ->> 'id')::uuid
  )
);

DROP POLICY IF EXISTS "Only super_admin can manage clinic plans" ON clinic_plans;
CREATE POLICY "Only super_admin can manage clinic plans" ON clinic_plans FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- ── Policies: Clinic Plan Benefits
DROP POLICY IF EXISTS "Clinic plan benefits viewable with clinic plan access" ON clinic_plan_benefits;
CREATE POLICY "Clinic plan benefits viewable with clinic plan access" ON clinic_plan_benefits FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM clinic_plans cp
    WHERE cp.id = clinic_plan_benefits.clinic_plan_id
    AND (
      auth.jwt() ->> 'role' = 'super_admin'
      OR (auth.jwt() ->> 'role' = 'clinic_admin' AND cp.clinic_id = (
        SELECT clinic_id FROM users WHERE id = (auth.jwt() ->> 'id')::uuid
      ))
    )
  )
);

DROP POLICY IF EXISTS "Only super_admin can manage clinic plan benefits" ON clinic_plan_benefits;
CREATE POLICY "Only super_admin can manage clinic plan benefits" ON clinic_plan_benefits FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- ── Policies: User Benefits
DROP POLICY IF EXISTS "Users can view own benefits" ON user_benefits;
CREATE POLICY "Users can view own benefits" ON user_benefits FOR SELECT USING (
  user_id = (auth.jwt() ->> 'id')::uuid
);

DROP POLICY IF EXISTS "Super admin can view all user benefits" ON user_benefits;
CREATE POLICY "Super admin can view all user benefits" ON user_benefits FOR SELECT USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

DROP POLICY IF EXISTS "Users can update own benefits" ON user_benefits;
CREATE POLICY "Users can update own benefits" ON user_benefits FOR UPDATE USING (
  user_id = (auth.jwt() ->> 'id')::uuid
);

DROP POLICY IF EXISTS "Only super_admin can manage user benefits" ON user_benefits;
CREATE POLICY "Only super_admin can manage user benefits" ON user_benefits FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- ── Policies: Subscription Payments
DROP POLICY IF EXISTS "Super admin can view all payments" ON subscription_payments;
CREATE POLICY "Super admin can view all payments" ON subscription_payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Clinic admin can view own payments" ON subscription_payments;
CREATE POLICY "Clinic admin can view own payments" ON subscription_payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'clinic_admin' AND clinic_id = subscription_payments.clinic_id
  )
);

-- ── Policies: Subscription Notifications
DROP POLICY IF EXISTS "Super admin can manage all notifications" ON subscription_notifications;
CREATE POLICY "Super admin can manage all notifications" ON subscription_notifications FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

DROP POLICY IF EXISTS "Clinic admin can view own notifications" ON subscription_notifications;
CREATE POLICY "Clinic admin can view own notifications" ON subscription_notifications FOR SELECT USING (
  auth.jwt() ->> 'role' = 'clinic_admin' AND clinic_id = (
    SELECT clinic_id FROM users WHERE id = (auth.jwt() ->> 'id')::uuid
  )
);

-- ── Policies: System Settings
DROP POLICY IF EXISTS "system_settings_read" ON system_settings;
CREATE POLICY "system_settings_read" ON system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "system_settings_update" ON system_settings;
CREATE POLICY "system_settings_update" ON system_settings FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- ── Policies: Broadcast Notifications
DROP POLICY IF EXISTS "broadcast_super_admin_all" ON broadcast_notifications;
CREATE POLICY "broadcast_super_admin_all" ON broadcast_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- ============================================================
-- FIM DO SCHEMA CONSOLIDADO
-- ============================================================