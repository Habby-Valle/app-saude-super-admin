-- Job de Expiração Automática de Assinaturas
-- Marca automaticamente assinaturas expiradas

-- 1. Criar função de expiração
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Marca assinaturas trial/active expiradas como 'expired'
  UPDATE clinic_plans
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    status IN ('trial', 'active')
    AND expires_at IS NOT NULL
    AND expires_at < now();
END;
$$;

-- 2. Agendar job para rodar diariamente (meia-noite)
SELECT cron.schedule(
  'expire-subscriptions',
  '0 0 * * *',  -- daily at midnight
  'SELECT expire_subscriptions()'
);

-- 3. Para desatendar (se necessário no futuro):
-- SELECT cron.unschedule('expire-subscriptions');