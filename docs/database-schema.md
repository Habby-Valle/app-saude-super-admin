```erDiagram

%% =========================
%% CLINICAS
%% =========================

clinics {
  uuid id PK
  string name
  string cnpj
  timestamp created_at
}

%% =========================
%% USUÁRIOS
%% =========================

users {
  uuid id PK
  uuid clinic_id FK
  string name
  string email
  string password
  string role
  timestamp created_at
}

%% =========================
%% PACIENTES
%% =========================

patients {
  uuid id PK
  uuid clinic_id FK
  uuid contractor_id FK
  string name
  date birth_date
  timestamp created_at
}

%% =========================
%% RELAÇÕES
%% =========================

caregiver_patient {
  uuid id PK
  uuid caregiver_id FK
  uuid patient_id FK
}

emergency_contacts {
  uuid id PK
  uuid patient_id FK
  uuid user_id FK
  int priority
}

%% =========================
%% CHECKLIST (TEMPLATE)
%% =========================

checklists {
  uuid id PK
  uuid clinic_id FK
  string name
  string icon
  int order
}

checklist_items {
  uuid id PK
  uuid checklist_id FK
  string name
  string type
  boolean required
  boolean has_observation
}

checklist_item_options {
  uuid id PK
  uuid checklist_item_id FK
  string label
  string value
}

%% =========================
%% TURNOS
%% =========================

shifts {
  uuid id PK
  uuid clinic_id FK
  uuid patient_id FK
  uuid caregiver_id FK
  timestamp started_at
  timestamp ended_at
  string status
}

%% =========================
%% EXECUÇÃO
%% =========================

shift_checklists {
  uuid id PK
  uuid shift_id FK
  uuid checklist_id FK
  string status
  text observation
}

shift_checklist_items {
  uuid id PK
  uuid shift_checklist_id FK
  uuid checklist_item_id FK
  string value
  uuid option_id FK
  text observation
}

%% =========================
%% SISTEMA SOS
%% =========================

sos_alerts {
  uuid id PK
  uuid patient_id FK
  uuid triggered_by FK
  uuid clinic_id FK
  string status "active|acknowledged|resolved"
  decimal location_lat
  decimal location_lng
  text notes
  uuid acknowledged_by FK
  timestamp resolved_at
  timestamp created_at
}

sos_notifications {
  uuid id PK
  uuid sos_alert_id FK
  uuid user_id FK
  string channel "push|email|sms"
  string recipient
  string status "pending|sent|delivered|failed"
  timestamp sent_at
  timestamp created_at
}

%% =========================
%% PLANOS E BENEFÍCIOS
%% =========================

plans {
  uuid id PK
  string name
  text description
  decimal price
  string billing_cycle "monthly|quarterly|annual"
  boolean is_active
  jsonb features
  int max_users
  int max_patients
  int max_storage
  int sort_order
  timestamptz created_at
  timestamptz updated_at
}

plan_benefits {
  uuid id PK
  string name
  string code
  string category "feature|limit|addon|integration"
  string icon
  boolean is_active
  timestamptz created_at
}

plan_benefit_relations {
  uuid id PK
  uuid plan_id FK
  uuid benefit_id FK
  boolean is_enabled
  timestamptz created_at
}

clinic_plans {
  uuid id PK
  uuid clinic_id FK
  uuid plan_id FK
  string status "trial|active|expired|cancelled"
  timestamptz started_at
  timestamptz expires_at
  timestamptz trial_ends_at
  timestamptz created_at
  timestamptz updated_at
}

clinic_plan_benefits {
  uuid id PK
  uuid clinic_plan_id FK
  uuid benefit_id FK
  boolean is_enabled
  timestamptz created_at
  timestamptz updated_at
}

user_benefits {
  uuid id PK
  uuid user_id FK
  uuid benefit_id FK
  boolean is_enabled
  timestamptz expires_at
  uuid granted_by FK
  timestamptz created_at
  timestamptz updated_at
}

%% =========================
%% RELACIONAMENTOS PLANOS
%% =========================

plans ||--o{ plan_benefit_relations : "benefícios"
plan_benefits ||--o{ plan_benefit_relations : "planos"
plan_benefits ||--o{ clinic_plan_benefits : "benefícios clínica"
plan_benefits ||--o{ user_benefits : "benefícios usuário"

clinics ||--o{ clinic_plans : "plano ativo"
plans ||--o{ clinic_plans : "assinatura"
clinic_plans ||--o{ clinic_plan_benefits : "benefícios customizados"

users ||--o{ user_benefits : "benefícios pessoais"

%% =========================
%% RELACIONAMENTOS
%% =========================

%% Clínica
clinics ||--o{ users : "has"
clinics ||--o{ patients : "has"
clinics ||--o{ checklists : "has"
clinics ||--o{ shifts : "has"

%% Usuários
users ||--o{ caregiver_patient : "caregiver"
patients ||--o{ caregiver_patient : "patient"

users ||--o{ emergency_contacts : "contact"
patients ||--o{ emergency_contacts : "has"

users ||--o{ shifts : "creates"
patients ||--o{ shifts : "has"

%% Checklist
checklists ||--o{ checklist_items : "has"
checklist_items ||--o{ checklist_item_options : "has"

%% Execução
shifts ||--o{ shift_checklists : "has"
checklists ||--o{ shift_checklists : "used"

shift_checklists ||--o{ shift_checklist_items : "has"
checklist_items ||--o{ shift_checklist_items : "answered"

checklist_item_options ||--o{ shift_checklist_items : "selected"

%% SOS
patients ||--o{ sos_alerts : "triggers"
users ||--o{ sos_alerts : "triggers"
clinics ||--o{ sos_alerts : "has"
users ||--o{ sos_alerts : "acknowledges"

sos_alerts ||--o{ sos_notifications : "has"
users ||--o{ sos_notifications : "receives"
```
