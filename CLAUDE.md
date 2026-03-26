# CLAUDE.md - App Saúde (Painel Administrativo Unificado)

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
│   │   └── sos/          # Sistema SOS (visor global)
│   │
│   ├── (clinic-admin)/  # Clinic Admin routes
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── caregivers/
│   │   ├── shifts/
│   │   ├── checklists/
│   │   ├── reports/
│   │   └── sos/          # Sistema SOS da clínica
│   │
│   └── layout.tsx       # Layout compartilhado (sidebar dinâmica)
│
├── layout.tsx           # Root layout
├── page.tsx             # Redirect baseado no role
└── globals.css
```

## Tech Stack (obrigatório seguir)

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript (strict mode)
- **Estilo**: Tailwind CSS v4 + shadcn/ui + lucide-react
- **Backend/Database**: Supabase (Auth + PostgreSQL + RLS + Realtime)
- **Estado**: Zustand + TanStack Query
- **Formulários**: React Hook Form + Zod
- **Deploy**: Vercel + Supabase
- **Lint/Formatação**: ESLint + Prettier

## Estrutura de Pastas Obrigatória

```bash
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
│   │   └── settings/
│   │
│   ├── (clinic-admin)/    # Clinic Admin
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── caregivers/
│   │   ├── shifts/
│   │   ├── checklists/
│   │   └── reports/
│   │
│   └── layout.tsx        # Layout com sidebar dinâmica
│
├── layout.tsx
├── page.tsx
└── globals.css

components/
├── ui/                   # shadcn/ui (NÃO MODIFICAR)
├── layout/               # sidebar, topbar, providers
├── super-admin/          # Componentes específicos Super Admin
├── clinic-admin/         # Componentes específicos Clinic Admin
├── shared/               # Componentes compartilhados
└── [entidade]/           # Componentes por entidade (shared)

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

docs/
└── SYSTEM-CONTEXT.md     # Documento de contexto do sistema
```

## Roles e Escopo

| Role           | Escopo             | Rotas                   |
| -------------- | ------------------ | ----------------------- |
| `super_admin`  | Global             | `(super-admin)/*`       |
| `clinic_admin` | Clínica específica | `(clinic-admin)/*`      |
| `caregiver`    | Clínica específica | App Cuidadores (futuro) |
| `family`       | Clínica específica | App Familiares (futuro) |

## Sistema SOS

Sistema de alertas de emergência:

- **Tabelas**: `sos_alerts`, `sos_notifications`
- **Fluxo**: Cuidador/Família clica SOS → Notificação push → Admin confirma/resolve
- **Super Admin**: `/super-admin/sos` - visor global de todas as clínicas
- **Clinic Admin**: `/clinic-admin/sos` - SOS da clínica específica

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

## Workflow Obrigatório

Sempre siga Spec-Driven Development:

PRD → Tech Spec → Implementation Plan → Código (feature por feature)

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

## Documentação de Referência

- `docs/SYSTEM-CONTEXT.md` - Contexto técnico completo do sistema
- `docs/IMPLEMENTATION-PLAN.md` - Plano de implementação
- `docs/database-schema.md` - Schema do banco de dados

---

Você é um engenheiro sênior. Priorize código limpo, seguro, escalável e preparado para multi-tenant.
