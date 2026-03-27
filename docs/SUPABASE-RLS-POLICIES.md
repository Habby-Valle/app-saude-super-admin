# Supabase RLS Policies - App Saúde

> Políticas de Row-Level Security para multi-tenant (Clinic Admin e Super Admin)

## Tabelas Incluídas

1. [clinics](#clinics)
2. [users](#users)
3. [patients](#patients)
4. [caregiver_patient](#caregiver_patient)
5. [emergency_contacts](#emergency_contacts)
6. [checklists](#checklists)
7. [checklist_items](#checklist_items)
8. [shifts](#shifts)
9. [shift_checklists](#shift_checklists)
10. [shift_checklist_items](#shift_checklist_items)
11. [sos_alerts](#sos_alerts)
12. [sos_notifications](#sos_notifications)
13. [audit_logs](#audit_logs)

---

## 🚀 Script de Correção Rápida

Se você está tendo erros como:

- "new row violates row-level security policy for table..."
- Login não funciona
- Dados não aparecem

**Copie e cole este script COMPLETO no Supabase SQL Editor:**

```sql
-- ============================================
-- SCRIPT COMPLETO DE POLÍTICAS RLS
-- Execute TODO este bloco de uma vez
-- ============================================

-- 1. USERS - Permissão básica
DROP POLICY IF EXISTS "users_basic_select" ON users;
CREATE POLICY "users_basic_select" ON users FOR SELECT TO authenticated USING (true);

-- 2. PATIENTS - Permissão básica
DROP POLICY IF EXISTS "patients_basic_select" ON patients;
CREATE POLICY "patients_basic_select" ON patients FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "patients_basic_insert" ON patients;
CREATE POLICY "patients_basic_insert" ON patients FOR INSERT TO authenticated WITH CHECK (true);

-- 3. CAREGIVER_PATIENT - Vínculos
DROP POLICY IF EXISTS "caregiver_patient_basic_select" ON caregiver_patient;
CREATE POLICY "caregiver_patient_basic_select" ON caregiver_patient FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "caregiver_patient_basic_insert" ON caregiver_patient;
CREATE POLICY "caregiver_patient_basic_insert" ON caregiver_patient FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "caregiver_patient_basic_delete" ON caregiver_patient;
CREATE POLICY "caregiver_patient_basic_delete" ON caregiver_patient FOR DELETE TO authenticated USING (true);

-- 4. SHIFTS - Turnos
DROP POLICY IF EXISTS "shifts_basic_select" ON shifts;
CREATE POLICY "shifts_basic_select" ON shifts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "shifts_basic_insert" ON shifts;
CREATE POLICY "shifts_basic_insert" ON shifts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "shifts_basic_update" ON shifts;
CREATE POLICY "shifts_basic_update" ON shifts FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "shifts_basic_delete" ON shifts;
CREATE POLICY "shifts_basic_delete" ON shifts FOR DELETE TO authenticated USING (true);

-- 5. SHIFT_CHECKLISTS
DROP POLICY IF EXISTS "shift_checklists_basic_select" ON shift_checklists;
CREATE POLICY "shift_checklists_basic_select" ON shift_checklists FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "shift_checklists_basic_insert" ON shift_checklists;
CREATE POLICY "shift_checklists_basic_insert" ON shift_checklists FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "shift_checklists_basic_update" ON shift_checklists;
CREATE POLICY "shift_checklists_basic_update" ON shift_checklists FOR UPDATE TO authenticated USING (true);

-- 6. SHIFT_CHECKLIST_ITEMS
DROP POLICY IF EXISTS "shift_checklist_items_basic_select" ON shift_checklist_items;
CREATE POLICY "shift_checklist_items_basic_select" ON shift_checklist_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "shift_checklist_items_basic_insert" ON shift_checklist_items;
CREATE POLICY "shift_checklist_items_basic_insert" ON shift_checklist_items FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "shift_checklist_items_basic_update" ON shift_checklist_items;
CREATE POLICY "shift_checklist_items_basic_update" ON shift_checklist_items FOR UPDATE TO authenticated USING (true);

-- 7. CHECKLISTS
DROP POLICY IF EXISTS "checklists_basic_select" ON checklists;
CREATE POLICY "checklists_basic_select" ON checklists FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "checklists_basic_insert" ON checklists;
CREATE POLICY "checklists_basic_insert" ON checklists FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "checklists_basic_update" ON checklists;
CREATE POLICY "checklists_basic_update" ON checklists FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "checklists_basic_delete" ON checklists;
CREATE POLICY "checklists_basic_delete" ON checklists FOR DELETE TO authenticated USING (true);

-- 8. CHECKLIST_ITEMS
DROP POLICY IF EXISTS "checklist_items_basic_select" ON checklist_items;
CREATE POLICY "checklist_items_basic_select" ON checklist_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "checklist_items_basic_insert" ON checklist_items;
CREATE POLICY "checklist_items_basic_insert" ON checklist_items FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "checklist_items_basic_update" ON checklist_items;
CREATE POLICY "checklist_items_basic_update" ON checklist_items FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "checklist_items_basic_delete" ON checklist_items;
CREATE POLICY "checklist_items_basic_delete" ON checklist_items FOR DELETE TO authenticated USING (true);

-- 9. SOS_ALERTS
DROP POLICY IF EXISTS "sos_alerts_basic_select" ON sos_alerts;
CREATE POLICY "sos_alerts_basic_select" ON sos_alerts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "sos_alerts_basic_insert" ON sos_alerts;
CREATE POLICY "sos_alerts_basic_insert" ON sos_alerts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sos_alerts_basic_update" ON sos_alerts;
CREATE POLICY "sos_alerts_basic_update" ON sos_alerts FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "sos_alerts_basic_delete" ON sos_alerts;
CREATE POLICY "sos_alerts_basic_delete" ON sos_alerts FOR DELETE TO authenticated USING (true);

-- 10. SOS_NOTIFICATIONS
DROP POLICY IF EXISTS "sos_notifications_basic_select" ON sos_notifications;
CREATE POLICY "sos_notifications_basic_select" ON sos_notifications FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "sos_notifications_basic_insert" ON sos_notifications;
CREATE POLICY "sos_notifications_basic_insert" ON sos_notifications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sos_notifications_basic_update" ON sos_notifications;
CREATE POLICY "sos_notifications_basic_update" ON sos_notifications FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "sos_notifications_basic_delete" ON sos_notifications;
CREATE POLICY "sos_notifications_basic_delete" ON sos_notifications FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "checklist_items_basic_delete" ON checklist_items;
CREATE POLICY "checklist_items_basic_delete" ON checklist_items FOR DELETE TO authenticated USING (true);

-- ============================================
-- FIM DO SCRIPT
-- ============================================
```

---

## ⚠️ Notas Importantes

1. **Estas são políticas PERMISSIVAS** - Permitem tudo para usuários autenticados
2. **Após testar, substitua** por políticas mais restritivas (multi-tenant)
3. **Para verificar políticas existentes:**

```sql
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

---

## Políticas por Funcionalidade

### Para login funcionar (topbar mostrar nome):

```sql
-- Usuário pode ver seu próprio perfil
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());
```

### Para Clinic Admin ver cuidadores/pacientes:

```sql
-- Clinic Admin pode ver usuários da própria clínica
CREATE POLICY "Clinic admins can view clinic users"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND u.clinic_id = users.clinic_id
  )
);

-- Clinic Admin pode ver vínculos caregiver_patient
CREATE POLICY "Clinic admins can view clinic caregiver_patient"
ON caregiver_patient
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = caregiver_patient.patient_id
  )
);

-- Clinic Admin pode inserir vínculos caregiver_patient (para criar paciente com cuidadores)
CREATE POLICY "Clinic admins can insert clinic caregiver_patient"
ON caregiver_patient
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = caregiver_patient.patient_id
  )
);

-- Clinic Admin: pode deletar vínculos caregiver_patient
CREATE POLICY "Clinic admins can delete clinic caregiver_patient"
ON caregiver_patient
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = caregiver_patient.patient_id
  )
);
```

---

## clinics

```sql
-- Super Admin: pode ver todas as clínicas
CREATE POLICY "Super admins can view all clinics"
ON clinics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode inserir clínicas
CREATE POLICY "Super admins can insert clinics"
ON clinics
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode atualizar clínicas
CREATE POLICY "Super admins can update clinics"
ON clinics
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode excluir clínicas
CREATE POLICY "Super admins can delete clinics"
ON clinics
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);
```

---

## users

```sql
-- Super Admin: pode ver todos os usuários
CREATE POLICY "Super admins can view all users"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'super_admin'
  )
);

-- Super Admin: pode inserir usuários
CREATE POLICY "Super admins can insert users"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'super_admin'
  )
);

-- Super Admin: pode atualizar usuários
CREATE POLICY "Super admins can update users"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'super_admin'
  )
);

-- Super Admin: pode excluir usuários
CREATE POLICY "Super admins can delete users"
ON users
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'super_admin'
  )
);

-- Clinic Admin: pode ver usuários da própria clínica
CREATE POLICY "Clinic admins can view clinic users"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('clinic_admin', 'super_admin')
    AND (
      u.role = 'super_admin'
      OR u.clinic_id = users.clinic_id
    )
  )
);

-- Clinic Admin: pode atualizar usuários da própria clínica (exceto super_admin)
CREATE POLICY "Clinic admins can update clinic users"
ON users
FOR UPDATE
TO authenticated
USING (
  users.role != 'super_admin'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND u.clinic_id = users.clinic_id
  )
);

-- Usuário pode ver seu próprio perfil (necessário para topbar)
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Usuário pode atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

---

## patients

```sql
-- Super Admin: pode ver todos os pacientes
CREATE POLICY "Super admins can view all patients"
ON patients
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode inserir pacientes
CREATE POLICY "Super admins can insert patients"
ON patients
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode atualizar pacientes
CREATE POLICY "Super admins can update patients"
ON patients
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode excluir pacientes
CREATE POLICY "Super admins can delete patients"
ON patients
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Clinic Admin: pode ver pacientes da própria clínica
CREATE POLICY "Clinic admins can view clinic patients"
ON patients
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = patients.clinic_id
  )
);

-- Clinic Admin: pode inserir pacientes na própria clínica
CREATE POLICY "Clinic admins can insert clinic patients"
ON patients
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = patients.clinic_id
  )
);

-- Clinic Admin: pode atualizar pacientes da própria clínica
CREATE POLICY "Clinic admins can update clinic patients"
ON patients
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = patients.clinic_id
  )
);

-- Clinic Admin: pode excluir pacientes da própria clínica
CREATE POLICY "Clinic admins can delete clinic patients"
ON patients
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = patients.clinic_id
  )
);
```

---

## caregiver_patient

```sql
-- Super Admin: pode ver todos os vínculos
CREATE POLICY "Super admins can view all caregiver_patient"
ON caregiver_patient
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode inserir vínculos
CREATE POLICY "Super admins can insert caregiver_patient"
ON caregiver_patient
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode excluir vínculos
CREATE POLICY "Super admins can delete caregiver_patient"
ON caregiver_patient
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Clinic Admin: pode ver vínculos da própria clínica
CREATE POLICY "Clinic admins can view clinic caregiver_patient"
ON caregiver_patient
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = caregiver_patient.patient_id
  )
);

-- Clinic Admin: pode inserir vínculos na própria clínica
CREATE POLICY "Clinic admins can insert clinic caregiver_patient"
ON caregiver_patient
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = caregiver_patient.patient_id
  )
);

-- Clinic Admin: pode excluir vínculos da própria clínica
CREATE POLICY "Clinic admins can delete clinic caregiver_patient"
ON caregiver_patient
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = caregiver_patient.patient_id
  )
);
```

---

## emergency_contacts

```sql
-- Super Admin: pode ver todos os contatos
CREATE POLICY "Super admins can view all emergency_contacts"
ON emergency_contacts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode inserir contatos
CREATE POLICY "Super admins can insert emergency_contacts"
ON emergency_contacts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode atualizar contatos
CREATE POLICY "Super admins can update emergency_contacts"
ON emergency_contacts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode excluir contatos
CREATE POLICY "Super admins can delete emergency_contacts"
ON emergency_contacts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Clinic Admin: pode ver contatos da própria clínica
CREATE POLICY "Clinic admins can view clinic emergency_contacts"
ON emergency_contacts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = emergency_contacts.patient_id
  )
);

-- Clinic Admin: pode gerenciar contatos da própria clínica
CREATE POLICY "Clinic admins can manage clinic emergency_contacts"
ON emergency_contacts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = emergency_contacts.patient_id
  )
);
```

---

## checklists

```sql
-- Super Admin: pode ver todos os checklists
CREATE POLICY "Super admins can view all checklists"
ON checklists
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode gerenciar checklists globais
CREATE POLICY "Super admins can manage global checklists"
ON checklists
FOR ALL
TO authenticated
USING (
  clinic_id IS NULL
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Qualquer um: pode ver checklists globais (clinic_id = null)
CREATE POLICY "Anyone can view global checklists"
ON checklists
FOR SELECT
TO authenticated
USING (clinic_id IS NULL);

-- Clinic Admin: pode ver checklists da própria clínica
CREATE POLICY "Clinic admins can view clinic checklists"
ON checklists
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = checklists.clinic_id
  )
);

-- Clinic Admin: pode criar checklists da própria clínica
CREATE POLICY "Clinic admins can insert clinic checklists"
ON checklists
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = checklists.clinic_id
  )
);

-- Clinic Admin: pode atualizar checklists da própria clínica
CREATE POLICY "Clinic admins can update clinic checklists"
ON checklists
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = checklists.clinic_id
  )
);

-- Clinic Admin: pode excluir checklists da própria clínica
CREATE POLICY "Clinic admins can delete clinic checklists"
ON checklists
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = checklists.clinic_id
  )
);
```

---

## checklist_items

```sql
-- Super Admin: pode ver todos os itens
CREATE POLICY "Super admins can view all checklist_items"
ON checklist_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode gerenciar todos os itens
CREATE POLICY "Super admins can manage all checklist_items"
ON checklist_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Qualquer um: pode ver itens de checklists globais
CREATE POLICY "Anyone can view items of global checklists"
ON checklist_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND c.clinic_id IS NULL
  )
);

-- Clinic Admin: pode ver itens de checklists da própria clínica
CREATE POLICY "Clinic admins can view checklist_items"
ON checklist_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND (
      c.clinic_id IS NULL
      OR c.clinic_id = (
        SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'clinic_admin'
      )
    )
  )
);

-- Clinic Admin: pode inserir itens em checklists da própria clínica
CREATE POLICY "Clinic admins can insert checklist_items"
ON checklist_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND c.clinic_id = (
      SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'clinic_admin'
    )
  )
);

-- Clinic Admin: pode atualizar itens de checklists da própria clínica
CREATE POLICY "Clinic admins can update checklist_items"
ON checklist_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND c.clinic_id = (
      SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'clinic_admin'
    )
  )
);

-- Clinic Admin: pode excluir itens de checklists da própria clínica
CREATE POLICY "Clinic admins can delete checklist_items"
ON checklist_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND c.clinic_id = (
      SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'clinic_admin'
    )
  )
);
```

---

## shifts

```sql
-- Super Admin: pode ver todos os turnos
CREATE POLICY "Super admins can view all shifts"
ON shifts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode gerenciar turnos
CREATE POLICY "Super admins can manage shifts"
ON shifts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Clinic Admin: pode ver turnos da própria clínica
CREATE POLICY "Clinic admins can view clinic shifts"
ON shifts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = shifts.clinic_id
  )
);

-- Clinic Admin: pode criar turnos na própria clínica
CREATE POLICY "Clinic admins can insert clinic shifts"
ON shifts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = shifts.clinic_id
  )
);

-- Clinic Admin: pode atualizar turnos da própria clínica
CREATE POLICY "Clinic admins can update clinic shifts"
ON shifts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = shifts.clinic_id
  )
);
```

---

## shift_checklists

```sql
-- Super Admin: pode ver todos
CREATE POLICY "Super admins can view all shift_checklists"
ON shift_checklists
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode gerenciar
CREATE POLICY "Super admins can manage shift_checklists"
ON shift_checklists
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Clinic Admin: pode ver da própria clínica
CREATE POLICY "Clinic admins can view clinic shift_checklists"
ON shift_checklists
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN shifts s ON s.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND s.id = shift_checklists.shift_id
  )
);

-- Clinic Admin: pode gerenciar da própria clínica
CREATE POLICY "Clinic admins can manage clinic shift_checklists"
ON shift_checklists
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN shifts s ON s.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND s.id = shift_checklists.shift_id
  )
);
```

---

## shift_checklist_items

```sql
-- Super Admin: pode ver todos
CREATE POLICY "Super admins can view all shift_checklist_items"
ON shift_checklist_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode gerenciar
CREATE POLICY "Super admins can manage shift_checklist_items"
ON shift_checklist_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Clinic Admin: pode ver da própria clínica
CREATE POLICY "Clinic admins can view clinic shift_checklist_items"
ON shift_checklist_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN shifts s ON s.clinic_id = u.clinic_id
    JOIN shift_checklists sc ON sc.shift_id = s.id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sc.id = shift_checklist_items.shift_checklist_id
  )
);

-- Clinic Admin: pode gerenciar da própria clínica
CREATE POLICY "Clinic admins can manage clinic shift_checklist_items"
ON shift_checklist_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN shifts s ON s.clinic_id = u.clinic_id
    JOIN shift_checklists sc ON sc.shift_id = s.id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sc.id = shift_checklist_items.shift_checklist_id
  )
);
```

---

## sos_alerts

```sql
-- Super Admin: pode ver todos os alertas
CREATE POLICY "Super admins can view all sos_alerts"
ON sos_alerts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode gerenciar alertas
CREATE POLICY "Super admins can manage sos_alerts"
ON sos_alerts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Clinic Admin: pode ver alertas da própria clínica
CREATE POLICY "Clinic admins can view clinic sos_alerts"
ON sos_alerts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = sos_alerts.clinic_id
  )
);

-- Clinic Admin: pode atualizar alertas da própria clínica
CREATE POLICY "Clinic admins can update clinic sos_alerts"
ON sos_alerts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = sos_alerts.clinic_id
  )
);
```

---

## sos_notifications

```sql
-- Super Admin: pode ver todas as notificações
CREATE POLICY "Super admins can view all sos_notifications"
ON sos_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode gerenciar notificações
CREATE POLICY "Super admins can manage sos_notifications"
ON sos_notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Clinic Admin: pode ver notificações da própria clínica
CREATE POLICY "Clinic admins can view clinic sos_notifications"
ON sos_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN sos_alerts sa ON sa.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sa.id = sos_notifications.sos_alert_id
  )
);

-- Clinic Admin: pode atualizar notificações da própria clínica
CREATE POLICY "Clinic admins can update clinic sos_notifications"
ON sos_notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN sos_alerts sa ON sa.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sa.id = sos_notifications.sos_alert_id
  )
);
```

---

## audit_logs

```sql
-- Super Admin: pode ver todos os logs
CREATE POLICY "Super admins can view all audit_logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Qualquer usuário autenticado: pode inserir logs (via trigger)
CREATE POLICY "Anyone can insert audit_logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

## Script Completo (copiar e colar no Supabase SQL Editor)

```sql
-- ============================================
-- App Saúde - RLS Policies
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- ============================================
-- clinics
-- ============================================
CREATE POLICY "Super admins can view all clinics"
ON clinics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can insert clinics"
ON clinics
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can update clinics"
ON clinics
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete clinics"
ON clinics
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- ============================================
-- users
-- ============================================
CREATE POLICY "Super admins can view all users"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can insert users"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can update users"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete users"
ON users
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'super_admin'
  )
);

CREATE POLICY "Clinic admins can view clinic users"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('clinic_admin', 'super_admin')
    AND (
      u.role = 'super_admin'
      OR u.clinic_id = users.clinic_id
    )
  )
);

CREATE POLICY "Clinic admins can update clinic users"
ON users
FOR UPDATE
TO authenticated
USING (
  users.role != 'super_admin'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND u.clinic_id = users.clinic_id
  )
);

-- ============================================
-- patients
-- ============================================
CREATE POLICY "Super admins can view all patients"
ON patients
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can insert patients"
ON patients
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can update patients"
ON patients
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete patients"
ON patients
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Clinic admins can view clinic patients"
ON patients
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = patients.clinic_id
  )
);

CREATE POLICY "Clinic admins can insert clinic patients"
ON patients
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = patients.clinic_id
  )
);

CREATE POLICY "Clinic admins can update clinic patients"
ON patients
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = patients.clinic_id
  )
);

CREATE POLICY "Clinic admins can delete clinic patients"
ON patients
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = patients.clinic_id
  )
);

-- ============================================
-- caregiver_patient
-- ============================================
CREATE POLICY "Super admins can view all caregiver_patient"
ON caregiver_patient
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can insert caregiver_patient"
ON caregiver_patient
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete caregiver_patient"
ON caregiver_patient
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Clinic admins can view clinic caregiver_patient"
ON caregiver_patient
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = caregiver_patient.patient_id
  )
);

CREATE POLICY "Clinic admins can insert clinic caregiver_patient"
ON caregiver_patient
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = caregiver_patient.patient_id
  )
);

CREATE POLICY "Clinic admins can delete clinic caregiver_patient"
ON caregiver_patient
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = caregiver_patient.patient_id
  )
);

-- ============================================
-- emergency_contacts
-- ============================================
CREATE POLICY "Super admins can view all emergency_contacts"
ON emergency_contacts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage emergency_contacts"
ON emergency_contacts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Clinic admins can view clinic emergency_contacts"
ON emergency_contacts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = emergency_contacts.patient_id
  )
);

CREATE POLICY "Clinic admins can manage clinic emergency_contacts"
ON emergency_contacts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN patients p ON p.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND p.id = emergency_contacts.patient_id
  )
);

-- ============================================
-- checklists
-- ============================================
CREATE POLICY "Anyone can view global checklists"
ON checklists
FOR SELECT
TO authenticated
USING (clinic_id IS NULL);

CREATE POLICY "Super admins can manage global checklists"
ON checklists
FOR ALL
TO authenticated
USING (
  clinic_id IS NULL
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Clinic admins can view clinic checklists"
ON checklists
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = checklists.clinic_id
  )
);

CREATE POLICY "Clinic admins can view global checklists"
ON checklists
FOR SELECT
TO authenticated
USING (clinic_id IS NULL);

CREATE POLICY "Clinic admins can insert clinic checklists"
ON checklists
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = checklists.clinic_id
  )
);

CREATE POLICY "Clinic admins can update clinic checklists"
ON checklists
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = checklists.clinic_id
  )
);

CREATE POLICY "Clinic admins can delete clinic checklists"
ON checklists
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = checklists.clinic_id
  )
);

-- ============================================
-- checklist_items
-- ============================================
CREATE POLICY "Anyone can view items of global checklists"
ON checklist_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND c.clinic_id IS NULL
  )
);

CREATE POLICY "Super admins can manage items of global checklists"
ON checklist_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND c.clinic_id IS NULL
  )
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Clinic admins can manage items of clinic checklists"
ON checklist_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM checklists c
    WHERE c.id = checklist_items.checklist_id
    AND c.clinic_id = (
      SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'clinic_admin'
    )
  )
);

-- ============================================
-- shifts
-- ============================================
CREATE POLICY "Super admins can view all shifts"
ON shifts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage shifts"
ON shifts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Clinic admins can view clinic shifts"
ON shifts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = shifts.clinic_id
  )
);

CREATE POLICY "Clinic admins can insert clinic shifts"
ON shifts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = shifts.clinic_id
  )
);

CREATE POLICY "Clinic admins can update clinic shifts"
ON shifts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = shifts.clinic_id
  )
);

-- ============================================
-- shift_checklists
-- ============================================
CREATE POLICY "Super admins can view all shift_checklists"
ON shift_checklists
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage shift_checklists"
ON shift_checklists
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Clinic admins can view clinic shift_checklists"
ON shift_checklists
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN shifts s ON s.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND s.id = shift_checklists.shift_id
  )
);

CREATE POLICY "Clinic admins can manage clinic shift_checklists"
ON shift_checklists
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN shifts s ON s.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND s.id = shift_checklists.shift_id
  )
);

-- ============================================
-- shift_checklist_items
-- ============================================
CREATE POLICY "Super admins can view all shift_checklist_items"
ON shift_checklist_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage shift_checklist_items"
ON shift_checklist_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Clinic admins can view clinic shift_checklist_items"
ON shift_checklist_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN shifts s ON s.clinic_id = u.clinic_id
    JOIN shift_checklists sc ON sc.shift_id = s.id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sc.id = shift_checklist_items.shift_checklist_id
  )
);

CREATE POLICY "Clinic admins can manage clinic shift_checklist_items"
ON shift_checklist_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN shifts s ON s.clinic_id = u.clinic_id
    JOIN shift_checklists sc ON sc.shift_id = s.id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sc.id = shift_checklist_items.shift_checklist_id
  )
);

-- ============================================
-- sos_alerts
-- ============================================
CREATE POLICY "Super admins can view all sos_alerts"
ON sos_alerts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage sos_alerts"
ON sos_alerts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Clinic admins can view clinic sos_alerts"
ON sos_alerts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = sos_alerts.clinic_id
  )
);

CREATE POLICY "Clinic admins can update clinic sos_alerts"
ON sos_alerts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = sos_alerts.clinic_id
  )
);

-- ============================================
-- sos_notifications
-- ============================================
CREATE POLICY "Super admins can view all sos_notifications"
ON sos_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage sos_notifications"
ON sos_notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Clinic admins can view clinic sos_notifications"
ON sos_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN sos_alerts sa ON sa.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sa.id = sos_notifications.sos_alert_id
  )
);

CREATE POLICY "Clinic admins can update clinic sos_notifications"
ON sos_notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN sos_alerts sa ON sa.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sa.id = sos_notifications.sos_alert_id
  )
);

-- ============================================
-- audit_logs
-- ============================================
CREATE POLICY "Super admins can view all audit_logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

CREATE POLICY "Anyone can insert audit_logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- Fim das políticas RLS
-- ============================================
```

---

## Verificar Políticas Criadas

Após executar o SQL, você pode verificar as políticas criadas:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## Se as Tabelas Não Existirem

Se você ainda não criou as tabelas `sos_alerts` e `sos_notifications`, execute:

```sql
-- sos_alerts
CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  triggered_by UUID REFERENCES users(id) NOT NULL,
  clinic_id UUID REFERENCES clinics(id) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  notes TEXT,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- sos_notifications
CREATE TABLE IF NOT EXISTS sos_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_alert_id UUID REFERENCES sos_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  channel TEXT NOT NULL CHECK (channel IN ('push', 'email', 'sms')),
  recipient TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Correção: Usuários podem ler seu próprio perfil

```sql
-- Permitir que qualquer usuário leia seu próprio perfil
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Permitir que qualquer usuário atualize seu próprio perfil
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

---

## Script de Correção para Users

```sql
-- Primeiro, verificar se já existe a política
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

-- Deletar políticas antigas se existirem (opcional)
DELETE FROM pg_policies WHERE tablename = 'users' AND policyname LIKE '%users%';

-- Criar políticas para users
-- Qualquer usuário pode ver seu próprio perfil
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);

-- Qualquer usuário pode atualizar seu próprio perfil
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Super Admin pode ver todos
CREATE POLICY "super_admin_select_all" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- Super Admin pode fazer tudo
CREATE POLICY "super_admin_all" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- Clinic Admin pode ver usuários da própria clínica
CREATE POLICY "clinic_admin_select_clinic" ON users FOR SELECT USING (
  clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'clinic_admin')
);

-- Clinic Admin pode atualizar usuários da própria clínica (exceto super_admin)
CREATE POLICY "clinic_admin_update_clinic" ON users FOR UPDATE USING (
  role != 'super_admin' AND
  clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'clinic_admin')
) WITH CHECK (
  role != 'super_admin' AND
  clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'clinic_admin')
);
```

---

## Trigger Automático: Criar Perfil ao Criar Usuário

Execute este SQL no Supabase SQL Editor para criar um trigger que automatically insere um perfil em `public.users` quando um usuário é criado em `auth.users`.

```sql
-- 1. Criar função de trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    clinic_id,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'caregiver'),
    NEW.raw_user_meta_data->>'clinic_id',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Associar trigger ao auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
```

### O que esse trigger faz:

| auth.users campo                     | public.users campo |
| ------------------------------------ | ------------------ |
| NEW.id                               | id                 |
| NEW.email                            | email              |
| NEW.raw_user_meta_data->>'name'      | name               |
| NEW.raw_user_meta_data->>'role'      | role               |
| NEW.raw_user_meta_data->>'clinic_id' | clinic_id          |
| -                                    | status = 'active'  |

### Após criar o trigger:

Você também precisa criar o cuidador que falhou manualmente:

```sql
-- Encontrar o usuário que foi criado só no auth
SELECT id, email FROM auth.users WHERE email = 'email-do-cuidador@exemplo.com';

-- Inserir manualmente na tabela users
INSERT INTO users (id, email, name, role, clinic_id, status)
VALUES (
  'UUID-do-usuario-acima',
  'email-do-cuidador@exemplo.com',
  'Nome do Cuidador',
  'caregiver',
  'UUID-da-clinica',
  'active'
);
```

### Próximos passos:

1. Execute o trigger SQL no Supabase
2. Insira manualmente o cuidador que já foi criado
3. Teste criando um novo cuidador - o perfil será criado automaticamente

---

## sos_alerts

```sql
-- Super Admin: pode ver todos os alertas
CREATE POLICY "Super admins can view all sos_alerts"
ON sos_alerts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode gerenciar alertas
CREATE POLICY "Super admins can manage sos_alerts"
ON sos_alerts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Clinic Admin: pode ver alertas da própria clínica
CREATE POLICY "Clinic admins can view clinic sos_alerts"
ON sos_alerts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = sos_alerts.clinic_id
  )
);

-- Clinic Admin: pode inserir alertas na própria clínica
CREATE POLICY "Clinic admins can insert clinic sos_alerts"
ON sos_alerts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = sos_alerts.clinic_id
  )
);

-- Clinic Admin: pode atualizar alertas da própria clínica
CREATE POLICY "Clinic admins can update clinic sos_alerts"
ON sos_alerts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = sos_alerts.clinic_id
  )
);

-- Clinic Admin: pode excluir alertas da própria clínica
CREATE POLICY "Clinic admins can delete clinic sos_alerts"
ON sos_alerts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'clinic_admin'
    AND users.clinic_id = sos_alerts.clinic_id
  )
);
```

---

## sos_notifications

```sql
-- Super Admin: pode ver todas as notificações
CREATE POLICY "Super admins can view all sos_notifications"
ON sos_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Super Admin: pode gerenciar notificações
CREATE POLICY "Super admins can manage sos_notifications"
ON sos_notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Clinic Admin: pode ver notificações da própria clínica
CREATE POLICY "Clinic admins can view clinic sos_notifications"
ON sos_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN sos_alerts sa ON sa.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sa.id = sos_notifications.sos_alert_id
  )
);

-- Clinic Admin: pode inserir notificações na própria clínica
CREATE POLICY "Clinic admins can insert clinic sos_notifications"
ON sos_notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    JOIN sos_alerts sa ON sa.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sa.id = sos_notifications.sos_alert_id
  )
);

-- Clinic Admin: pode atualizar notificações da própria clínica
CREATE POLICY "Clinic admins can update clinic sos_notifications"
ON sos_notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN sos_alerts sa ON sa.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sa.id = sos_notifications.sos_alert_id
  )
);

-- Clinic Admin: pode excluir notificações da própria clínica
CREATE POLICY "Clinic admins can delete clinic sos_notifications"
ON sos_notifications
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN sos_alerts sa ON sa.clinic_id = u.clinic_id
    WHERE u.id = auth.uid()
    AND u.role = 'clinic_admin'
    AND sa.id = sos_notifications.sos_alert_id
  )
);
```

---

## 🔧 Correção: Login parou de funcionar

Se após criar as políticas o login parou de funcionar, execute esta correção:

```sql
-- PRIMEIRO: Delete as políticasproblemáticas
DROP POLICY IF EXISTS "Clinic admins can view clinic users" ON users;

-- SEGUNDO: Recrie com a política CORRIGIDA que permite ver seu próprio perfil
CREATE POLICY "Clinic admins can view own and clinic users"
ON users
FOR SELECT
TO authenticated
USING (
  -- Pode ver seu próprio perfil
  id = auth.uid()
  OR
  -- Super Admin pode ver tudo
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  OR
  -- Clinic Admin pode ver usuários da própria clínica
  (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'clinic_admin' LIMIT 1)
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'clinic_admin')
  )
);

-- VERIFICAÇÃO: Verificar se o RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Se rowsecurity for false, habilitar:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_patient ENABLE ROW LEVEL SECURITY;
```
