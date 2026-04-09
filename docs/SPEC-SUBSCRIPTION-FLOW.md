# Spec - Fluxo de Assinaturas

## 1. Visão Geral

Sistema de gestão de assinaturas do App Saúde. Define o comportamento cuando a assinatura está ativa, em trial ou expirada, e quais funcionalidades estão disponíveis em cada estado.

## 2. Estados de Assinatura

| Status      | Descrição        | Acesso          |
| ----------- | ---------------- | --------------- |
| `trial`     | Período gratuito | Total (Premium) |
| `active`    | Assinatura paga  | Total (Premium) |
| `expired`   | Expirou          | Básico apenas   |
| `cancelled` | Cancelado        | Básico apenas   |

## 3. Classificação de Funcionalidades

### 3.1 Tipos de Funcionalidades

| Tipo        | Comportamento quando expirado                    |
| ----------- | ------------------------------------------------ |
| **Básico**  | Funciona mesmo com assinatura expirada (leitura) |
| **Premium** | Bloqueado quando assinatura expirada/cancelada   |

### 3.2 Funcionalidades por Tipo

#### Básico (funciona sempre)

- Login e autenticação
- Dashboard (visualização/leitura)
- Pacientes (visualização/leitura)
- Cuidadores (visualização/leitura)
- Turnos (visualização/leitura)
- Checklists templates (visualização/leitura)

#### Premium (requer assinatura ativa)

- Relatórios (geração e exportação)
- SOS (sistema de alertas de emergência)
- Settings (configurações da clínica)
- Alterar plano de assinatura
- Criar/editar pacientes
- Criar/editar cuidadores
- Criar/editar turnos
- Criar/editar/checklists templates

## 4. Comportamento ao Bloqueio

Quando usuário tenta acessar funcionalidade Premium com assinatura expirada:

1. Mostrar banner indicando assinatura expirada
2. Redirect para página de renewal (/admin/plan)
3. Exibir opções: renewal ou downgrade de plano

## 5. Dados da Assinatura

### ClinicPlan (clinic_plans)

| Campo         | Tipo        | Descrição                         |
| ------------- | ----------- | --------------------------------- |
| id            | uuid        | PK                                |
| clinic_id     | uuid        | FK -> clinics                     |
| plan_id       | uuid        | FK -> plans                       |
| status        | text        | trial, active, expired, cancelled |
| started_at    | timestamptz | Início da vigência                |
| expires_at    | timestamptz | Fim da vigência                   |
| trial_ends_at | timestamptz | Fim do período de trial           |
| created_at    | timestamptz |                                   |
| updated_at    | timestamptz |                                   |

## 6. Plano (plans)

| Campo         | Tipo        | Descrição                  |
| ------------- | ----------- | -------------------------- |
| id            | uuid        | PK                         |
| name          | text        | Nome do plano              |
| description   | text        | Descrição do plano         |
| price         | decimal     | Preço mensal em reais      |
| billing_cycle | text        | monthly, quarterly, annual |
| is_active     | boolean     | Se está disponível         |
| features      | jsonb       | Lista de features          |
| max_users     | integer     | Limite de usuários         |
| max_patients  | integer     | Limite de pacientes        |
| max_storage   | integer     | Armazenamento em GB        |
| sort_order    | integer     | Ordem de exibição          |
| created_at    | timestamptz |                            |
| updated_at    | timestamptz |                            |

## 7. Job de Expiração Automática

### 7.1 Função SQL

```sql
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE clinic_plans
  SET
    status = 'expired',
    updated_at = now()
  WHERE
    status IN ('trial', 'active')
    AND expires_at IS NOT NULL
    AND expires_at < now();
END;
$$;
```

### 7.2 Agendamento

- **Frequência**: Diária (meia-noite)
- ** Infrarutura**: Supabase pg_cron
- **Scheduller**: `cron.schedule('expire-subscriptions', '0 0 * * *', 'SELECT expire_subscriptions()')`

### 7.3Migração

Arquivo: `supabase/migrations/20260407000020_create_subscription_expire_job.sql`

## 8. Sistema de Trial

### 8.1 Definições

| Item     | Valor                                      |
| -------- | ------------------------------------------ |
| Duração  | 14 dias                                    |
| Ativação | Automático ao criar clínica                |
| Plano    | Trial (plano padrão com is_default = true) |

### 8.2 Funcionamento

1. Ao criar clínica → Trigger ativa trial automaticamente
2. Trial dura 14 dias (expires_at = now() + 14 dias)
3. Job de expiração marca como 'expired' ao final
4. Usuário pode então contratar plano pago

### 8.3 Função SQL

```sql
CREATE OR REPLACE FUNCTION activate_trial_for_clinic(p_clinic_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id UUID;
  v_trial_duration INTEGER := 14;
BEGIN
  SELECT id INTO v_plan_id
  FROM plans
  WHERE is_default = true AND is_active = true
  LIMIT 1;

  -- Verifica se já existe assinatura ativa
  IF EXISTS (SELECT 1 FROM clinic_plans WHERE clinic_id = p_clinic_id AND status IN ('trial', 'active')) THEN
    RETURN;
  END IF;

  INSERT INTO clinic_plans (clinic_id, plan_id, status, started_at, expires_at, trial_ends_at)
  VALUES (p_clinic_id, v_plan_id, 'trial', now(), now() + (v_trial_duration || ' days')::interval, now() + (v_trial_duration || ' days')::interval);
END;
$$;
```

### 8.4 Trigger

```sql
CREATE TRIGGER clinic_trials_trigger
AFTER INSERT ON clinics
FOR EACH ROW EXECUTE FUNCTION trigger_activate_trial();
```

### 8.5 Migração

Arquivo: `supabase/migrations/20260407000023_trial_system.sql`

## 9. Notificações de Expiração

### 9.1 Tabela

| Campo          | Tipo        | Descrição                        |
| -------------- | ----------- | -------------------------------- |
| id             | uuid        | PK                               |
| clinic_id      | uuid        | FK -> clinics                    |
| clinic_plan_id | uuid        | FK -> clinic_plans               |
| type           | text        | trial_reminder, expired, renewal |
| days_before    | int         | Dias antes (7, 3, 1)             |
| channel        | text        | email, in_app, sms               |
| status         | text        | pending, sent, failed            |
| sent_at        | timestamptz | Quando enviou                    |

### 9.2 Função SQL

```sql
CREATE OR REPLACE FUNCTION notify_expiring_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
  v_days INTEGER;
  v_days_before INTEGER;
BEGIN
  FOR v_days IN SELECT unnest(ARRAY[7, 3, 1]) LOOP
    v_days_before := v_days;

    FOR v_record IN
      SELECT cp.id AS clinic_plan_id, cp.clinic_id, c.name AS clinic_name,
             cp.expires_at, cp.status
      FROM clinic_plans cp
      JOIN clinics c ON c.id = cp.clinic_id
      WHERE cp.status IN ('trial', 'active')
        AND cp.expires_at IS NOT NULL
        AND cp.expires_at > now()
        AND cp.expires_at <= (now() + (v_days_before || ' days')::interval)
        AND cp.expires_at > (now() + ((v_days_before - 1) || ' days')::interval)
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM subscription_notifications sn
        WHERE sn.clinic_plan_id = v_record.clinic_plan_id
          AND sn.days_before = v_days_before
          AND sn.channel = 'email'
          AND sn.status = 'sent'
      ) THEN
        INSERT INTO subscription_notifications (clinic_id, clinic_plan_id, type, days_before, channel, status)
        VALUES (v_record.clinic_id, v_record.clinic_plan_id, 'trial_reminder', v_days_before, 'email', 'pending');
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
```

### 9.3 Agendamento

- **Frequência**: Diária às 8h (após job de expiração)
- ** Infraestrutura**: Supabase pg_cron

### 9.4 Migração

Arquivo: `supabase/migrations/20260407000024_subscription_notifications.sql`

## 10. Verificação de Acesso

### 10.1 Função em lib/auth.ts

```typescript
export async function getClinicSubscriptionStatus(
  clinicId: string
): Promise<SubscriptionStatus> {
  // Busca clinic_plans ativa e retorna status
}

export async function requireActiveSubscription(
  clinicId: string
): Promise<SubscriptionStatus> {
  const subscription = await getClinicSubscriptionStatus(clinicId)
  if (!subscription.isActive) {
    throw new Error("SUBSCRIPTION_EXPIRED")
  }
  return subscription
}
```

### 10.2 Actions Protegidas

| Action                    | Arquivo                     |
| ------------------------- | --------------------------- |
| createPatient             | admin/patients/actions.ts   |
| createCaregiver           | admin/caregivers/actions.ts |
| createShift               | admin/shifts/actions.ts     |
| createClinicChecklist     | admin/checklists/actions.ts |
| updateClinicChecklist     | admin/checklists/actions.ts |
| deleteClinicChecklist     | admin/checklists/actions.ts |
| acknowledgeClinicSosAlert | admin/sos/actions.ts        |
| resolveClinicSosAlert     | admin/sos/actions.ts        |
| requestPlanChange         | admin/plan/actions.ts       |

## 11. Tasks

- [x] 1. Job de expiração automática
- [x] 2. Sistema de Trial
- [x] 3. Notificações de Expiração
- [x] 4. Verificação de assinatura antes de ações premium
- [x] 5. Banner de expiração na UI
- [x] 6. Página de renewal/alteração de plano
- [x] 7. Integração com Stripe (API checkout + Webhook)
- [x] 8. Dashboard de Assinaturas (Super Admin)
- [x] 9. Página de detalhes da assinatura
- [x] 10. Ativação Manual (Super Admin)
- [x] 11. Histórico de Cobranças
- [x] 12. Billing Pró-rata

## 12. Componentes Criados

### 12.1 Pages

| Path                              | Descrição                                |
| --------------------------------- | ---------------------------------------- |
| `/admin/plan`                     | Página de gestão de plano (Clinic Admin) |
| `/super-admin/subscriptions`      | Dashboard de assinaturas (Super Admin)   |
| `/super-admin/subscriptions/[id]` | Detalhes da assinatura                   |

### 12.2 APIs

| Path                          | Descrição                       |
| ----------------------------- | ------------------------------- |
| `/api/checkout`               | Cria sessão de pagamento Stripe |
| `/api/webhooks/stripe`        | Recebe eventos do Stripe        |
| `/api/subscriptions/[id]`     | Detalhes de uma assinatura      |
| `/api/subscriptions/activate` | Ativar assinatura manualmente   |
| `/api/plans`                  | Lista de planos disponíveis     |

### 12.3 Componentes UI

| Component          | Localização                                       |
| ------------------ | ------------------------------------------------- |
| SubscriptionBanner | components/clinic-admin/subscription-banner.tsx   |
| SubscriptionBadge  | components/clinic-admin/subscription-banner.tsx   |
| StatsCards         | super-admin/subscriptions/stats-cards.tsx         |
| SubscriptionsTable | super-admin/subscriptions/subscriptions-table.tsx |

## 13. Migrations

| Arquivo                                             | Descrição                   |
| --------------------------------------------------- | --------------------------- |
| `20260407000021_enable_pg_cron.sql`                 | Habilita extensão pg_cron   |
| `20260407000022_create_subscription_expire_job.sql` | Job de expiração automática |
| `20260407000023_trial_system.sql`                   | Sistema de trial automático |
| `20260407000024_subscription_notifications.sql`     | Notificações de expiração   |
| `20260408000026_add_clinic_email.sql`               | Adiciona email na clínica   |

## 14. Fluxo Completo

```
1. Clínica é criada → Trial ativado automaticamente (14 dias)
2. Usuário usa sistema normalmente (acesso total)
3. Job diário verifica expirações:
   - marca como 'expired' se passou do prazo
   - cria notificações pendentes (7, 3, 1 dias antes)
4. Usuário vê banner se expirado ou expira em breve
5. Usuário vai para /admin/plan para renovar
6. Se plano pago → Redirect para Stripe Checkout
7. Pagamento confirmado → Webhook ativa assinatura
8. Super Admin pode visualizar em /super-admin/subscriptions
9. Super Admin pode ativar manualmente sem pagamento
```

## 15. Billing Pró-rata

### 15.1 Cálculo

Quando usuário faz upgrade de plano:

```typescript
function calculateProrate(
  currentPlanPrice: number,
  newPlanPrice: number,
  startedAt: string,
  billingCycle: string
): number {
  // Calcula dias restantes do ciclo atual
  // Aplica desconto proporcional no novo plano
  // Se downgrade, cobra valor integral do novo plano
}
```

### 15.2 Endpoint

- **Rota**: `POST /api/checkout`
- **Parâmetro**: `isProrate?: boolean`
- **Comportamento**: Se `true`, calcula pró-rata baseado no plano atual

## 16. Histórico de Cobranças

### 16.1 Tabela subscription_payments

| Campo             | Tipo        | Descrição                  |
| ----------------- | ----------- | -------------------------- |
| id                | uuid        | PK                         |
| clinic_id         | uuid        | FK -> clinics              |
| clinic_plan_id    | uuid        | FK -> clinic_plans         |
| stripe_payment_id | text        | ID do pagamento no Stripe  |
| amount            | decimal     | Valor em centavos          |
| currency          | text        | brl                        |
| status            | text        | pending, succeeded, failed |
| billing_cycle     | text        | monthly, quarterly, annual |
| is_prorate        | boolean     | Se foi cobrança pró-rata   |
| created_at        | timestamptz |                            |

### 16.2 Página Super Admin

- **Rota**: `/super-admin/payments`
- **Funcionalidades**: Lista de todas as cobranças, filtros por status/clínica
