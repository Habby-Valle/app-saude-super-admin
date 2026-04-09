-- Adicionar coluna email na tabela clinics
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS email TEXT;

-- Criar índice para busca por email
CREATE INDEX IF NOT EXISTS idx_clinics_email ON clinics(email);