-- ============================================================
-- Feature 36: LGPD — Criptografia e Privacidade de Dados
-- ============================================================
-- O que este script faz:
--   1. Habilita pgcrypto (usado para gen_random_uuid já existente)
--   2. Cria tabela user_consents (consentimento explícito)
--   3. Cria tabela data_retention_policies (configuração de retenção)
--   4. Adiciona coluna anonymized_at em users e patients
--   5. Cria RLS policies para as novas tabelas
-- ============================================================

-- ─── 1. Extensão pgcrypto ─────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── 2. Tabela: user_consents ─────────────────────────────────────────────────
-- Registra consentimentos explícitos dos titulares (LGPD Art. 8)

CREATE TABLE IF NOT EXISTS user_consents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  consent_type  TEXT        NOT NULL,  -- 'data_processing', 'marketing', 'health_data'
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

COMMENT ON TABLE user_consents IS
  'Registros de consentimento explícito dos titulares (LGPD Art. 8).';

-- ─── 3. Tabela: data_retention_policies ──────────────────────────────────────
-- Configura por quanto tempo cada entidade mantém os dados

CREATE TABLE IF NOT EXISTS data_retention_policies (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  entity         TEXT    NOT NULL UNIQUE,  -- 'audit_logs', 'sos_alerts', 'shifts', 'patients'
  label          TEXT    NOT NULL,
  retention_days INTEGER NOT NULL CHECK (retention_days > 0),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by     UUID    REFERENCES users(id)
);

INSERT INTO data_retention_policies (entity, label, retention_days) VALUES
  ('audit_logs', 'Logs de Auditoria',      365),
  ('sos_alerts', 'Alertas SOS',            730),
  ('shifts',     'Histórico de Turnos',    1825),
  ('patients',   'Dados de Pacientes',     3650)
ON CONFLICT (entity) DO NOTHING;

COMMENT ON TABLE data_retention_policies IS
  'Políticas de retenção de dados por entidade (LGPD Art. 15 e 16).';

-- ─── 4. Coluna anonymized_at ──────────────────────────────────────────────────
-- Registra quando um titular exerceu o direito ao esquecimento

ALTER TABLE users    ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

COMMENT ON COLUMN users.anonymized_at    IS 'Data em que os dados do usuário foram anonimizados (LGPD Art. 18, VI).';
COMMENT ON COLUMN patients.anonymized_at IS 'Data em que os dados do paciente foram anonimizados (LGPD Art. 18, VI).';

-- ─── 5. RLS Policies ─────────────────────────────────────────────────────────

ALTER TABLE user_consents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- user_consents: super_admin vê tudo; titular vê apenas os próprios
CREATE POLICY "super_admin full access on user_consents"
  ON user_consents FOR ALL
  USING (auth.is_super_admin());

CREATE POLICY "users read own consents"
  ON user_consents FOR SELECT
  USING (user_id = auth.uid());

-- data_retention_policies: somente super_admin gerencia
CREATE POLICY "super_admin full access on data_retention_policies"
  ON data_retention_policies FOR ALL
  USING (auth.is_super_admin());
