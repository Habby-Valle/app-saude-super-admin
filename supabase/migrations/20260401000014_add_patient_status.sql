-- Adiciona status ao paciente (ativo / inativo)
-- Clínica admin pode desativar; exclusão permanente é privilégio do super admin.
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CONSTRAINT patients_status_check CHECK (status IN ('active', 'inactive'));
