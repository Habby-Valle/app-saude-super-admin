-- =====================================================
-- Fix: Corrigir policies RLS para usar get_my_role()
-- As policies estavam usando auth.jwt() ->> 'role'
-- que não funciona pois o role está na tabela users
-- =====================================================

-- Plans
DROP POLICY IF EXISTS "Plans are viewable by all" ON plans;
DROP POLICY IF EXISTS "Only super_admin can manage plans" ON plans;
CREATE POLICY "Plans are viewable by all" ON plans FOR SELECT USING (true);
CREATE POLICY "Only super_admin can manage plans" ON plans FOR ALL USING (
  public.get_my_role() = 'super_admin'
);

-- Plan Benefits
DROP POLICY IF EXISTS "Benefits are viewable by all" ON plan_benefits;
DROP POLICY IF EXISTS "Only super_admin can manage benefits" ON plan_benefits;
CREATE POLICY "Benefits are viewable by all" ON plan_benefits FOR SELECT USING (true);
CREATE POLICY "Only super_admin can manage benefits" ON plan_benefits FOR ALL USING (
  public.get_my_role() = 'super_admin'
);

-- Plan Benefit Relations
DROP POLICY IF EXISTS "Plan benefit relations are viewable by all" ON plan_benefit_relations;
DROP POLICY IF EXISTS "Only super_admin can manage plan benefit relations" ON plan_benefit_relations;
CREATE POLICY "Plan benefit relations are viewable by all" ON plan_benefit_relations FOR SELECT USING (true);
CREATE POLICY "Only super_admin can manage plan benefit relations" ON plan_benefit_relations FOR ALL USING (
  public.get_my_role() = 'super_admin'
);
