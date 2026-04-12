-- Sistema Trial 1x + Downgrade Permitido
-- Trial apenas 1x na vida
-- Pode downgrade de Trial para Free antes de expirar

-- 1. Adicionar coluna para rastrear se já usou trial
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN NOT NULL DEFAULT false;

-- 2. Marcar clínicas que já usaram trial (tem clinic_plans com status trial)
DO $$
DECLARE
  clinic_record RECORD;
BEGIN
  FOR clinic_record IN 
    SELECT DISTINCT cp.clinic_id
    FROM clinic_plans cp
    WHERE cp.status = 'trial'
  LOOP
    UPDATE clinics 
    SET has_used_trial = true 
    WHERE id = clinic_record.clinic_id;
  END LOOP;
END $$;

-- 3. Modificar função para ativar trial - verificar se já usou
CREATE OR REPLACE FUNCTION activate_trial_for_clinic(p_clinic_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id UUID;
  v_trial_duration INTEGER := 14;
  v_has_used BOOLEAN;
BEGIN
  -- Verificar se já usou trial
  SELECT has_used_trial INTO v_has_used
  FROM clinics WHERE id = p_clinic_id;

  IF v_has_used = true THEN
    RAISE EXCEPTION 'Esta clínica já utilizou o Trial anteriormente';
  END IF;

  -- Busca o plano Trial
  SELECT id INTO v_plan_id
  FROM plans
  WHERE name = 'Trial' AND is_active = true
  ORDER BY sort_order ASC
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'Plano Trial não encontrado';
  END IF;

  -- Verifica se já existe clinic_plans ativo (trial ou active)
  IF EXISTS (
    SELECT 1 FROM clinic_plans
    WHERE clinic_id = p_clinic_id
    AND status IN ('trial', 'active')
  ) THEN
    RAISE EXCEPTION 'Clínica já possui assinatura ativa';
  END IF;

  -- Marcar que usou trial
  UPDATE clinics SET has_used_trial = true WHERE id = p_clinic_id;

  -- Cria registro de trial
  INSERT INTO clinic_plans (
    clinic_id,
    plan_id,
    status,
    started_at,
    expires_at,
    trial_ends_at
  ) VALUES (
    p_clinic_id,
    v_plan_id,
    'trial',
    now(),
    now() + (v_trial_duration || ' days')::interval,
    now() + (v_trial_duration || ' days')::interval
  );

  RAISE NOTICE 'Trial ativado para clínica %', p_clinic_id;
END;
$$;

-- 4. Função para downgrade Trial → Free (voluntário)
CREATE OR REPLACE FUNCTION downgrade_trial_to_free(p_clinic_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_free_plan_id UUID;
  v_current_plan_id UUID;
BEGIN
  -- Buscar plano Free
  SELECT id INTO v_free_plan_id FROM plans WHERE name = 'Free' LIMIT 1;

  IF v_free_plan_id IS NULL THEN
    RAISE EXCEPTION 'Plano Free não encontrado';
  END IF;

  -- Verificar se Está em Trial
  SELECT plan_id INTO v_current_plan_id
  FROM clinic_plans
  WHERE clinic_id = p_clinic_id AND status = 'trial'
  LIMIT 1;

  IF v_current_plan_id IS NULL THEN
    RAISE EXCEPTION 'Clínica não está em Trial';
  END IF;

  -- Cancelar trial atual
  UPDATE clinic_plans
  SET status = 'cancelled', updated_at = now()
  WHERE clinic_id = p_clinic_id AND status = 'trial';

  -- Vincular ao Free (sem contar como trial usado novamente - já foi marcado)
  INSERT INTO clinic_plans (clinic_id, plan_id, status, started_at, expires_at, trial_ends_at)
  VALUES (p_clinic_id, v_free_plan_id, 'free', now(), '2099-12-31', NULL);

  RAISE NOTICE 'Clínica % fez downgrade para Free', p_clinic_id;
END;
$$;

-- 5. Atualizar Trigger para usar Trial 1x
-- O trigger antigo ativava trial automaticamente - agora precisa verificar
CREATE OR REPLACE FUNCTION trigger_activate_trial()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM activate_trial_for_clinic(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;