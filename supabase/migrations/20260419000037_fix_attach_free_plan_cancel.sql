-- Corrigir função attach_free_plan_to_clinic
-- Cancela plano ativo antes de inserir free

CREATE OR REPLACE FUNCTION attach_free_plan_to_clinic(p_clinic_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Buscar ID do plano Free
  SELECT id INTO free_plan_id FROM plans WHERE name = 'Free' LIMIT 1;
  
  IF free_plan_id IS NULL THEN
    RAISE EXCEPTION 'Plano Free não encontrado';
  END IF;

  -- Cancelar planos ativos/trial/cancelled existentes
  UPDATE clinic_plans
  SET status = 'cancelled', updated_at = now()
  WHERE clinic_id = p_clinic_id
    AND status IN ('active', 'trial', 'free', 'cancelled');

  -- Inserir plano Free
  INSERT INTO clinic_plans (clinic_id, plan_id, status, started_at, expires_at, trial_ends_at)
  VALUES (p_clinic_id, free_plan_id, 'free', now(), NULL, NULL);
END;
$$;