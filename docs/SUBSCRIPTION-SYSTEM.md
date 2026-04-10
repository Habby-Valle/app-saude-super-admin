# Sistema de Assinaturas e Billing

Documento unificado que especifica o sistema de assinaturas, fluxo de pagamento, testes e cancelamento.

---

## 1. Visão Geral

Sistema de gestão de assinaturas do App Saúde. Define o comportamento quando a assinatura está ativa, em trial ou expirada, e quais funcionalidades estão disponíveis em cada estado.

---

## 2. Estados de Assinatura

| Status      | Descrição        | Acesso          |
| ----------- | ---------------- | --------------- |
| `trial`     | Período gratuito | Total (Premium) |
| `active`    | Assinatura paga  | Total (Premium) |
| `expired`   | Expirou          | Básico apenas   |
| `cancelled` | Cancelado        | Básico apenas   |

---

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

### 3.3 Comportamento ao Bloqueio

Quando usuário tenta acessar funcionalidade Premium com assinatura expirada:

1. Mostrar banner indicando assinatura expirada
2. Redirect para página de renewal (`/admin/plan`)
3. Exibir opções: renewal ou downgrade de plano

---

## 4. Dados do Sistema

### 4.1 Planos (plans)

| Campo         | Tipo        | Descrição                  |
| ------------- | ----------- | -------------------------- |
| id            | uuid        | PK                         |
| name          | text        | Nome do plano              |
| description   | text        | Descrição do plano         |
| price         | decimal     | Preço em reais             |
| billing_cycle | text        | monthly, quarterly, annual |
| is_active     | boolean     | Se está disponível         |
| is_default    | boolean     | Plano padrão para trials   |
| features      | jsonb       | Lista de features          |
| max_users     | integer     | Limite de usuários         |
| max_patients  | integer     | Limite de pacientes        |
| max_storage   | integer     | Armazenamento em GB        |
| sort_order    | integer     | Ordem de exibição          |
| created_at    | timestamptz |                            |
| updated_at    | timestamptz |                            |

### 4.2 Assinaturas (clinic_plans)

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

### 4.3 Clínicas (extensões)

| Campo              | Tipo | Descrição               |
| ------------------ | ---- | ----------------------- |
| stripe_customer_id | text | ID do cliente no Stripe |
| email              | text | Email da clínica        |

### 4.4 Histórico de Cobranças (subscription_payments)

| Campo                  | Tipo        | Descrição                  |
| ---------------------- | ----------- | -------------------------- |
| id                     | uuid        | PK                         |
| clinic_id              | uuid        | FK -> clinics              |
| clinic_plan_id         | uuid        | FK -> clinic_plans         |
| stripe_payment_id      | text        | ID do pagamento no Stripe  |
| stripe_subscription_id | text        | ID da assinatura Stripe    |
| stripe_session_id      | text        | ID da sessão Stripe        |
| amount                 | decimal     | Valor em reais             |
| currency               | text        | brl                        |
| status                 | text        | pending, succeeded, failed |
| payment_method         | text        | card, etc                  |
| billing_cycle          | text        | monthly, quarterly, annual |
| is_prorate             | boolean     | Se foi cobrança pró-rata   |
| paid_at                | timestamptz | Data do pagamento          |
| created_at             | timestamptz |                            |

---

## 5. Fluxo de Assinatura

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

---

## 6. Fluxo de Pagamento

```
Usuário (Clinic Admin)
       │
       ▼
┌──────────────────┐
│  /admin/plan    │── Seleciona plano
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ requestPlanChange│── Chama action
│ (actions.ts)     │
└────────┬─────────┘
         │ price === 0 ?
    ┌────┴────┐
    │ SIM     │ NÃO
    ▼         ▼
┌────────┐  ┌──────────────────┐
│Ativar  │  │ POST /api/checkout│
│direto  │  └────────┬─────────┘
└────────┘           │
                     ▼
              ┌──────────────────┐
              │ Stripe Checkout  │
              │ (redirect URL)   │
              └────────┬─────────┘
                       │
                       ▼ (pagamento)
              ┌──────────────────┐
              │ POST /webhook     │
              │ (stripe)         │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Ativa assinatura │
              │ + cria payment   │
              │ + salva customer │
              └──────────────────┘
```

---

## 7. Billing Pró-rata

### 7.1 Cálculo

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

### 7.2 Endpoint

- **Rota**: `POST /api/checkout`
- **Parâmetro**: `isProrate?: boolean`
- **Comportamento**: Se `true`, calcula pró-rata baseado no plano atual

---

## 8. Cenários de Teste

### 8.1 Cenário: Renovação de Trial/Assinatura Expirada

| Step | Ação                                      | Comportamento Esperado            |
| ---- | ----------------------------------------- | --------------------------------- |
| 1    | Usuário acessa `/admin/plan`              | Exibe planos disponíveis          |
| 2    | Usuário clica em "Assinar" num plano pago | Chama `requestPlanChange`         |
| 3    | `requestPlanChange` → `/api/checkout`     | Retorna URL do Stripe             |
| 4    | Redirect para Stripe                      | Página de pagamento Stripe        |
| 5    | Usuário preenche dados cartão             | Interface Stripe                  |
| 6    | Usuário confirma pagamento                | Stripe processa                   |
| 7    | Stripe → Webhook                          | `checkout.session.completed`      |
| 8    | Webhook atualiza `clinic_plans`           | Status = "active", cria pagamento |
| 9    | Redirect para `/admin/plan?success=true`  | Banner sucesso                    |

**Teste Manual**:

```bash
# 1. Criar clínica (gera trial automático)
# 2. Acessar /admin/plan
# 3. Selecionar plano pago
# 4. Completar pagamento no Stripe
# 5. Verificar redirecionamento
# 6. Verificar banco: clinic_plans status='active'
# 7. Verificar banco: subscription_payments criado
```

**Bugs Esperados**:
| Bug | Sintoma | Causa Provável |
|-----|---------|----------------|
| Não redireciona para Stripe | Action retorna erro | `/api/checkout` retornou erro |
| Stripe erro 500 | Página branca no checkout | Stripe secret key incorreta |
| Assinatura não ativa | Status continua "trial" | Webhook não chegou ou falhou |
| Cobrança duplicada | Dois registros em subscription_payments | Webhook chamado múltiplas vezes |

### 8.2 Cenário: Upgrade de Plano (Pró-rata)

| Step | Ação                                      | Comportamento Esperado         |
| ---- | ----------------------------------------- | ------------------------------ |
| 1    | Clínica já tem plano ativo (R$50)         | -                              |
| 2    | Usuário acessa `/admin/plan`              | Vê planos com cálculo pró-rata |
| 3    | Seleciona plano mais caro (R$100)         | -                              |
| 4    | `requestPlanChange` com `isProrate: true` | -                              |
| 5    | `/api/checkout` calcula pró-rata          | Desconto pelo tempo usado      |
| 6    | Usuário paga valor parcial                | -                              |

**Teste Manual**:

```sql
UPDATE clinic_plans
SET started_at = NOW() - INTERVAL '10 days'
WHERE clinic_id = 'clinic-uuid' AND status = 'active';
```

### 8.3 Cenário: Cancelamento via Stripe Portal

| Step | Ação                                          | Comportamento Esperado             |
| ---- | --------------------------------------------- | ---------------------------------- |
| 1    | Usuário acessa `/admin/plan`                  | Vê botão "Gerenciar Assinatura"    |
| 2    | Clica em "Gerenciar Assinatura"               | Redirect para `/admin/plan/manage` |
| 3    | Na página, clica "Abrir Portal"               | POST `/api/portal`                 |
| 4    | API cria billing portal session               | Retorna URL do Stripe Portal       |
| 5    | Redirect para Stripe                          | Abre portal externo                |
| 6    | Usuário clica "Cancelar assinatura"           | Stripe pergunta confirmação        |
| 7    | Usuário confirma "Cancelar no fim do período" | Stripe seta `cancel_at_period_end` |
| 8    | Retorna para app                              | Status continua "active"           |
| 9    | Dia do vencimento                             | Job marca como "expired"           |

**Pré-requisitos**:

```sql
SELECT stripe_customer_id FROM clinics WHERE id = 'clinic-uuid';
-- Se null, primeiro pagamento ainda não foi feito
```

### 8.4 Cenário: Plano Grátis (price = 0)

| Step | Ação                                    | Comportamento Esperado        |
| ---- | --------------------------------------- | ----------------------------- |
| 1    | Usuário seleciona plano grátis          | -                             |
| 2    | `requestPlanChange` detecta price === 0 | Ativa diretamente, sem Stripe |
| 3    | Cria novo clinic_plans                  | Status = "active"             |
| 4    | Cancela plano anterior                  | Status = "cancelled"          |

---

## 9. Checklist de Testes

### Pré-Condições

- [ ] Planos cadastrados no banco (tabela `plans`)
- [ ] Clínica com trial ativo após criação
- [ ] Stripe configurado (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] Webhook do Stripe pointing para produção

### Testes de Integração

| ID  | Teste                       | Método               | Resultado Esperado           |
| --- | --------------------------- | -------------------- | ---------------------------- |
| T01 | Novo pagamento - mensal     | POST /api/checkout   | URL Stripe retornada         |
| T02 | Novo pagamento - trimestral | POST /api/checkout   | URL Stripe retornada         |
| T03 | Novo pagamento - anual      | POST /api/checkout   | URL Stripe retornada         |
| T04 | Checkout completo           | Stripe UI            | Assinatura ativa             |
| T05 | Webhook received            | Stripe → webhook     | subscription_payments criado |
| T06 | Cancelamento Stripe         | Via dashboard Stripe | Status = "cancelled"         |
| T07 | Upgrade com pró-rata        | Select premium       | Valor com desconto           |
| T08 | Downgrade                   | Select basic         | Valor cheio (sem pró-rata)   |
| T09 | Plano grátis                | Select free          | Ativação direta              |
| T10 | Renewal após expirado       | Select any           | Checkout funciona            |
| T11 | Cancelamento via Portal     | /admin/plan/manage   | Redirect para Stripe Portal  |
| T12 | Cancelamento no portal      | Stripe Portal        | Mantém acesso até expires_at |
| T13 | Update cartão no portal     | Stripe Portal        | Dados atualizados            |
| T14 | Visualizar invoices         | Stripe Portal        | Lista de cobranças           |

### Testes de Edge Cases

| ID  | Teste                | Método                             | Resultado Esperado        |
| --- | -------------------- | ---------------------------------- | ------------------------- |
| E01 | Metadata ausente     | Mock webhook sem metadata          | Erro 400                  |
| E02 | Clinic não existe    | POST com clinic_id inválido        | Erro 404                  |
| E03 | Plano não existe     | POST com plan_id inválido          | Erro 404                  |
| E04 | Portal sem customer  | /api/portal sem stripe_customer_id | Erro 400                  |
| E05 | Assinatura duplicada | Pagamento duplicado                | Idempotência (ignora)     |
| E06 | Webhook repetido     | Reenviar webhook                   | Ignora ou atualiza status |

---

## 10. Queries de Verificação

### Verificar subscription ativa

```sql
SELECT
  cp.id, cp.status, cp.started_at, cp.expires_at,
  c.name as clinic_name, p.name as plan_name
FROM clinic_plans cp
JOIN clinics c ON c.id = cp.clinic_id
JOIN plans p ON p.id = cp.plan_id
WHERE cp.status IN ('active', 'trial')
ORDER BY cp.created_at DESC;
```

### Verificar pagamentos

```sql
SELECT
  sp.id, sp.stripe_session_id, sp.amount, sp.status, sp.paid_at,
  c.name as clinic_name
FROM subscription_payments sp
JOIN clinics c ON c.id = sp.clinic_id
ORDER BY sp.created_at DESC;
```

### Verificar stripe_customer_id

```sql
SELECT
  c.id, c.name, c.stripe_customer_id,
  cp.status as subscription_status
FROM clinics c
LEFT JOIN clinic_plans cp ON cp.clinic_id = c.id AND cp.status IN ('active', 'trial')
WHERE c.stripe_customer_id IS NOT NULL
ORDER BY c.created_at DESC;
```

---

## 11. Simulação de Webhook (Stripe CLI)

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS

# Login
stripe login

# Listen local (forward para localhost)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger teste (em outro terminal)
stripe trigger checkout.session.completed \
  --add "metadata[plan_id]=plan-uuid" \
  --add "metadata[clinic_id]=clinic-uuid"
```

---

## 12. Fluxos de Error Handling

### Erro no Checkout

```
/api/checkout retorna { error: "..." }
        │
        ▼
requestPlanChange recebe erro
        │
        ▼
Retorna { success: false, error: "..." }
        │
        ▼
UI exibe toast de erro
```

### Erro no Webhook

```
stripe.webhooks.constructEvent falha
        │
        ▼
NextResponse.json({ error: "Invalid signature" }, 400)
        │
        ▼
Stripe faz retry (até 3x em 24h)
```

### Erro no Banco (Webhook)

```
admin.from("clinic_plans").insert() falha
        │
        ▼
Log erro, retorna 500
        │
        ▼
Stripe faz retry do webhook
```

---

## 13. Monitoramento

### Logs importantes

```
[checkout] - Requisições de checkout
[webhook] - Eventos recebidos do Stripe
[requestPlanChange] - Ações de mudança de plano
[portal] - Criação de sessões do Stripe Portal
```

### Métricas a acompanhar

- Taxa de sucesso de checkout
- Tempo de ativação pós-pagamento
- Falhas em webhooks
- Assinaturas expiradas sem renewal

---

## 14. Variáveis de Ambiente

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 8. Cancelamento via Stripe Portal

### 8.1 Fluxo

```
/admin/plan
       │
       ▼
Botão "Gerenciar Assinatura"
       │
       ▼
POST /api/portal
       │
       ▼
Stripe Portal Session
       │
       ▼
Redirect → Stripe Portal
       │
       ├── Visualizar invoices
       ├── Atualizar cartão
       └── Cancelar assinatura
            │
            ▼ (cancel at period end)
       Acesso mantido até expires_at
            │
            ▼ (dia do vencimento)
       Job marca como "expired"
```

### 8.2 Pré-requisitos

```sql
-- Clinic precisa ter stripe_customer_id
SELECT stripe_customer_id FROM clinics WHERE id = 'clinic-uuid';
-- Se null, primeiro pagamento ainda não foi feito
```

---

## 9. Jobs Automatizados (pg_cron)

### 9.1 Expiração de Assinaturas

- **Frequência**: Diária (meia-noite)
- **Função**: `expire_subscriptions()`

### 9.2 Notificações de Expiração

- **Frequência**: Diária às 8h
- **Função**: `notify_expiring_subscriptions()`
- **Dias antes do vencimento**: 7, 3, 1

---

## 10. APIs

| Path                               | Descrição                       |
| ---------------------------------- | ------------------------------- |
| `POST /api/checkout`               | Cria sessão de pagamento Stripe |
| `POST /api/webhooks/stripe`        | Recebe eventos do Stripe        |
| `GET /api/subscriptions/[id]`      | Detalhes de uma assinatura      |
| `POST /api/subscriptions/activate` | Ativar assinatura manualmente   |
| `GET /api/plans`                   | Lista de planos disponíveis     |
| `POST /api/portal`                 | Cria sessão do Stripe Portal    |

---

## 11. Páginas

| Path                              | Descrição                                |
| --------------------------------- | ---------------------------------------- |
| `/admin/plan`                     | Página de gestão de plano (Clinic Admin) |
| `/admin/plan/manage`              | Página de gestão via Stripe Portal       |
| `/super-admin/subscriptions`      | Dashboard de assinaturas (Super Admin)   |
| `/super-admin/subscriptions/[id]` | Detalhes da assinatura                   |
| `/super-admin/payments`           | Histórico de cobranças                   |

---

## 12. Migrations

| Arquivo                                             | Descrição                   |
| --------------------------------------------------- | --------------------------- |
| `20260407000021_enable_pg_cron.sql`                 | Habilita extensão pg_cron   |
| `20260407000022_create_subscription_expire_job.sql` | Job de expiração automática |
| `20260407000023_trial_system.sql`                   | Sistema de trial automático |
| `20260407000024_subscription_notifications.sql`     | Notificações de expiração   |
| `20260408000026_add_clinic_email.sql`               | Adiciona email na clínica   |
| `20260410000027_create_subscription_payments.sql`   | Histórico de cobranças      |
| `20260411000028_add_stripe_customer_id.sql`         | Stripe customer ID          |

---

## 13. Verificação de Acesso (lib/auth.ts)

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

### Actions Protegidas

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

---

## 14. Checklist de Testes

### ✅ Testes de Integração

| ID  | Teste                       | Método               | Resultado Esperado           |
| --- | --------------------------- | -------------------- | ---------------------------- |
| T01 | Novo pagamento - mensal     | POST /api/checkout   | URL Stripe retornada         |
| T02 | Novo pagamento - trimestral | POST /api/checkout   | URL Stripe retornada         |
| T03 | Novo pagamento - anual      | POST /api/checkout   | URL Stripe retornada         |
| T04 | Checkout completo           | Stripe UI            | Assinatura ativa             |
| T05 | Webhook received            | Stripe → webhook     | subscription_payments criado |
| T06 | Cancelamento Stripe         | Via dashboard Stripe | Status = "cancelled"         |
| T07 | Upgrade com pró-rata        | Select premium       | Valor com desconto           |
| T08 | Downgrade                   | Select basic         | Valor cheio (sem pró-rata)   |
| T09 | Plano grátis                | Select free          | Ativação direta              |
| T10 | Renewal após expirado       | Select any           | Checkout funciona            |
| T11 | Cancelamento via Portal     | /admin/plan/manage   | Redirect para Stripe Portal  |
| T12 | Cancelamento no portal      | Stripe Portal        | Mantém acesso até expires_at |
| T13 | Update cartão no portal     | Stripe Portal        | Dados atualizados            |
| T14 | Visualizar invoices         | Stripe Portal        | Lista de cobranças           |

### ✅ Testes de Edge Cases

| ID  | Teste                | Método                             | Resultado Esperado        |
| --- | -------------------- | ---------------------------------- | ------------------------- |
| E01 | Metadata ausente     | Mock webhook sem metadata          | Erro 400                  |
| E02 | Clinic não existe    | POST com clinic_id inválido        | Erro 404                  |
| E03 | Plano não existe     | POST com plan_id inválido          | Erro 404                  |
| E04 | Portal sem customer  | /api/portal sem stripe_customer_id | Erro 400                  |
| E05 | Assinatura duplicada | Pagamento дубликат                 | Idempotência (ignora)     |
| E06 | Webhook repetido     | Reenviar webhook                   | Ignora ou atualiza status |

---

## 15. Queries de Verificação

### Verificar subscription ativa

```sql
SELECT
  cp.id,
  cp.status,
  cp.started_at,
  cp.expires_at,
  c.name as clinic_name,
  p.name as plan_name
FROM clinic_plans cp
JOIN clinics c ON c.id = cp.clinic_id
JOIN plans p ON p.id = cp.plan_id
WHERE cp.status IN ('active', 'trial')
ORDER BY cp.created_at DESC;
```

### Verificar pagamentos

```sql
SELECT
  sp.id,
  sp.stripe_session_id,
  sp.amount,
  sp.status,
  sp.paid_at,
  c.name as clinic_name
FROM subscription_payments sp
JOIN clinics c ON c.id = sp.clinic_id
ORDER BY sp.created_at DESC;
```

### Verificar stripe_customer_id

```sql
SELECT
  c.id,
  c.name,
  c.stripe_customer_id,
  cp.status as subscription_status
FROM clinics c
LEFT JOIN clinic_plans cp ON cp.clinic_id = c.id AND cp.status IN ('active', 'trial')
WHERE c.stripe_customer_id IS NOT NULL
ORDER BY c.created_at DESC;
```

---

## 16. Variáveis de Ambiente

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 17. Simulação de Webhook (Stripe CLI)

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS

# Login
stripe login

# Listen local (forward para localhost)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger teste (em outro terminal)
stripe trigger checkout.session.completed \
  --add "metadata[plan_id]=plan-uuid" \
  --add "metadata[clinic_id]=clinic-uuid"
```

---

## 18. Status das Features

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
- [x] 13. Cancelamento via Stripe Portal

---

_Documento unificado em 2026-04-11_
