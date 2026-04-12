-- Permitir clinic_admin gerenciar plano da própria clínica
-- (necessário para mudar de plano free para trial/pago)

DROP POLICY IF EXISTS "Only super_admin can manage clinic plans" ON clinic_plans;

CREATE POLICY "Super admin can manage all clinic plans" ON clinic_plans
FOR ALL USING (
  auth.jwt() ->> 'role' = 'super_admin'
);

CREATE POLICY "Clinic admin can manage own clinic plans" ON clinic_plans
FOR ALL USING (
  auth.jwt() ->> 'role' = 'clinic_admin'
  AND clinic_id = (
    SELECT clinic_id FROM users WHERE id = (auth.jwt() ->> 'id')::uuid
  )
);