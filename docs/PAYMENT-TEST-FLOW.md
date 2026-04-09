# Fluxo de Pagamento - Testes e Checklist

## Visão Geral do Fluxo

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
              └──────────────────┘
```

---

## 1. Cenário: Renovação de Trial/Assinatura Expirada

### Fluxo Esperado

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

### Teste Manual

```bash
# 1. Criar clínica (gera trial automático)
# 2. Acessar /admin/plan
# 3. Selecionar plano pago
# 4. Completar pagamento no Stripe
# 5. Verificar redirecionamento
# 6. Verificar banco: clinic_plans status='active'
# 7. Verificar banco: subscription_payments criado
```

### Comportamentos Não Esperados (Bugs)

| Bug                                 | Sintoma                                 | Causa Provável                  |
| ----------------------------------- | --------------------------------------- | ------------------------------- |
| Não redireciona para Stripe         | Action retorna erro                     | `/api/checkout` retornou erro   |
| Stripe dá erro 500                  | Página branca no checkout               | Stripe secret key incorreta     |
| Assinatura não ativa após pagamento | Status continua "trial"                 | Webhook não chegou ou falhou    |
| Cobrança duplicada                  | Dois registros em subscription_payments | Webhook chamado múltiplas vezes |
| Dados incorretos no payment         | Clinic_id errado                        | Metadata não passou no checkout |

---

## 2. Cenário: Upgrade de Plano (Pró-rata)

### Fluxo Esperado

| Step | Ação                                      | Comportamento Esperado         |
| ---- | ----------------------------------------- | ------------------------------ |
| 1    | Clínica já tem plano ativo (R$50)         | -                              |
| 2    | Usuário acessa `/admin/plan`              | Vê planos com cálculo pró-rata |
| 3    | Seleciona plano mais caro (R$100)         | -                              |
| 4    | `requestPlanChange` com `isProrate: true` | -                              |
| 5    | `/api/checkout` calcula pró-rata          | Desconto pelo tempo usado      |
| 6    | Usuário paga valor parcial                | -                              |

### Cálculo Pró-rata

```
Dias usados = now - started_at
Dias restantes = total_ciclo - dias_usados
Desconto = (preço_novo / total_dias) * dias_restantes
Valor final = preço_novo - desconto
```

### Teste Manual

```sql
-- Simular clínica com plano ativo
UPDATE clinic_plans
SET started_at = NOW() - INTERVAL '10 days'
WHERE clinic_id = 'clinic-uuid' AND status = 'active';
```

### Comportamentos Não Esperados

| Bug                     | Sintoma                       |
| ----------------------- | ----------------------------- |
| Pró-rata calcula errado | Valor muito alto ou baixo     |
| Não aplica desconto     | Cobra preço cheio             |
| Downgrade não funciona  | Não permite plano mais barato |

---

## 3. Cenário: Cancelamento pelo Stripe

### Fluxo

```
Stripe Dashboard → Cancelar assinatura
        │
        ▼
Stripe → Webhook → customer.subscription.deleted
        │
        ▼
Atualiza clinic_plans status = 'cancelled'
```

### Teste Manual

```bash
# Via Stripe CLI para simular webhook
stripe trigger customer.subscription.deleted \
  --add "metadata[clinic_id]=clinic-uuid"
```

### Comportamentos Não Esperados

| Bug                                | Sintoma                         |
| ---------------------------------- | ------------------------------- |
| Status não atualiza                | Clínica continua como "active"  |
| Erro se clínica não tem assinatura | Query sem resultados causa erro |

---

## 4. Cenário: Plano Grátis (price = 0)

### Fluxo

| Step | Ação                                    | Comportamento Esperado        |
| ---- | --------------------------------------- | ----------------------------- |
| 1    | Usuário seleciona plano grátis          | -                             |
| 2    | `requestPlanChange` detecta price === 0 | Ativa diretamente, sem Stripe |
| 3    | Cria novo clinic_plans                  | Status = "active"             |
| 4    | Cancela plano anterior                  | Status = "cancelled"          |

### Teste Manual

```bash
# Acessar /admin/plan
# Selecionar plano com price = 0
# Verificar: plano ativado, sem redirect Stripe
```

---

## 5. Cenário: Cancelamento via Stripe Portal (Clinic Admin)

### Fluxo Novo (Implementado)

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

### Fluxo Detalhado

| Step | Ação                                          | Comportamento Esperado             |
| ---- | --------------------------------------------- | ---------------------------------- |
| 1    | Usuário acessa `/admin/plan`                  | Vê botão "Gerenciar Assinatura"    |
| 2    | Clica em "Gerenciar Assinatura"               | Redirect para `/admin/plan/manage` |
| 3    | Na página, clica "Abrir Portal"               | POST `/api/portal`                 |
| 4    | API cria billing portal session               | Retorna URL do Stripe Portal       |
| 5    | Redirect para Stripe                          | Abre portal externo                |
| 6    | Usuário clica "Cancelar assinatura"           | Stripe pergunta confirmação        |
| 7    | Usuário confirma "Cancelar no fim do período" | Stripe seta `cancel_at_period_end` |
| 8    | Retorna para app                              | Verifica status continua "active"  |
| 9    | Dia do vencimento                             | Job marca como "expired"           |

### Pré-requisitos

```sql
-- Clinic precisa ter stripe_customer_id
SELECT stripe_customer_id FROM clinics WHERE id = 'clinic-uuid';
-- Se null, primeiro pagamento ainda não foi feito
```

### Teste Manual

```bash
# 1. Criar clínica e fazer pagamento (gera stripe_customer_id)
# 2. Acessar /admin/plan
# 3. Clicar "Gerenciar Assinatura"
# 4. Clicar "Abrir Portal de Pagamentos"
# 5. No Stripe Portal: Settings → Cancelar assinatura
# 6. Confirmar cancelamento
# 7. Verificar no banco: status continua "active", expires_at permanece
# 8. Após expires_at: job marca como "expired"
```

### Comportamentos Não Esperados (Bugs)

| Bug                             | Sintoma                    | Causa Provável                    |
| ------------------------------- | -------------------------- | --------------------------------- |
| Botão não aparece               | Link não visível na página | clínica sem stripe_customer_id    |
| Erro ao criar sessão            | API retorna erro 400/500   | stripe_customer_id inválido       |
| Redirect não funciona           | URL não redireciona        | Response não tem `data.url`       |
| Cancelamento não reflete no app | Status continua "active"   | Esperar job ou到期 para expirar   |
| Acesso corta imediatamente      | Cancelou e perdeu acesso   | Deveria manter até fim do período |

---

## 6. Checklist de Testes

### ✅ Pré-Condições

- [ ] Planos cadastrados no banco (tabela `plans`)
- [ ] Clínica com trial ativo após criação
- [ ] Stripe configurado (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] Webhook do Stripe pointing para produção

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
| E04 | Plano inativo        | POST com is_active = false         | Erro ou plano não shown   |
| E05 | Assinatura duplicada | Pagamento дубликат                 | Idempotência (ignora)     |
| E06 | Webhook repetido     | Reenviar webhook                   | Ignora ou atualiza status |
| E07 | Portal sem customer  | /api/portal sem stripe_customer_id | Erro 400                  |
| E08 | Portal timeout       | Stripe API não responde            | Erro 500                  |

---

## 6. Queries de Verificação

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

### Verificar clínicas expiradas

```sql
SELECT
  c.name,
  cp.status,
  cp.expires_at,
  EXTRACT(DAY FROM (cp.expires_at - NOW())) as days_until_expiry
FROM clinic_plans cp
JOIN clinics c ON c.id = cp.clinic_id
WHERE cp.status IN ('active', 'trial')
  AND cp.expires_at < NOW() + INTERVAL '7 days';
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

## 7. Variáveis de Ambiente Necessárias

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 8. Simulação de Webhook (Stripe CLI)

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

## 9. Fluxos de Error Handling

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

## 10. Monitoramento

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
