-- Fix: Migrar cancelled sem expires_at para Free
-- Garante que qualquer cancelamento vai para Free

CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM plans WHERE name = 'Free' LIMIT 1;
  
  IF free_plan_id IS NULL THEN
    RETURN;
  END IF;

  -- Com expires_at
  UPDATE clinic_plans
  SET status = 'free', plan_id = free_plan_id, updated_at = now()
  WHERE status IN ('trial', 'active', 'cancelled')
    AND expires_at IS NOT NULL
    AND expires_at < now();

  -- Cancelled sem expires_at (Stripe cancelamento)
  UPDATE clinic_plans
  SET status = 'free', plan_id = free_plan_id, updated_at = now()
  WHERE status = 'cancelled'
    AND (expires_at IS NULL OR expires_at >= now());
END;
$$;