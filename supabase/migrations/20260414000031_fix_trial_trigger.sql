-- Corrigir trigger de Trial para não ativar se já tem plano
-- Execute este SQL no Supabase SQL Editor

-- 1. Dropar trigger antigo
DROP TRIGGER IF EXISTS clinic_trials_trigger ON clinics;

-- 2. Recriar função de trigger que verifica se já tem plano
CREATE OR REPLACE FUNCTION trigger_activate_trial()
RETURNS TRIGGER AS $$
DECLARE
  v_has_plan BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Verificar se clínica já foi vinculada a um plano via clinic_plans
    SELECT EXISTS (
      SELECT 1 FROM clinic_plans 
      WHERE clinic_id = NEW.id
      LIMIT 1
    ) INTO v_has_plan;

    -- Só ativa trial se ainda não tem plano
    IF v_has_plan = false THEN
      PERFORM activate_trial_for_clinic(NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recriar trigger
CREATE TRIGGER clinic_trials_trigger
AFTER INSERT ON clinics
FOR EACH ROW EXECUTE FUNCTION trigger_activate_trial();

-- 4. Verificar resultado
SELECT tgname FROM pg_trigger WHERE tgname = 'clinic_trials_trigger';
