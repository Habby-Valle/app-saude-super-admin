-- Limpar todas as tabelas relacionadas a clínicas
TRUNCATE TABLE shift_checklist_items, shift_checklists, shifts, 
         checklist_item_options, checklist_items, checklists, 
         caregiver_patient, emergency_contacts, 
         user_benefits, clinic_plan_benefits, clinic_plans, 
         users, patients, 
         sos_notifications, sos_alerts
CASCADE;

-- verificar o que sobrou
SELECT 'Tabelas limpas com sucesso!' as resultado;