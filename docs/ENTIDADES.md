# Entidades do Banco de Dados — App Saúde

---

## Relacionamentos

### Clínica (clinics)
```
clinics "1" ──── "N" users
clinics "1" ──── "N" patients
clinics "1" ──── "N" checklists
clinics "1" ──── "N" shifts
clinics "1" ──── "N" sos_alerts
```

### Usuários (users)
```
users "1" ──── "N" caregiver_patient (como cuidador)
users "1" ──── "N" emergency_contacts
users "1" ──── "N" shifts (como cuidador)
users "1" ──── "N" sos_alerts (como quem disparou)
users "1" ──── "N" sos_notifications
users "1" ──── "N" audit_logs
users "1" ──── "N" user_consents
```

### Pacientes (patients)
```
patients "1" ──── "N" caregiver_patient
patients "1" ──── "N" emergency_contacts
patients "1" ──── "N" shifts
patients "1" ──── "N" sos_alerts
```

### Checklists
```
checklists "1" ──── "N" checklist_items
checklist_items "1" ──── "N" checklist_item_options
checklists "1" ──── "N" shift_checklists
```

### Turnos e Execução
```
shifts "1" ──── "N" shift_checklists
shift_checklists "1" ──── "N" shift_checklist_items
checklist_items "1" ──── "N" shift_checklist_items
checklist_item_options "1" ──── "N" shift_checklist_items
```

### SOS
```
sos_alerts "1" ──── "N" sos_notifications
```

---

## clinics

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `name` | string | Nome da clínica |
| `cnpj` | string | CNPJ da clínica |
| `created_at` | timestamp | Data de criação |

---

## users

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `clinic_id` | uuid | FK → clinics.id (NULL = super_admin) |
| `name` | string | Nome completo |
| `email` | string | Email do usuário |
| `password` | string | Senha (hash) |
| `role` | string | Papél: super_admin, clinic_admin, caregiver, family, emergency_contact |
| `created_at` | timestamp | Data de criação |

---

## patients

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `clinic_id` | uuid | FK → clinics.id |
| `contractor_id` | uuid | FK → users.id (responsável contratante) |
| `name` | string | Nome do paciente |
| `birth_date` | date | Data de nascimento |
| `created_at` | timestamp | Data de criação |

---

## caregiver_patient

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `caregiver_id` | uuid | FK → users.id (cuidador) |
| `patient_id` | uuid | FK → patients.id (paciente) |

---

## emergency_contacts

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `patient_id` | uuid | FK → patients.id |
| `user_id` | uuid | FK → users.id (contato de emergência) |
| `priority` | int | Prioridade de contato (1, 2, 3...) |

---

## checklists

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `clinic_id` | uuid | FK → clinics.id (NULL = template global) |
| `name` | string | Nome do checklist |
| `icon` | string | Ícone do checklist |
| `order` | int | Ordem de exibição |

---

## checklist_items

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `checklist_id` | uuid | FK → checklists.id |
| `name` | string | Nome do item |
| `type` | string | Tipo do item (text, select, boolean...) |
| `required` | boolean | Se é obrigatório |
| `has_observation` | boolean | Se permite observação |

---

## checklist_item_options

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `checklist_item_id` | uuid | FK → checklist_items.id |
| `label` | string | Label visível |
| `value` | string | Valor armazenado |

---

## shifts

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `clinic_id` | uuid | FK → clinics.id |
| `patient_id` | uuid | FK → patients.id |
| `caregiver_id` | uuid | FK → users.id (cuidador) |
| `started_at` | timestamp | Início do turno |
| `ended_at` | timestamp | Fim do turno |
| `status` | string | Status: scheduled, in_progress, completed, cancelled |

---

## shift_checklists

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `shift_id` | uuid | FK → shifts.id |
| `checklist_id` | uuid | FK → checklists.id |
| `status` | string | Status: pending, in_progress, completed |
| `observation` | text | Observação geral |

---

## shift_checklist_items

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `shift_checklist_id` | uuid | FK → shift_checklists.id |
| `checklist_item_id` | uuid | FK → checklist_items.id |
| `value` | string | Valor respondido |
| `option_id` | uuid | FK → checklist_item_options.id (opção selecionada) |
| `observation` | text | Observação do item |

---

## sos_alerts

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `patient_id` | uuid | FK → patients.id |
| `triggered_by` | uuid | FK → users.id (quem disparou) |
| `clinic_id` | uuid | FK → clinics.id |
| `status` | string | Status: active, acknowledged, resolved |
| `location_lat` | decimal | Latitude (localização) |
| `location_lng` | decimal | Longitude (localização) |
| `notes` | text | Notas do alerta |
| `acknowledged_by` | uuid | FK → users.id (quem confirmou) |
| `resolved_at` | timestamp | Data de resolução |
| `created_at` | timestamp | Data de criação |

---

## sos_notifications

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `sos_alert_id` | uuid | FK → sos_alerts.id |
| `user_id` | uuid | FK → users.id (destinatário) |
| `channel` | string | Canal: push, email, sms |
| `recipient` | string | Destinatário (email, telefone) |
| `status` | string | Status: pending, sent, delivered, failed |
| `sent_at` | timestamp | Data de envio |
| `created_at` | timestamp | Data de criação |

---

## audit_logs

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `user_id` | uuid | FK → users.id |
| `clinic_id` | uuid | FK → clinics.id |
| `action` | string | Ação realizada |
| `entity_type` | string | Tipo de entidade afetada |
| `entity_id` | uuid | ID da entidade afetada |
| `old_values` | jsonb | Valores anteriores |
| `new_values` | jsonb | Novos valores |
| `ip_address` | string | IP do usuário |
| `created_at` | timestamp | Data da ação |

---

## user_consents

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `user_id` | uuid | FK → users.id |
| `consent_type` | string | Tipo de consentimento |
| `granted` | boolean | Se consentiu |
| `granted_at` | timestamp | Data do consentimento |
| `ip_address` | string | IP no momento do consentimento |
| `created_at` | timestamp | Data de criação |

---

## data_retention_policies

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK — Identificador único |
| `entity_type` | string | Tipo de entidade |
| `retention_days` | int | Dias de retenção |
| `action` | string | Ação: delete, anonymize, archive |
| `created_at` | timestamp | Data de criação |

---

## Índice de Entidades

| Entidade | Descrição |
|----------|-----------|
| `clinics` | Clínicas cadastradas |
| `users` | Usuários do sistema |
| `patients` | Pacientes |
| `caregiver_patient` | Relação cuidador-paciente (N:N) |
| `emergency_contacts` | Contatos de emergência |
| `checklists` | Templates de checklists |
| `checklist_items` | Itens de checklist |
| `checklist_item_options` | Opções de itens de checklist |
| `shifts` | Turnos de trabalho |
| `shift_checklists` | Checklists executados em turnos |
| `shift_checklist_items` | Itens respondidos em turnos |
| `sos_alerts` | Alertas de emergência |
| `sos_notifications` | Notificações de SOS |
| `audit_logs` | Logs de auditoria |
| `user_consents` | Consentimentos de usuários |
| `data_retention_policies` | Políticas de retenção de dados |
