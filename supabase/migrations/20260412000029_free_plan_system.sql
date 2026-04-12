  -- Sistema de Plano Free
-- Clinics começam com Free automaticamente
-- Trial/Assinatura cancelada → Free

-- 1. Adicionar status 'free' ao CHECK constraint
ALTER TABLE clinic_plans 
DROP CONSTRAINT IF EXISTS clinic_plans_status_check;

ALTER TABLE clinic_plans 
ADD CONSTRAINT clinic_plans_status_check 
CHECK (status IN ('free', 'trial', 'active', 'expired', 'cancelled'));

-- 2. Buscar ID do plano Free ou criar se não existir
INSERT INTO plans (id, name, description, price, billing_cycle, is_active, features, max_users, max_patients, max_storage, sort_order)
SELECT gen_random_uuid(), 'Free', 'Plano gratuito com funcionalidades básicas', 0, 'monthly', true, '[]', 2, 10, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Free');

-- 3. Modificar função de expiração para migrar para Free (não mais expired)
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
  
  -- Se não existe plano Free, usar 'expired' como antes
  IF free_plan_id IS NULL THEN
    UPDATE clinic_plans
    SET 
      status = 'expired',
      updated_at = now()
    WHERE 
      status IN ('trial', 'active')
      AND expires_at IS NOT NULL
      AND expires_at < now();
    RETURN;
  END IF;

  -- Migrar trial expirado para Free
  UPDATE clinic_plans
  SET 
    status = 'free',
    plan_id = free_plan_id,
    updated_at = now()
  WHERE 
    status = 'trial'
    AND trial_ends_at IS NOT NULL
    AND trial_ends_at < now();

  -- Migrar assinatura ativa/paga expirada para Free
  UPDATE clinic_plans
  SET 
    status = 'free',
    plan_id = free_plan_id,
    updated_at = now()
  WHERE 
    status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < now()
    AND (
      SELECT 1 FROM plans WHERE id = clinic_plans.plan_id AND price > 0
    );

  -- Para assinaturas já expiradas (antes deste update), manter como expired
  UPDATE clinic_plans
  SET 
    status = 'expired',
    updated_at = now()
  WHERE 
    status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < now()
    AND (
      SELECT 1 FROM plans WHERE id = clinic_plans.plan_id AND price = 0
    );
END;
$$;

-- 4. Quando uma clínica é criada, automaticamente vincular ao plano Free
-- Esta função será chamada pelo server action ao criar clínica
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

  -- Verificar se já tem um plano free vinculado
  IF EXISTS (
    SELECT 1 FROM clinic_plans 
    WHERE clinic_id = p_clinic_id 
    AND status = 'free' 
    LIMIT 1
  ) THEN
    RETURN;
  END IF;

  -- Inserir plano Free para a clínica
  INSERT INTO clinic_plans (clinic_id, plan_id, status, started_at, expires_at, trial_ends_at)
  VALUES (p_clinic_id, free_plan_id, 'free', now(), '2099-12-31', NULL);
END;
$$;

-- 5. Vincular clínicas existentes que não têm plano
-- Rodar apenas uma vez para clínicas criadas antes deste update
DO $$
DECLARE
  free_plan_id UUID;
  clinic_record RECORD;
BEGIN
  SELECT id INTO free_plan_id FROM plans WHERE name = 'Free' LIMIT 1;
  
  IF free_plan_id IS NULL THEN
    RETURN;
  END IF;

  FOR clinic_record IN 
    SELECT c.id FROM clinics c
    WHERE NOT EXISTS (
      SELECT 1 FROM clinic_plans cp WHERE cp.clinic_id = c.id
    )
  LOOP
    INSERT INTO clinic_plans (clinic_id, plan_id, status, started_at, expires_at, trial_ends_at)
    VALUES (clinic_record.id, free_plan_id, 'free', now(), NULL, NULL);
  END LOOP;
END $$;

-- 6. Função para fazer upgrade de Free para Trial (quando clínica contratta trial)
CREATE OR REPLACE FUNCTION upgrade_clinic_to_trial(p_clinic_id UUID, p_plan_id UUID, p_trial_days INTEGER DEFAULT 14)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_ends DATE;
BEGIN
  trial_ends := NOW() + (p_trial_days || ' days')::INTERVAL;

  -- Marcar plano free atual como inativo
  UPDATE clinic_plans
  SET status = 'cancelled', updated_at = now()
  WHERE clinic_id = p_clinic_id AND status = 'free';

  -- Criar novo registro como trial
  INSERT INTO clinic_plans (clinic_id, plan_id, status, started_at, expires_at, trial_ends_at)
  VALUES (p_clinic_id, p_plan_id, 'trial', now(), trial_ends, trial_ends);
END;
$$;