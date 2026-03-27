-- ============================================
-- App Saúde - RLS Policies (Feature 30)
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- ============================================
-- PREPARAÇÃO
-- ============================================

-- Primeiro, verifique se RLS está habilitado nas tabelas
-- Se não estiver, habilite com:
-- ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- (etc para cada tabela)

-- ============================================
-- Função auxiliar para verificar se usuário é Super Admin
-- ============================================
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Função auxiliar para verificar clinic_id do usuário
-- ============================================
CREATE OR REPLACE FUNCTION auth.get_user_clinic_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT clinic_id FROM public.users
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- CLINICS
-- ============================================

-- Super Admin pode ver todas as clínicas
DROP POLICY IF EXISTS "clinics_super_admin_select" ON clinics;
CREATE POLICY "clinics_super_admin_select" ON clinics
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode inserir clínicas
DROP POLICY IF EXISTS "clinics_super_admin_insert" ON clinics;
CREATE POLICY "clinics_super_admin_insert" ON clinics
FOR INSERT TO authenticated
WITH CHECK (auth.is_super_admin());

-- Super Admin pode atualizar clínicas
DROP POLICY IF EXISTS "clinics_super_admin_update" ON clinics;
CREATE POLICY "clinics_super_admin_update" ON clinics
FOR UPDATE TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode excluir clínicas (soft delete)
DROP POLICY IF EXISTS "clinics_super_admin_delete" ON clinics;
CREATE POLICY "clinics_super_admin_delete" ON clinics
FOR DELETE TO authenticated
USING (auth.is_super_admin());

-- ============================================
-- USERS
-- ============================================

-- Super Admin pode ver todos os usuários
DROP POLICY IF EXISTS "users_super_admin_select" ON users;
CREATE POLICY "users_super_admin_select" ON users
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode inserir usuários
DROP POLICY IF EXISTS "users_super_admin_insert" ON users;
CREATE POLICY "users_super_admin_insert" ON users
FOR INSERT TO authenticated
WITH CHECK (auth.is_super_admin());

-- Super Admin pode atualizar usuários
DROP POLICY IF EXISTS "users_super_admin_update" ON users;
CREATE POLICY "users_super_admin_update" ON users
FOR UPDATE TO authenticated
USING (
  auth.is_super_admin()
  OR (
    -- Cuidadores podem atualizar apenas seu próprio perfil
    id = auth.uid()
    AND role = 'caregiver'
  )
);

-- Super Admin pode excluir usuários
DROP POLICY IF EXISTS "users_super_admin_delete" ON users;
CREATE POLICY "users_super_admin_delete" ON users
FOR DELETE TO authenticated
USING (auth.is_super_admin());

-- Clinic Admin pode ver usuários da própria clínica + super admins
DROP POLICY IF EXISTS "users_clinic_admin_select" ON users;
CREATE POLICY "users_clinic_admin_select" ON users
FOR SELECT TO authenticated
USING (
  role = 'super_admin'
  OR clinic_id = auth.get_user_clinic_id()
);

-- Clinic Admin pode atualizar usuários da própria clínica (exceto super_admin)
DROP POLICY IF EXISTS "users_clinic_admin_update" ON users;
CREATE POLICY "users_clinic_admin_update" ON users
FOR UPDATE TO authenticated
USING (
  role != 'super_admin'
  AND clinic_id = auth.get_user_clinic_id()
);

-- Qualquer usuário pode ver seu próprio perfil (necessário para topbar)
DROP POLICY IF EXISTS "users_own_profile_select" ON users;
CREATE POLICY "users_own_profile_select" ON users
FOR SELECT TO authenticated
USING (id = auth.uid());

-- ============================================
-- PATIENTS
-- ============================================

-- Super Admin pode ver todos os pacientes
DROP POLICY IF EXISTS "patients_super_admin_select" ON patients;
CREATE POLICY "patients_super_admin_select" ON patients
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode inserir pacientes
DROP POLICY IF EXISTS "patients_super_admin_insert" ON patients;
CREATE POLICY "patients_super_admin_insert" ON patients
FOR INSERT TO authenticated
WITH CHECK (auth.is_super_admin());

-- Super Admin pode atualizar pacientes
DROP POLICY IF EXISTS "patients_super_admin_update" ON patients;
CREATE POLICY "patients_super_admin_update" ON patients
FOR UPDATE TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode excluir pacientes
DROP POLICY IF EXISTS "patients_super_admin_delete" ON patients;
CREATE POLICY "patients_super_admin_delete" ON patients
FOR DELETE TO authenticated
USING (auth.is_super_admin());

-- Clinic Admin pode ver pacientes da própria clínica
DROP POLICY IF EXISTS "patients_clinic_admin_select" ON patients;
CREATE POLICY "patients_clinic_admin_select" ON patients
FOR SELECT TO authenticated
USING (clinic_id = auth.get_user_clinic_id());

-- Clinic Admin pode inserir pacientes na própria clínica
DROP POLICY IF EXISTS "patients_clinic_admin_insert" ON patients;
CREATE POLICY "patients_clinic_admin_insert" ON patients
FOR INSERT TO authenticated
WITH CHECK (clinic_id = auth.get_user_clinic_id());

-- Clinic Admin pode atualizar pacientes da própria clínica
DROP POLICY IF EXISTS "patients_clinic_admin_update" ON patients;
CREATE POLICY "patients_clinic_admin_update" ON patients
FOR UPDATE TO authenticated
USING (clinic_id = auth.get_user_clinic_id());

-- Clinic Admin pode excluir pacientes da própria clínica
DROP POLICY IF EXISTS "patients_clinic_admin_delete" ON patients;
CREATE POLICY "patients_clinic_admin_delete" ON patients
FOR DELETE TO authenticated
USING (clinic_id = auth.get_user_clinic_id());

-- ============================================
-- CAREGIVER_PATIENT
-- ============================================

-- Super Admin pode ver todos os vínculos
DROP POLICY IF EXISTS "caregiver_patient_super_admin_select" ON caregiver_patient;
CREATE POLICY "caregiver_patient_super_admin_select" ON caregiver_patient
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode inserir vínculos
DROP POLICY IF EXISTS "caregiver_patient_super_admin_insert" ON caregiver_patient;
CREATE POLICY "caregiver_patient_super_admin_insert" ON caregiver_patient
FOR INSERT TO authenticated
WITH CHECK (auth.is_super_admin());

-- Super Admin pode excluir vínculos
DROP POLICY IF EXISTS "caregiver_patient_super_admin_delete" ON caregiver_patient;
CREATE POLICY "caregiver_patient_super_admin_delete" ON caregiver_patient
FOR DELETE TO authenticated
USING (auth.is_super_admin());

-- Clinic Admin pode ver vínculos da própria clínica
DROP POLICY IF EXISTS "caregiver_patient_clinic_admin_select" ON caregiver_patient;
CREATE POLICY "caregiver_patient_clinic_admin_select" ON caregiver_patient
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = caregiver_patient.patient_id
    AND p.clinic_id = auth.get_user_clinic_id()
  )
);

-- Clinic Admin pode inserir vínculos na própria clínica
DROP POLICY IF EXISTS "caregiver_patient_clinic_admin_insert" ON caregiver_patient;
CREATE POLICY "caregiver_patient_clinic_admin_insert" ON caregiver_patient
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = caregiver_patient.patient_id
    AND p.clinic_id = auth.get_user_clinic_id()
  )
);

-- Clinic Admin pode excluir vínculos da própria clínica
DROP POLICY IF EXISTS "caregiver_patient_clinic_admin_delete" ON caregiver_patient;
CREATE POLICY "caregiver_patient_clinic_admin_delete" ON caregiver_patient
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = caregiver_patient.patient_id
    AND p.clinic_id = auth.get_user_clinic_id()
  )
);

-- ============================================
-- EMERGENCY_CONTACTS
-- ============================================

-- Super Admin pode ver todos os contatos
DROP POLICY IF EXISTS "emergency_contacts_super_admin_select" ON emergency_contacts;
CREATE POLICY "emergency_contacts_super_admin_select" ON emergency_contacts
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode gerenciar contatos
DROP POLICY IF EXISTS "emergency_contacts_super_admin_all" ON emergency_contacts;
CREATE POLICY "emergency_contacts_super_admin_all" ON emergency_contacts
FOR ALL TO authenticated
USING (auth.is_super_admin());

-- Clinic Admin pode ver contatos da própria clínica
DROP POLICY IF EXISTS "emergency_contacts_clinic_admin_select" ON emergency_contacts;
CREATE POLICY "emergency_contacts_clinic_admin_select" ON emergency_contacts
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = emergency_contacts.patient_id
    AND p.clinic_id = auth.get_user_clinic_id()
  )
);

-- Clinic Admin pode gerenciar contatos da própria clínica
DROP POLICY IF EXISTS "emergency_contacts_clinic_admin_all" ON emergency_contacts;
CREATE POLICY "emergency_contacts_clinic_admin_all" ON emergency_contacts
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = emergency_contacts.patient_id
    AND p.clinic_id = auth.get_user_clinic_id()
  )
);

-- ============================================
-- CHECKLISTS
-- ============================================

-- Qualquer usuário pode ver checklists globais
DROP POLICY IF EXISTS "checklists_global_select" ON checklists;
CREATE POLICY "checklists_global_select" ON checklists
FOR SELECT TO authenticated
USING (clinic_id IS NULL);

-- Super Admin pode ver todos os checklists
DROP POLICY IF EXISTS "checklists_super_admin_select" ON checklists;
CREATE POLICY "checklists_super_admin_select" ON checklists
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode gerenciar checklists globais
DROP POLICY IF EXISTS "checklists_super_admin_all" ON checklists;
CREATE POLICY "checklists_super_admin_all" ON checklists
FOR ALL TO authenticated
USING (
  clinic_id IS NULL
  AND auth.is_super_admin()
);

-- Clinic Admin pode ver checklists da própria clínica + globais
DROP POLICY IF EXISTS "checklists_clinic_admin_select" ON checklists;
CREATE POLICY "checklists_clinic_admin_select" ON checklists
FOR SELECT TO authenticated
USING (
  clinic_id IS NULL
  OR clinic_id = auth.get_user_clinic_id()
);

-- Clinic Admin pode inserir checklists da própria clínica
DROP POLICY IF EXISTS "checklists_clinic_admin_insert" ON checklists;
CREATE POLICY "checklists_clinic_admin_insert" ON checklists
FOR INSERT TO authenticated
WITH CHECK (clinic_id = auth.get_user_clinic_id());

-- Clinic Admin pode atualizar checklists da própria clínica
DROP POLICY IF EXISTS "checklists_clinic_admin_update" ON checklists;
CREATE POLICY "checklists_clinic_admin_update" ON checklists
FOR UPDATE TO authenticated
USING (clinic_id = auth.get_user_clinic_id());

-- Clinic Admin pode excluir checklists da própria clínica
DROP POLICY IF EXISTS "checklists_clinic_admin_delete" ON checklists;
CREATE POLICY "checklists_clinic_admin_delete" ON checklists
FOR DELETE TO authenticated
USING (clinic_id = auth.get_user_clinic_id());

-- ============================================
-- CHECKLIST_ITEMS
-- ============================================

-- Qualquer usuário pode ver itens de checklists globais
DROP POLICY IF EXISTS "checklist_items_global_select" ON checklist_items;
CREATE POLICY "checklist_items_global_select" ON checklist_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND c.clinic_id IS NULL
  )
);

-- Super Admin pode ver todos os itens
DROP POLICY IF EXISTS "checklist_items_super_admin_select" ON checklist_items;
CREATE POLICY "checklist_items_super_admin_select" ON checklist_items
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode gerenciar itens de checklists globais
DROP POLICY IF EXISTS "checklist_items_super_admin_all" ON checklist_items;
CREATE POLICY "checklist_items_super_admin_all" ON checklist_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND c.clinic_id IS NULL
  )
  AND auth.is_super_admin()
);

-- Clinic Admin pode ver itens de checklists da própria clínica + globais
DROP POLICY IF EXISTS "checklist_items_clinic_admin_select" ON checklist_items;
CREATE POLICY "checklist_items_clinic_admin_select" ON checklist_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND (c.clinic_id IS NULL OR c.clinic_id = auth.get_user_clinic_id())
  )
);

-- Clinic Admin pode gerenciar itens de checklists da própria clínica
DROP POLICY IF EXISTS "checklist_items_clinic_admin_all" ON checklist_items;
CREATE POLICY "checklist_items_clinic_admin_all" ON checklist_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND c.clinic_id = auth.get_user_clinic_id()
  )
);

-- ============================================
-- SHIFTS
-- ============================================

-- Super Admin pode ver todos os turnos
DROP POLICY IF EXISTS "shifts_super_admin_select" ON shifts;
CREATE POLICY "shifts_super_admin_select" ON shifts
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode gerenciar turnos
DROP POLICY IF EXISTS "shifts_super_admin_all" ON shifts;
CREATE POLICY "shifts_super_admin_all" ON shifts
FOR ALL TO authenticated
USING (auth.is_super_admin());

-- Clinic Admin pode ver turnos da própria clínica
DROP POLICY IF EXISTS "shifts_clinic_admin_select" ON shifts;
CREATE POLICY "shifts_clinic_admin_select" ON shifts
FOR SELECT TO authenticated
USING (clinic_id = auth.get_user_clinic_id());

-- Clinic Admin pode criar turnos na própria clínica
DROP POLICY IF EXISTS "shifts_clinic_admin_insert" ON shifts;
CREATE POLICY "shifts_clinic_admin_insert" ON shifts
FOR INSERT TO authenticated
WITH CHECK (clinic_id = auth.get_user_clinic_id());

-- Clinic Admin pode atualizar turnos da própria clínica
DROP POLICY IF EXISTS "shifts_clinic_admin_update" ON shifts;
CREATE POLICY "shifts_clinic_admin_update" ON shifts
FOR UPDATE TO authenticated
USING (clinic_id = auth.get_user_clinic_id());

-- ============================================
-- SHIFT_CHECKLISTS
-- ============================================

-- Super Admin pode ver todos
DROP POLICY IF EXISTS "shift_checklists_super_admin_select" ON shift_checklists;
CREATE POLICY "shift_checklists_super_admin_select" ON shift_checklists
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode gerenciar
DROP POLICY IF EXISTS "shift_checklists_super_admin_all" ON shift_checklists;
CREATE POLICY "shift_checklists_super_admin_all" ON shift_checklists
FOR ALL TO authenticated
USING (auth.is_super_admin());

-- Clinic Admin pode ver da própria clínica
DROP POLICY IF EXISTS "shift_checklists_clinic_admin_select" ON shift_checklists;
CREATE POLICY "shift_checklists_clinic_admin_select" ON shift_checklists
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shifts s
    WHERE s.id = shift_checklists.shift_id
    AND s.clinic_id = auth.get_user_clinic_id()
  )
);

-- Clinic Admin pode gerenciar da própria clínica
DROP POLICY IF EXISTS "shift_checklists_clinic_admin_all" ON shift_checklists;
CREATE POLICY "shift_checklists_clinic_admin_all" ON shift_checklists
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shifts s
    WHERE s.id = shift_checklists.shift_id
    AND s.clinic_id = auth.get_user_clinic_id()
  )
);

-- ============================================
-- SHIFT_CHECKLIST_ITEMS
-- ============================================

-- Super Admin pode ver todos
DROP POLICY IF EXISTS "shift_checklist_items_super_admin_select" ON shift_checklist_items;
CREATE POLICY "shift_checklist_items_super_admin_select" ON shift_checklist_items
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode gerenciar
DROP POLICY IF EXISTS "shift_checklist_items_super_admin_all" ON shift_checklist_items;
CREATE POLICY "shift_checklist_items_super_admin_all" ON shift_checklist_items
FOR ALL TO authenticated
USING (auth.is_super_admin());

-- Clinic Admin pode ver da própria clínica
DROP POLICY IF EXISTS "shift_checklist_items_clinic_admin_select" ON shift_checklist_items;
CREATE POLICY "shift_checklist_items_clinic_admin_select" ON shift_checklist_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shift_checklists sc
    JOIN shifts s ON s.id = sc.shift_id
    WHERE sc.id = shift_checklist_items.shift_checklist_id
    AND s.clinic_id = auth.get_user_clinic_id()
  )
);

-- Clinic Admin pode gerenciar da própria clínica
DROP POLICY IF EXISTS "shift_checklist_items_clinic_admin_all" ON shift_checklist_items;
CREATE POLICY "shift_checklist_items_clinic_admin_all" ON shift_checklist_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shift_checklists sc
    JOIN shifts s ON s.id = sc.shift_id
    WHERE sc.id = shift_checklist_items.shift_checklist_id
    AND s.clinic_id = auth.get_user_clinic_id()
  )
);

-- ============================================
-- SOS_ALERTS
-- ============================================

-- Super Admin pode ver todos os alertas
DROP POLICY IF EXISTS "sos_alerts_super_admin_select" ON sos_alerts;
CREATE POLICY "sos_alerts_super_admin_select" ON sos_alerts
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode gerenciar alertas
DROP POLICY IF EXISTS "sos_alerts_super_admin_all" ON sos_alerts;
CREATE POLICY "sos_alerts_super_admin_all" ON sos_alerts
FOR ALL TO authenticated
USING (auth.is_super_admin());

-- Cuidador pode ver alertas que ele acionou
DROP POLICY IF EXISTS "sos_alerts_caregiver_select" ON sos_alerts;
CREATE POLICY "sos_alerts_caregiver_select" ON sos_alerts
FOR SELECT TO authenticated
USING (triggered_by = auth.uid());

-- Cuidador pode inserir alertas
DROP POLICY IF EXISTS "sos_alerts_caregiver_insert" ON sos_alerts;
CREATE POLICY "sos_alerts_caregiver_insert" ON sos_alerts
FOR INSERT TO authenticated
WITH CHECK (triggered_by = auth.uid());

-- Cuidador pode atualizar alertas que ele acionou
DROP POLICY IF EXISTS "sos_alerts_caregiver_update" ON sos_alerts;
CREATE POLICY "sos_alerts_caregiver_update" ON sos_alerts
FOR UPDATE TO authenticated
USING (triggered_by = auth.uid());

-- Clinic Admin pode ver alertas da própria clínica
DROP POLICY IF EXISTS "sos_alerts_clinic_admin_select" ON sos_alerts;
CREATE POLICY "sos_alerts_clinic_admin_select" ON sos_alerts
FOR SELECT TO authenticated
USING (clinic_id = auth.get_user_clinic_id());

-- Clinic Admin pode atualizar alertas da própria clínica
DROP POLICY IF EXISTS "sos_alerts_clinic_admin_update" ON sos_alerts;
CREATE POLICY "sos_alerts_clinic_admin_update" ON sos_alerts
FOR UPDATE TO authenticated
USING (clinic_id = auth.get_user_clinic_id());

-- ============================================
-- SOS_NOTIFICATIONS
-- ============================================

-- Super Admin pode ver todas as notificações
DROP POLICY IF EXISTS "sos_notifications_super_admin_select" ON sos_notifications;
CREATE POLICY "sos_notifications_super_admin_select" ON sos_notifications
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode gerenciar notificações
DROP POLICY IF EXISTS "sos_notifications_super_admin_all" ON sos_notifications;
CREATE POLICY "sos_notifications_super_admin_all" ON sos_notifications
FOR ALL TO authenticated
USING (auth.is_super_admin());

-- Clinic Admin pode ver notificações da própria clínica
DROP POLICY IF EXISTS "sos_notifications_clinic_admin_select" ON sos_notifications;
CREATE POLICY "sos_notifications_clinic_admin_select" ON sos_notifications
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sos_alerts sa
    WHERE sa.id = sos_notifications.sos_alert_id
    AND sa.clinic_id = auth.get_user_clinic_id()
  )
);

-- Clinic Admin pode atualizar notificações da própria clínica
DROP POLICY IF EXISTS "sos_notifications_clinic_admin_update" ON sos_notifications;
CREATE POLICY "sos_notifications_clinic_admin_update" ON sos_notifications
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sos_alerts sa
    WHERE sa.id = sos_notifications.sos_alert_id
    AND sa.clinic_id = auth.get_user_clinic_id()
  )
);

-- ============================================
-- AUDIT_LOGS
-- ============================================

-- Super Admin pode ver todos os logs
DROP POLICY IF EXISTS "audit_logs_super_admin_select" ON audit_logs;
CREATE POLICY "audit_logs_super_admin_select" ON audit_logs
FOR SELECT TO authenticated
USING (auth.is_super_admin());

-- Qualquer usuário pode inserir logs (via trigger)
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
CREATE POLICY "audit_logs_insert" ON audit_logs
FOR INSERT TO authenticated
WITH CHECK (true);

-- ============================================
-- PLANS, SHIFT_CATEGORIES, ALERT_THRESHOLDS
-- ============================================

-- Super Admin pode gerenciar planos
DROP POLICY IF EXISTS "plans_super_admin_select" ON plans;
CREATE POLICY "plans_super_admin_select" ON plans
FOR SELECT TO authenticated
USING (auth.is_super_admin());

DROP POLICY IF EXISTS "plans_super_admin_all" ON plans;
CREATE POLICY "plans_super_admin_all" ON plans
FOR ALL TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode gerenciar categorias de turno
DROP POLICY IF EXISTS "shift_categories_super_admin_select" ON shift_categories;
CREATE POLICY "shift_categories_super_admin_select" ON shift_categories
FOR SELECT TO authenticated
USING (auth.is_super_admin());

DROP POLICY IF EXISTS "shift_categories_super_admin_all" ON shift_categories;
CREATE POLICY "shift_categories_super_admin_all" ON shift_categories
FOR ALL TO authenticated
USING (auth.is_super_admin());

-- Super Admin pode gerenciar limites de alertas
DROP POLICY IF EXISTS "alert_thresholds_super_admin_select" ON alert_thresholds;
CREATE POLICY "alert_thresholds_super_admin_select" ON alert_thresholds
FOR SELECT TO authenticated
USING (auth.is_super_admin());

DROP POLICY IF EXISTS "alert_thresholds_super_admin_all" ON alert_thresholds;
CREATE POLICY "alert_thresholds_super_admin_all" ON alert_thresholds
FOR ALL TO authenticated
USING (auth.is_super_admin());

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar todas as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Para testar o isolamento:
-- 1. Faça login como usuário de uma clínica
-- 2. Tente acessar dados de outra clínica
-- 3. Deve retornar erro ou dados vazios
