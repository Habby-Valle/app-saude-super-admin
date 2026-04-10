# Plano: Fluxo de Criação de Clínicas e Assinaturas

## Situação Atual

- Sistema de assinatura com trial automático já existe
- Super Admin pode criar clínicas manualmente no painel
- Clinic Admin pode acessar e gerenciar seu plano
- Checkout Stripe integrado

---

## Estratégia Proposta: Combo A + B

| Canal                  | Quando usar                              | Fluxo                                                         |
| ---------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| **Painel Super Admin** | Criar clínicas parceiras conocidas       | Super Admin cria → Clinic Admin recebe convite → faz login    |
| **Landing Page**       | Novos interessados se cadastram sozinhos | Landing → Cadastro → Trial automático (ou pendente aprovação) |

---

## Fluxo Detalhado

### 1. Via Super Admin (Painel)

```
Super Admin → /super-admin/clinics/new
        │
        ▼
Preenche dados da clínica
        │
        ▼
Cria clinic → Trigger ativa trial (14 dias)
        │
        ▼
Clinic Admin recebe acesso → faz login
        │
        ▼
Usa sistema durante trial → renova depois
```

### 2. Via Landing Page (Self-service)

```
Usuário → Landing Page
        │
        ▼
Clica "Começar Grátis" → Cadastro
        │
        ▼
Cria clínica → Trial ativado automaticamente
        │
        ▼
(A) Acesso direto (se automático)
        OU
(B) Pendente aprovação → Super Admin aprova → Ativa trial
```

---

## Decisões a Definir

### Item 1: Aprovação de Clínicas

| Opção                    | Descrição                                       | Prós                            | Contras                   |
| ------------------------ | ----------------------------------------------- | ------------------------------- | ------------------------- |
| **Aprovação manual**     | Super Admin aprova cada clínica antes de ativar | Controle total, valida clientes | Mais trabalho manual      |
| **Aprovação automática** | Qualquer um cria, trial ativa na hora           | Escalável, rápido               | Sem controle de qualidade |

**Pergunta**: Você quer que qualquer pessoa crie clínica sozinha, ou precisa de aprovação?

---

### Item 2: Ativação do Trial

| Opção                | Descrição                                                     |
| -------------------- | ------------------------------------------------------------- |
| **Trial automático** | Já funciona - ao criar clínica, trial ativa na hora           |
| **Trial pendente**   | Adicionar status "pending" → Super Admin aprova → Ativa trial |

**Pergunta**: O trial já ativa no signup ou precisa de aprovação do Super Admin?

---

### Item 3: Landing Page

| Opção           | Descrição                                   |
| --------------- | ------------------------------------------- |
| **Nova página** | Landing page dedicada com copy de conversão |
| **Reuse login** | Usar página de login/signup atual           |

**Pergunta**: Precisamos de landing page nova ou o login atual serve?

---

## O que já existe vs O que precisa criar

### Já existe ✅

- Trial automático via trigger (14 dias)
- Criação manual de clínica pelo Super Admin
- Página de gestão de plano (`/admin/plan`)
- Checkout Stripe (`/api/checkout`)
- Webhook de pagamento
- Dashboard de assinaturas (`/super-admin/subscriptions`)
- Histórico de pagamentos (`/super-admin/payments`)

### Precisa criar (futuro) 🛠️

- Landing page (se quiser self-service)
- Status "pending" para clínicas await approval
- Workflow de aprovação
- Email de boas-vindas com instruções
- Sistema de convite por email

---

## Próximos Passos (quando implementar)

1. **Definir estratégia de aprovação** (auto vs manual)
2. **Criar landing page** ou usar signup atual
3. **Adicionar status "pending"** na clínica (opcional)
4. **Workflow de aprovação** (se necessário)
5. **Email de boas-vindas** com instruções

---

## Resumo das Perguntas Abertas

1. **Aprovação**: Manual (Super Admin aprova) ou Automática (qualquer um cria)?

2. **Trial**: Ativa automaticamente no signup ou precisa de aprovação?

3. **Landing page**: Precisamos de página nova ou o login atual serve?

4. **Convite**: Super Admin envia convite por email ou clinic se auto-cria?

---

## Notas

- O sistema atual já funciona para o cenário "Super Admin cria clínica"
- O trial de 14 dias já está implementado via trigger no banco
- O checkout Stripe já processa pagamentos
- O cancelamento via Stripe Portal já foi implementado

---

_Documento criado em: 2026-04-11_
_Status: Planejado (não implementado)_
