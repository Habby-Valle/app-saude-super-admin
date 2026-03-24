# CLAUDE.md - App Saúde (Super Admin Dashboard)

## Visão Geral do Projeto

O **App Saúde** é uma plataforma completa para gestão de cuidados com pacientes (principalmente idosos), conectando cuidadores, familiares e contatos de emergência.

Este projeto atual é o **Painel Super Admin (Sudo)** — o ambiente de maior privilégio da plataforma. Nele o dono da empresa ou rede tem controle total sobre todas as clínicas, usuários, configurações globais, faturamento e métricas estratégicas.

### Escopo deste Projeto (Super Admin)
- Gerenciar múltiplas clínicas/unidades
- Cadastrar e gerenciar administradores de clínicas
- Monitorar performance global da plataforma
- Configurar planos, assinaturas e funcionalidades
- Visualizar relatórios consolidados e auditoria
- Definir configurações globais do sistema (checklists padrão, alertas, etc.)

### Arquitetura da Plataforma (Contexto)
A plataforma App Saúde será composta por:
1. **Super Admin Dashboard** ← **Este projeto**
2. **Admin por Clínica**
3. **Aplicativo para Cuidadores e Familiares**

## Tech Stack (obrigatório seguir)
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript (strict mode)
- **Estilo**: Tailwind CSS + shadcn/ui + lucide-react
- **Backend/Database**: Supabase (Auth + PostgreSQL + RLS + Realtime)
- **Estado**: Zustand + TanStack Query
- **Formulários**: React Hook Form + Zod
- **Deploy**: Vercel + Supabase
- **Lint/Formatação**: ESLint + Prettier + Husky

## Estrutura de Pastas Obrigatória

```bash
app/
├── (main)/
│   ├── dashboard/
│   ├── clinics/
│   ├── users/
│   ├── patients/
│   ├── settings/
│   ├── reports/
│   └── layout.tsx
├── auth/
│   ├── login/
│   └── layout.tsx
├── layout.tsx
├── globals.css
└── page.tsx

components/
├── ui/                    ← shadcn/ui
├── clinics/
├── users/
├── patients/
└── layout/

lib/
├── supabase.ts
├── utils.ts
└── validations.ts

store/
hooks/
types/
public/
docs/
.claude/
```
## Regras de Código (sempre seguir)

- Sempre use TypeScript com tipos explícitos
- Server Components por padrão, Client Components apenas quando necessário
- Nome de arquivos: kebab-case
- Nome de componentes: PascalCase
- Nunca use any
- Todas as chamadas ao Supabase devem ter loading + error states
- Use Server Actions para mutações sensíveis
- Commits seguem Conventional Commits
-Priorize segurança, performance e clareza de interface

## Workflow Obrigatório
Sempre siga Spec-Driven Development:

PRD → 2. Tech Spec → 3. Implementation Plan → 4. Código (feature por feature)

Você é um engenheiro sênior. Priorize código limpo, seguro, escalável e preparado para multi-tenant.

