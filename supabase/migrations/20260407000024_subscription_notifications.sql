-- =====================================================
-- Sistema de Notificações de Expiração
-- =====================================================

-- 1. Criar tabela de notificações
CREATE TABLE subscription_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  clinic_plan_id UUID NOT NULL REFERENCES clinic_plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trial_reminder', 'expired', 'renewal')),
  days_before INTEGER,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'in_app', 'sms')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

--Índices
CREATE INDEX idx_subscription_notifications_clinic_id ON subscription_notifications(clinic_id);
CREATE INDEX idx_subscription_notifications_clinic_plan_id ON subscription_notifications(clinic_plan_id);
CREATE INDEX idx_subscription_notifications_status ON subscription_notifications(status);

-- RLS
ALTER TABLE subscription_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin can manage all notifications" ON subscription_notifications FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);
CREATE POLICY "Clinic admin can view own notifications" ON subscription_notifications FOR SELECT USING (
  auth.jwt() ->> 'role' = 'clinic_admin' AND clinic_id = (
    SELECT clinic_id FROM users WHERE id = (auth.jwt() ->> 'id')::uuid
  )
);

-- 2. Criar função de notificações de expiração
CREATE OR REPLACE FUNCTION notify_expiring_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
  v_days INTEGER;
  v_days_before INTEGER;
  v_clinic_id UUID;
  v_clinic_plan_id UUID;
  v_clinic_name TEXT;
  v_clinic_email TEXT;
BEGIN
  -- Notificar 7, 3 e 1 dia antes
  FOR v_days IN SELECT unnest(ARRAY[7, 3, 1]) LOOP
    v_days_before := v_days;

    -- Cursor para assinaturas que expiram em v_days
    FOR v_record IN
      SELECT 
        cp.id AS clinic_plan_id,
        cp.clinic_id,
        c.name AS clinic_name,
        cp.expires_at,
        cp.status,
        cp.plan_id,
        EXTRACT(DAY FROM (cp.expires_at - now()))::integer AS days_until
      FROM clinic_plans cp
      JOIN clinics c ON c.id = cp.clinic_id
      WHERE cp.status IN ('trial', 'active')
        AND cp.expires_at IS NOT NULL
        AND cp.expires_at > now()
        AND cp.expires_at <= (now() + (v_days_before || ' days')::interval)
        AND cp.expires_at > (now() + ((v_days_before - 1) || ' days')::interval)
    LOOP
      -- Verifica se já enviou notificação para esses dias
      IF NOT EXISTS (
        SELECT 1 FROM subscription_notifications sn
        WHERE sn.clinic_plan_id = v_record.clinic_plan_id
          AND sn.days_before = v_days_before
          AND sn.channel = 'email'
          AND sn.status = 'sent'
      ) THEN
        -- Insere notificação pendente (pode ser processada por webhook externo)
        INSERT INTO subscription_notifications (
          clinic_id,
          clinic_plan_id,
          type,
          days_before,
          channel,
          status
        ) VALUES (
          v_record.clinic_id,
          v_record.clinic_plan_id,
          'trial_reminder',
          v_days_before,
          'email',
          'pending'
        );

        RAISE NOTICE 'Notificação pendente: clínica % expira em % dias',
          v_record.clinic_name, v_days_before;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- 3. Agendar job diário (mesmo cron da expiração)
-- A função será chamada diariamente para verificar expirações próximas
SELECT cron.schedule(
  'notify-expiring-subscriptions',
  '0 8 * * *',  -- daily at 8am (after expire job at midnight)
  'SELECT notify_expiring_subscriptions()'
);