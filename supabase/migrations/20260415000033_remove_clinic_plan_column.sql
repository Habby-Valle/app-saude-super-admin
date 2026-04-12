-- Remover coluna 'plan' redundante da tabela clinics
-- A relação com planos é feita através da tabela clinic_plans

-- 1. Remover coluna plan
ALTER TABLE clinics DROP COLUMN IF EXISTS plan;

-- 2. Confirmar
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'clinics' AND column_name = 'plan';
