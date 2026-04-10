# CLAUDE.md - App Saúde (Painel Administrativo Unificado)

> Este é o documento principal de referência para a IA. Voir aussi: `docs/INDEX.md` para índice completo da documentação.

---

## Visão Geral do Projeto

O **App Saúde** é uma plataforma completa para gestão de cuidados com pacientes (principalmente idosos), conectando cuidadores, familiares e contatos de emergência.

Este projeto é um **Painel Administrativo Unificado** com dois ambientes de acesso via route groups:

1. **Super Admin** - Dono da plataforma, acesso total
2. **Clinic Admin** - Administrador de uma clínica específica

### Arquitetura de Módulos (Route Groups)

```
app/
├── (auth)/              # Login (compartilhado)
│   ├── login/
│   └── layout.tsx
│
├── (main)/
│   ├── (super-admin)/   # Super Admin routes
│   │   ├── dashboard/
│   │   ├── clinics/
│   │   ├── users/
│   │   ├── patients/
│   │   ├── checklists/
│   │   ├── reports/
│   │   ├── audit-logs/
│   │   ├── settings/
│   │   ├── sos/          # Sistema SOS (visor global)
│   │   ├── subscriptions/ # Assinaturas
│   │   └── payments/     # Cobranças
│   │
│   ├── (clinic-admin)/  # Clinic Admin routes
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── caregivers/
│   │   ├── shifts/
│   │   ├── checklists/
│   │   ├── reports/
│   │   ├── sos/          # Sistema SOS da clínica
│   │   └── admin/plan/   # Gestão de plano
│   │
│   └── layout.tsx       # Layout compartilhado (sidebar dinâmica)
│
├── layout.tsx           # Root layout
├── page.tsx             # Redirect baseado no role
└── globals.css
```

---

## Tech Stack (obrigatório seguir)

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript (strict mode)
- **Estilo**: Tailwind CSS v4 + shadcn/ui + lucide-react
- **Backend/Database**: Supabase (Auth + PostgreSQL + RLS + Realtime)
- **Estado**: Zustand + TanStack Query
- **Formulários**: React Hook Form + Zod
- **Deploy**: Vercel + Supabase
- **Lint/Formatação**: ESLint + Prettier

---

## Design System - Temas por Módulo

Cada módulo admin possui seu próprio tema visual:

### Super Admin - Tema Neutro

- Cores padrão shadcn/ui (neutro/slate)
- Uso: gestão global da plataforma

### Clinic Admin - Tema Roxo

- **Primary**: #764b9d (oklch 0.45 0.15 300)
- **Background**: #f6f4fe (oklch 0.97 0.01 300)
- **Cards/Sidebar**: White (#ffffff)
- Aplicado via classe `.clinic-admin` no layout

### Implementação (globals.css)

```css
.clinic-admin {
  --primary: oklch(0.45 0.15 300); /* Roxo */
  --background: oklch(0.97 0.01 300); /* Lavanda */
  --foreground: oklch(0.15 0 0); /* Texto escuro */
  --card: oklch(1 0 0); /* White */
}
```

---

## Estrutura de Pastas Obrigatória

```
app/
├── (auth)/               # Rotas de autenticação
│   ├── login/
│   └── layout.tsx
│
├── (main)/               # Rotas autenticadas
│   ├── (super-admin)/    # Super Admin
│   │   ├── dashboard/
│   │   ├── clinics/
│   │   ├── users/
│   │   ├── patients/
│   │   ├── checklists/
│   │   ├── reports/
│   │   ├── audit-logs/
│   │   ├── settings/
│   │   ├── subscriptions/
│   │   └── payments/
│   │
│   ├── (clinic-admin)/    # Clinic Admin
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── caregivers/
│   │   ├── shifts/
│   │   ├── checklists/
│   │   └── admin/plan/
│   │
│   └── layout.tsx        # Layout com sidebar dinâmica
│
├── api/                  # API Routes
│   ├── checkout/         # Stripe checkout
│   ├── webhooks/stripe/  # Stripe webhooks
│   ├── portal/           # Stripe Portal
│   ├── subscriptions/    # Assinaturas
│   └── plans/            # Planos
│
├── layout.tsx
├── page.tsx
└── globals.css

components/
├── ui/                   # shadcn/ui (NÃO MODIFICAR)
├── layout/               # sidebar, topbar, providers
├── super-admin/          # Componentes específicos Super Admin
├── clinic-admin/         # Componentes específicos Clinic Admin
└── shared/               # Componentes compartilhados

lib/
├── supabase.ts           # Browser client
├── supabase-server.ts    # Server client (SSR)
├── supabase-admin.ts    # Admin client (bypass RLS)
├── auth.ts               # requireSuperAdmin(), requireClinicAdmin()
├── utils.ts
└── validations/          # Zod schemas (compartilhados)

types/
├── database.ts           # Tipos do banco (compartilhados)
├── auth.ts               # Tipos de autenticação
└── index.ts

store/
└── auth-store.ts         # Zustand store

supabase/
└── migrations/           # SQL migrations

docs/
├── INDEX.md              # Índice master (leia primeiro!)
├── SYSTEM-CONTEXT.md     # Contexto técnico completo
├── IMPLEMENTATION-PLAN.md # Plano de implementação
├── SUBSCRIPTION-SYSTEM.md # Sistema de billing
├── database-schema.md    # Schema do banco
└── ...                   # Outros docs em docs/INDEX.md
```

---

## Roles e Escopo

| Role           | Escopo             | Rotas                   |
| -------------- | ------------------ | ----------------------- |
| `super_admin`  | Global             | `(super-admin)/*`       |
| `clinic_admin` | Clínica específica | `(clinic-admin)/*`      |
| `caregiver`    | Clínica específica | App Cuidadores (futuro) |
| `family`       | Clínica específica | App Familiares (futuro) |

---

## Sistema SOS

Sistema de alertas de emergência:

- **Tabelas**: `sos_alerts`, `sos_notifications`
- **Fluxo**: Cuidador/Família clica SOS → Notificação push → Admin confirma/resolve
- **Super Admin**: `/super-admin/sos` - visor global de todas as clínicas
- **Clinic Admin**: `/admin/sos` - SOS da clínica específica

---

## Sistema de Assinaturas e Billing

### Fluxo

1. **Criação de clínica** → Trial automático de 14 dias (via trigger)
2. **Job diário** → Marca assinaturas expiradas
3. **Notificações** → 7/3/1 dias antes do vencimento
4. **Renovação** → Clinic Admin vai para `/admin/plan`
5. **Checkout** → Redirect para Stripe Checkout
6. **Webhook** → Ativa assinatura + salva payment + salva customer_id
7. **Portal** → Cancelamento via Stripe Portal

### APIs

| Rota                               | Descrição                 |
| ---------------------------------- | ------------------------- |
| `POST /api/checkout`               | Cria sessão Stripe        |
| `POST /api/webhooks/stripe`        | Recebe eventos Stripe     |
| `POST /api/portal`                 | Cria sessão Stripe Portal |
| `GET /api/subscriptions/[id]`      | Detalhes assinatura       |
| `POST /api/subscriptions/activate` | Ativação manual           |
| `GET /api/plans`                   | Lista planos              |

### Páginas

| Rota                              | Escopo | Descrição       |
| --------------------------------- | ------ | --------------- |
| `/admin/plan`                     | CA     | Gestão de plano |
| `/admin/plan/manage`              | CA     | Portal Stripe   |
| `/super-admin/subscriptions`      | SA     | Dashboard       |
| `/super-admin/subscriptions/[id]` | SA     | Detalhes        |
| `/super-admin/payments`           | SA     | Histórico       |

### Variáveis de Ambiente

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Regras de Código (sempre seguir)

- Sempre use TypeScript com tipos explícitos (nunca `any`)
- Server Components por padrão, Client Components apenas quando necessário
- Nome de arquivos: kebab-case
- Nome de componentes: PascalCase
- Todas as chamadas ao Supabase devem ter loading + error states
- Use Server Actions para mutações sensíveis
- Validação Zod usa `.issues[0].message` (não `.errors`)
- Mutações retornam `{ success: boolean; error?: string }`
- Use `startTransition` para async state updates
- Commits seguem Conventional Commits
- Priorize segurança, multi-tenancy e clareza de interface

---

## Workflow Obrigatório

Sempre siga Spec-Driven Development:

PRD → Tech Spec → Implementation Plan → Código (feature por feature)

---

## Autenticação e Proteção

### Super Admin

```typescript
// lib/auth.ts
export async function requireSuperAdmin() {
  // Verifica sessão + role === 'super_admin'
  // Retorna { user, supabase }
}
```

### Clinic Admin

```typescript
// lib/auth.ts
export async function requireClinicAdmin() {
  // Super admin pode acessar qualquer clínica
  // Clinic admin vê apenas sua clínica (via clinic_id)
  // Retorna { user, clinicId, isSuperAdmin }
}
```

### Verificação de Assinatura

```typescript
// lib/auth.ts
export async function requireActiveSubscription(clinicId: string) {
  const subscription = await getClinicSubscriptionStatus(clinicId)
  if (!subscription.isActive) {
    throw new Error("SUBSCRIPTION_EXPIRED")
  }
  return subscription
}
```

---

## Comandos Úteis

```bash
npm run dev          # Development
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript
```

---

## Documentação de Referência

| Documento                       | Descrição                            |
| ------------------------------- | ------------------------------------ |
| `docs/INDEX.md`                 | **Índice master** - ponto de entrada |
| `docs/SYSTEM-CONTEXT.md`        | Contexto técnico completo            |
| `docs/IMPLEMENTATION-PLAN.md`   | Plano de implementação               |
| `docs/SUBSCRIPTION-SYSTEM.md`   | Sistema de billing completo          |
| `docs/database-schema.md`       | Schema do banco de dados             |
| `docs/SUPABASE-RLS-POLICIES.md` | Políticas de segurança               |

---

## Fluxo de Leitura Recomendado

### Para entender o projeto

1. **CLAUDE.md** (este arquivo) - Visão geral
2. **docs/INDEX.md** - Índice completo
3. **docs/SYSTEM-CONTEXT.md** - Detalhes técnicos
4. **docs/IMPLEMENTATION-PLAN.md** - Features implementadas

### Para implementar uma feature

1. **Verificar docs/SUBSCRIPTION-SYSTEM.md** - Se existe spec
2. **Verificar docs/IMPLEMENTATION-PLAN.md** - Status atual
3. **Verificar supabase/migrations/** - SQL relacionado

---

## Links Úteis

- **Dashboard Super Admin**: `/super-admin/dashboard`
- **Dashboard Clinic Admin**: `/admin/dashboard`
- **Assinaturas (SA)**: `/super-admin/subscriptions`
- **Pagamentos (SA)**: `/super-admin/payments`
- **Plano (CA)**: `/admin/plan`
- **Gerenciar Assinatura (CA)**: `/admin/plan/manage`

---

Você é um engenheiro sênior. Priorize código limpo, seguro, escalável e preparado para multi-tenant.

---

_Última atualização: 2026-04-11_
