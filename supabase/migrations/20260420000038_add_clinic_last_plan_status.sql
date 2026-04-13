-- Adicionar campo para detectar mudança de plano (para alerta de Trial expirado)
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS last_plan_status TEXT;
-- Não precisa de constraint pois é opcional