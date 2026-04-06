# Spec - Planos e Benefícios

## 1. Visão Geral

Sistema de gestão de planos de assinatura e benefícios para o App Saúde. Permite definir diferentes planos (Trial, Basic, Premium, Enterprise), associar benefícios a cada plano, e rastrear quais benefícios estão ativos para cada clínica e usuário.

## 2. Entidades

### 2.1 Plan (plans)

Planos de assinatura disponíveis.

| Campo         | Tipo       | Descrição                              |
|---------------|------------|----------------------------------------|
| id            | uuid       | PK                                     |
| name          | text       | Nome do plano (Trial, Basic, Premium)  |
| description   | text       | Descrição do plano                     |
| price         | decimal    | Preço mensal em reais                  |
| billing_cycle | text       | monthly, quarterly, annual             |
| is_active     | boolean    | Se está disponível para contratação   |
| features      | jsonb      | Lista de features como array de strings|
| max_users     | integer    | Limite de usuários por clínica         |
| max_patients  | integer    | Limite de pacientes por clínica        |
| max_storage   | integer    | Armazenamento em GB                    |
| sort_order    | integer    | Ordem de exibição                      |
| created_at    | timestamptz|                                        |
| updated_at    | timestamptz|                                        |

### 2.2 PlanBenefit (plan_benefits)

Benefícios que podem ser associados a planos.

| Campo      | Tipo       | Descrição                         |
|------------|------------|-----------------------------------|
| id         | uuid       | PK                               |
| name       | text       | Nome do benefício                 |
| code       | text       | Código único (CHECKLIST_ADVANCED) |
| category   | text       | Categoria (feature, limit, addon) |
| icon       | text       | Ícone lucide para exibição        |
| is_active  | boolean    | Se está disponível               |
| created_at | timestamptz|                                   |

### 2.3 PlanBenefitRelation (plan_benefit_relations)

Relação many-to-many entre Plan e PlanBenefit.

| Campo        | Tipo       | Descrição            |
|--------------|------------|----------------------|
| id           | uuid       | PK                   |
| plan_id      | uuid       | FK -> plans          |
| benefit_id   | uuid       | FK -> plan_benefits  |
| is_enabled   | boolean    | Se está ativo no plano|
| created_at   | timestamptz|                      |

### 2.4 ClinicPlan (clinic_plans)

Plano ativo de cada clínica.

| Campo         | Tipo       | Descrição                           |
|---------------|------------|-------------------------------------|
| id            | uuid       | PK                                  |
| clinic_id     | uuid       | FK -> clinics                       |
| plan_id       | uuid       | FK -> plans                        |
| status        | text       | trial, active, expired, cancelled   |
| started_at    | timestamptz| Início da vigência                  |
| expires_at    | timestamptz| Fim da vigência                     |
| trial_ends_at | timestamptz| Fim do período de trial             |
| created_at    | timestamptz|                                     |
| updated_at    | timestamptz|                                     |

### 2.5 ClinicPlanBenefit (clinic_plan_benefits)

Benefícios específicos ativados/desativados para uma clínica (overrides do plano).

| Campo        | Tipo       | Descrição                      |
|--------------|------------|--------------------------------|
| id           | uuid       | PK                             |
| clinic_plan_id| uuid      | FK -> clinic_plans            |
| benefit_id   | uuid       | FK -> plan_benefits            |
| is_enabled   | boolean    | Override do plano              |
| created_at   | timestamptz|                               |
| updated_at   | timestamptz|                               |

### 2.6 UserBenefit (user_benefits)

Benefícios por usuário (não vinculados ao plano da clínica).

| Campo        | Tipo       | Descrição                      |
|--------------|------------|--------------------------------|
| id           | uuid       | PK                             |
| user_id      | uuid       | FK -> users                   |
| benefit_id   | uuid       | FK -> plan_benefits            |
| is_enabled   | boolean    | Se está ativo para o usuário   |
| expires_at   | timestamptz| Expiração (null = permanente)  |
| granted_by   | uuid       | FK -> users (quem concedeu)    |
| created_at   | timestamptz|                                |
| updated_at   | timestamptz|                                |

## 3. Relações

```
plans ||--o{ plan_benefit_relations : "benefícios"
plan_benefits ||--o{ plan_benefit_relations : "planos"

clinics ||--o{ clinic_plans : "plano ativo"
plans ||--o{ clinic_plans : "assinatura"

clinic_plans ||--o{ clinic_plan_benefits : "benefícios customizados"

users ||--o{ user_benefits : "benefícios pessoais"
plan_benefits ||--o{ user_benefits : "benefício"

clinic_plans ||--o{ users : "plano da clínica" (via clinic_id)
```

## 4. Tipos TypeScript

```typescript
export type PlanStatus = 'trial' | 'active' | 'expired' | 'cancelled'
export type BillingCycle = 'monthly' | 'quarterly' | 'annual'
export type BenefitCategory = 'feature' | 'limit' | 'addon' | 'integration'

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  billing_cycle: BillingCycle
  is_active: boolean
  features: string[]
  max_users: number
  max_patients: number
  max_storage: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PlanBenefit {
  id: string
  name: string
  code: string
  category: BenefitCategory
  icon: string
  is_active: boolean
  created_at: string
}

export interface PlanBenefitRelation {
  id: string
  plan_id: string
  benefit_id: string
  is_enabled: boolean
  created_at: string
}

export interface ClinicPlan {
  id: string
  clinic_id: string
  plan_id: string
  status: PlanStatus
  started_at: string
  expires_at: string
  trial_ends_at: string
  created_at: string
  updated_at: string
}

export interface ClinicPlanBenefit {
  id: string
  clinic_plan_id: string
  benefit_id: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export interface UserBenefit {
  id: string
  user_id: string
  benefit_id: string
  is_enabled: boolean
  expires_at: string | null
  granted_by: string
  created_at: string
  updated_at: string
}
```

## 5. Considerações

- Super Admin pode gerenciar planos e benefícios
- Clinic Admin vê apenas o plano da sua clínica
- Benefícios do plano são automaticamente aplicados à clínica
- Override via clinic_plan_benefits permite customizar por clínica
- user_benefits permite benefícios individuais (bônus,试用)

## 6. Tasks

1. Adicionar tipos ao database.ts
2. Atualizar database-schema.md
3. Adicionar seed de planos e benefícios padrão