-- =====================================================
-- Tabela de Histórico de Pagamentos
-- =====================================================

CREATE TABLE subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  clinic_plan_id UUID REFERENCES clinic_plans(id),
  stripe_payment_id TEXT,
  stripe_subscription_id TEXT,
  stripe_session_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
  payment_method TEXT,
  billing_cycle TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_subscription_payments_clinic_id ON subscription_payments(clinic_id);
CREATE INDEX idx_subscription_payments_clinic_plan_id ON subscription_payments(clinic_plan_id);
CREATE INDEX idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX idx_subscription_payments_paid_at ON subscription_payments(paid_at DESC);

-- RLS
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Super Admin acessa tudo
CREATE POLICY "Super admin can view all payments" ON subscription_payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Policy: Clinic Admin acessa apenas da própria clínica
CREATE POLICY "Clinic admin can view own payments" ON subscription_payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'clinic_admin' AND clinic_id = subscription_payments.clinic_id
  )
);