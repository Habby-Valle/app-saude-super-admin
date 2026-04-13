-- Salvar last_plan_status ao migrar para Free (para detectar mudanças e mostrar alerta)

CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  free_plan_id UUID;
  v_clinic_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM plans WHERE name = 'Free' LIMIT 1;
  
  IF free_plan_id IS NULL THEN
    RETURN;
  END IF;

  -- Trial expirou: salvar status antes de migrar
  FOR v_clinic_id IN SELECT clinic_id FROM clinic_plans 
    WHERE status = 'trial' AND trial_ends_at IS NOT NULL AND trial_ends_at < now()
  LOOP
    UPDATE clinics SET last_plan_status = 'trial' WHERE id = v_clinic_id;
  END LOOP;

  -- Active expirou: salvar status antes de migrar
  FOR v_clinic_id IN SELECT clinic_id FROM clinic_plans 
    WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < now()
  LOOP
    UPDATE clinics SET last_plan_status = 'active' WHERE id = v_clinic_id;
  END LOOP;

  -- Cancelled: salvar status
  FOR v_clinic_id IN SELECT DISTINCT clinic_id FROM clinic_plans 
    WHERE status = 'cancelled'
  LOOP
    UPDATE clinics SET last_plan_status = 'cancelled' WHERE id = v_clinic_id;
  END LOOP;

  -- Migrar expired para Free
  UPDATE clinic_plans
  SET status = 'free', plan_id = free_plan_id, updated_at = now()
  WHERE status IN ('trial', 'active', 'cancelled')
    AND (
      (expires_at IS NOT NULL AND expires_at < now())
      OR (trial_ends_at IS NOT NULL AND trial_ends_at < now())
    );

  -- Cancelled sem expires_at
  UPDATE clinic_plans
  SET status = 'free', plan_id = free_plan_id, updated_at = now()
  WHERE status = 'cancelled'
    AND (expires_at IS NULL OR expires_at >= now());
END;
$$;