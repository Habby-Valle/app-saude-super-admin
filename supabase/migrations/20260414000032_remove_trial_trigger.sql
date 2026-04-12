-- Remover trigger automático de Trial
-- Agora o plano será gerenciado exclusivamente pelo código

-- 1. Remover trigger
DROP TRIGGER IF EXISTS clinic_trials_trigger ON clinics;

-- 2. Confirmar
SELECT 'Trigger removido com sucesso' as result;
