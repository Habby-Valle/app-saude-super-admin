-- =====================================================
-- Sistema de Trial Automático
-- =====================================================

-- 1. Adicionar campo is_default aos planos
ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;

-- Atualizar planos existentes como não default
UPDATE plans SET is_default = false WHERE is_default IS NULL OR is_default = false;

-- Definir Trial como plano padrão
UPDATE plans SET is_default = true WHERE name = 'Trial';

-- 2. Adicionar índice para buscar plano padrão rapidamente
CREATE INDEX idx_plans_is_default ON plans(is_default) WHERE is_default = true;

-- =====================================================
-- Função para ativar trial para uma clínica
-- =====================================================
CREATE OR REPLACE FUNCTION activate_trial_for_clinic(p_clinic_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id UUID;
  v_trial_duration INTEGER := 14; -- dias
BEGIN
  -- Busca o plano padrão ( Trial)
  SELECT id INTO v_plan_id
  FROM plans
  WHERE is_default = true AND is_active = true
  ORDER BY sort_order ASC
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    RAISE NOTICE 'Nenhum plano padrão encontrado para ativar trial';
    RETURN;
  END IF;

  -- Verifica se já existe clinic_plans ativo
  IF EXISTS (
    SELECT 1 FROM clinic_plans
    WHERE clinic_id = p_clinic_id
    AND status IN ('trial', 'active')
  ) THEN
    RAISE NOTICE 'Clínica já possui assinatura ativa';
    RETURN;
  END IF;

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

  RAISE NOTICE 'Trial ativado para clínica % - expira em % dias', p_clinic_id, v_trial_duration;
END;
$$;

-- =====================================================
-- Trigger: ativar trial automaticamente ao criar clínica
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_activate_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- Ativa trial apenas para clínicas novas (não updates)
  IF TG_OP = 'INSERT' THEN
    PERFORM activate_trial_for_clinic(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clinic_trials_trigger
AFTER INSERT ON clinics
FOR EACH ROW EXECUTE FUNCTION trigger_activate_trial();