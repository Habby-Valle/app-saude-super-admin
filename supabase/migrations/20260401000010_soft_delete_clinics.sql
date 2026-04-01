-- Soft delete para clínicas
-- Adiciona coluna deleted_at (NULL = ativa, não-NULL = excluída logicamente)

ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Índice para queries que filtram apenas clínicas não deletadas
CREATE INDEX IF NOT EXISTS clinics_deleted_at_idx ON clinics (deleted_at)
  WHERE deleted_at IS NULL;

-- Comentário descritivo
COMMENT ON COLUMN clinics.deleted_at IS
  'Soft delete: preenchido com o timestamp da exclusão lógica. NULL = clínica ativa/inativa normalmente.';
