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
```