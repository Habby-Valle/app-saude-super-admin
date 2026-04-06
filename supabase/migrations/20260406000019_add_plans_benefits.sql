-- =====================================================
-- Planos e Benefícios
-- =====================================================

-- Plans (planos de assinatura)
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  features JSONB NOT NULL DEFAULT '[]',
  max_users INTEGER NOT NULL DEFAULT 10,
  max_patients INTEGER NOT NULL DEFAULT 50,
  max_storage INTEGER NOT NULL DEFAULT 1, -- GB
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plan Benefits (benefícios disponíveis)
CREATE TABLE plan_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('feature', 'limit', 'addon', 'integration')),
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plan Benefit Relations (relação N:N entre planos e benefícios)
CREATE TABLE plan_benefit_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES plan_benefits(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(plan_id, benefit_id)
);

-- Clinic Plans (plano ativo por clínica - histórico)
CREATE TABLE clinic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clinic Plan Benefits (override de benefícios por clínica)
CREATE TABLE clinic_plan_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_plan_id UUID NOT NULL REFERENCES clinic_plans(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES plan_benefits(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_plan_id, benefit_id)
);

-- User Benefits (benefícios por usuário)
CREATE TABLE user_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES plan_benefits(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  granted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, benefit_id)
);

-- =====================================================
-- Índices
-- =====================================================
CREATE INDEX idx_plan_benefit_relations_plan_id ON plan_benefit_relations(plan_id);
CREATE INDEX idx_plan_benefit_relations_benefit_id ON plan_benefit_relations(benefit_id);
CREATE INDEX idx_clinic_plans_clinic_id ON clinic_plans(clinic_id);
CREATE INDEX idx_clinic_plans_status ON clinic_plans(status);
CREATE INDEX idx_clinic_plan_benefits_clinic_plan_id ON clinic_plan_benefits(clinic_plan_id);
CREATE INDEX idx_user_benefits_user_id ON user_benefits(user_id);

-- =====================================================
-- RLS Policies
-- =====================================================

-- Plans: público para leitura, apenas super_admin escreve
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by all" ON plans FOR SELECT USING (true);
CREATE POLICY "Only super_admin can manage plans" ON plans FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- Plan Benefits: público para leitura, apenas super_admin escreve
ALTER TABLE plan_benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Benefits are viewable by all" ON plan_benefits FOR SELECT USING (true);
CREATE POLICY "Only super_admin can manage benefits" ON plan_benefits FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- Plan Benefit Relations: público para leitura, apenas super_admin escreve
ALTER TABLE plan_benefit_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plan benefit relations are viewable by all" ON plan_benefit_relations FOR SELECT USING (true);
CREATE POLICY "Only super_admin can manage plan benefit relations" ON plan_benefit_relations FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- Clinic Plans: super_admin vê todas, clinic_admin vê apenas sua clínica
ALTER TABLE clinic_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin can view all clinic plans" ON clinic_plans FOR SELECT USING (
  auth.jwt() ->> 'role' = 'super_admin'
);
CREATE POLICY "Clinic admin can view own clinic plans" ON clinic_plans FOR SELECT USING (
  auth.jwt() ->> 'role' = 'clinic_admin' AND clinic_id = (
    SELECT clinic_id FROM users WHERE id = (auth.jwt() ->> 'id')::uuid
  )
);
CREATE POLICY "Only super_admin can manage clinic plans" ON clinic_plans FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- Clinic Plan Benefits: herda do clinic_plans
ALTER TABLE clinic_plan_benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clinic plan benefits viewable with clinic plan access" ON clinic_plan_benefits FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM clinic_plans cp
    WHERE cp.id = clinic_plan_benefits.clinic_plan_id
    AND (
      auth.jwt() ->> 'role' = 'super_admin'
      OR (auth.jwt() ->> 'role' = 'clinic_admin' AND cp.clinic_id = (
        SELECT clinic_id FROM users WHERE id = (auth.jwt() ->> 'id')::uuid
      ))
    )
  )
);
CREATE POLICY "Only super_admin can manage clinic plan benefits" ON clinic_plan_benefits FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- User Benefits: usuário vê seus próprios, super_admin vê todos
ALTER TABLE user_benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own benefits" ON user_benefits FOR SELECT USING (
  user_id = (auth.jwt() ->> 'id')::uuid
);
CREATE POLICY "Super admin can view all user benefits" ON user_benefits FOR SELECT USING (
  auth.jwt() ->> 'role' = 'super_admin'
);
CREATE POLICY "Users can update own benefits" ON user_benefits FOR UPDATE USING (
  user_id = (auth.jwt() ->> 'id')::uuid
);
CREATE POLICY "Only super_admin can manage user benefits" ON user_benefits FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

-- =====================================================
-- Seed: Planos Padrão
-- =====================================================
INSERT INTO plans (id, name, description, price, billing_cycle, is_active, features, max_users, max_patients, max_storage, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Trial', 'Plano de avaliação gratuito', 0, 'monthly', true, '["basic_checklists"]', 3, 5, 1, 1),
  ('00000000-0000-0000-0000-000000000002', 'Basic', 'Para pequenas clínicas', 99.90, 'monthly', true, '["basic_checklists", "reports"]', 10, 50, 5, 2),
  ('00000000-0000-0000-0000-000000000003', 'Premium', 'Para clínicas em crescimento', 199.90, 'monthly', true, '["advanced_checklists", "reports", "sos_system", "priority_support"]', 50, 200, 20, 3),
  ('00000000-0000-0000-0000-000000000004', 'Enterprise', 'Para grandes operações', 499.90, 'monthly', true, '["all_features"]', 999, 9999, 100, 4);

-- =====================================================
-- Seed: Benefícios
-- =====================================================
INSERT INTO plan_benefits (id, name, code, category, icon, is_active) VALUES
  ('00000000-0000-0000-0001-000000000001', 'Checklists Básicos', 'BASIC_CHECKLISTS', 'feature', 'ClipboardList', true),
  ('00000000-0000-0000-0001-000000000002', 'Checklists Avançados', 'ADVANCED_CHECKLISTS', 'feature', 'ClipboardCheck', true),
  ('00000000-0000-0000-0001-000000000003', 'Relatórios', 'REPORTS', 'feature', 'BarChart3', true),
  ('00000000-0000-0000-0001-000000000004', 'Sistema SOS', 'SOS_SYSTEM', 'feature', 'Siren', true),
  ('00000000-0000-0000-0001-000000000005', 'Suporte Prioritário', 'PRIORITY_SUPPORT', 'addon', 'Headphones', true),
  ('00000000-0000-0000-0001-000000000006', 'Dashboard Avançado', 'ADVANCED_DASHBOARD', 'feature', 'LayoutDashboard', true),
  ('00000000-0000-0000-0001-000000000007', 'Integração API', 'API_INTEGRATION', 'integration', 'Plug', true),
  ('00000000-0000-0000-0001-000000000008', 'Todos os Recursos', 'ALL_FEATURES', 'feature', 'Sparkles', true);

-- =====================================================
-- Seed: Relations (benefícios por plano)
-- =====================================================
-- Trial: basic_checklists apenas
INSERT INTO plan_benefit_relations (plan_id, benefit_id, is_enabled) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', true);

-- Basic: basic_checklists + reports
INSERT INTO plan_benefit_relations (plan_id, benefit_id, is_enabled) VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000001', true),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000003', true);

-- Premium: todos os features
INSERT INTO plan_benefit_relations (plan_id, benefit_id, is_enabled) VALUES
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000001', true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000002', true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000003', true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000004', true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000005', true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000006', true);

-- Enterprise: todos
INSERT INTO plan_benefit_relations (plan_id, benefit_id, is_enabled) VALUES
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000001', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000002', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000003', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000004', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000005', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000006', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000007', true),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000008', true);

-- =====================================================
-- Update timestamp trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clinic_plans_updated_at BEFORE UPDATE ON clinic_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clinic_plan_benefits_updated_at BEFORE UPDATE ON clinic_plan_benefits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_benefits_updated_at BEFORE UPDATE ON user_benefits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();