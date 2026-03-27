-- ============================================
-- App Saúde - RLS Rollback Script
-- Execute para REMOVER todas as políticas RLS
-- ============================================

-- ============================================
-- AVISO: ISSO VAI REMOVER TODAS AS POLÍTICAS RLS
-- USE APENAS PARA TESTES OU EMERGÊNCIA
-- ============================================

-- Tabelas a serem afetadas
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename IN (
            'clinics', 'users', 'patients', 'caregiver_patient',
            'emergency_contacts', 'checklists', 'checklist_items',
            'shifts', 'shift_checklists', 'shift_checklist_items',
            'sos_alerts', 'sos_notifications', 'audit_logs',
            'plans', 'shift_categories', 'alert_thresholds'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'clinics_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'clinics_super_admin_insert', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'clinics_super_admin_update', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'clinics_super_admin_delete', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'users_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'users_super_admin_insert', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'users_super_admin_update', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'users_super_admin_delete', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'users_clinic_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'users_clinic_admin_update', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'users_own_profile_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'patients_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'patients_super_admin_insert', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'patients_super_admin_update', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'patients_super_admin_delete', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'patients_clinic_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'patients_clinic_admin_insert', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'patients_clinic_admin_update', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'patients_clinic_admin_delete', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'caregiver_patient_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'caregiver_patient_super_admin_insert', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'caregiver_patient_super_admin_delete', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'caregiver_patient_clinic_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'caregiver_patient_clinic_admin_insert', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'caregiver_patient_clinic_admin_delete', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'emergency_contacts_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'emergency_contacts_super_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'emergency_contacts_clinic_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'emergency_contacts_clinic_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklists_global_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklists_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklists_super_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklists_clinic_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklists_clinic_admin_insert', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklists_clinic_admin_update', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklists_clinic_admin_delete', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklist_items_global_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklist_items_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklist_items_super_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklist_items_clinic_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'checklist_items_clinic_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shifts_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shifts_super_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shifts_clinic_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shifts_clinic_admin_insert', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shifts_clinic_admin_update', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shift_checklists_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shift_checklists_super_admin_all',_tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shift_checklists_clinic_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shift_checklists_clinic_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shift_checklist_items_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shift_checklist_items_super_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shift_checklist_items_clinic_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shift_checklist_items_clinic_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'sos_alerts_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'sos_alerts_super_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'sos_alerts_caregiver_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'sos_alerts_caregiver_insert', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'sos_alerts_caregiver_update', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'sos_alerts_clinic_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'sos_alerts_clinic_admin_update', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'sos_notifications_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'sos_notifications_super_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'sos_notifications_clinic_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'sos_notifications_clinic_admin_update', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'audit_logs_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'audit_logs_insert', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'plans_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'plans_super_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shift_categories_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'shift_categories_super_admin_all', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'alert_thresholds_super_admin_select', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'alert_thresholds_super_admin_all', tbl);
    END LOOP;
END;
$$;

-- Remover funções auxiliares
DROP FUNCTION IF EXISTS auth.is_super_admin();
DROP FUNCTION IF EXISTS auth.get_user_clinic_id();

-- Verificar políticas restantes
SELECT 
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- FIM DO ROLLBACK
-- ============================================
