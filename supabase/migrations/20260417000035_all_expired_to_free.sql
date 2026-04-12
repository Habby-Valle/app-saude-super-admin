-- Atualizar função de expiração para migrar qualquer plano expirado para Free
-- Inclui: trial, active, cancelled
-- Também migra cancelled que não tem expires_at (cancelado via Stripe)

CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Buscar ID do plano Free
  SELECT id INTO free_plan_id FROM plans WHERE name = 'Free' LIMIT 1;
  
  -- Se não existe plano Free, sair
  IF free_plan_id IS NULL THEN
    RAISE NOTICE 'Plano Free não encontrado';
    RETURN;
  END IF;

  -- Migrar qualquer plano expirado para Free (trial, active, cancelled) com expires_at
  UPDATE clinic_plans
  SET 
    status = 'free',
    plan_id = free_plan_id,
    updated_at = now()
  WHERE 
    status IN ('trial', 'active', 'cancelled')
    AND expires_at IS NOT NULL
    AND expires_at < now();

  -- Migrar cancelled (sem expires_at) para Free - cancelamento via Stripe
  UPDATE clinic_plans
  SET 
    status = 'free',
    plan_id = free_plan_id,
    updated_at = now()
  WHERE 
    status = 'cancelled'
    AND (expires_at IS NULL OR expires_at >= now());
END;
$$;