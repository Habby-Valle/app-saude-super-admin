# App Saúde - System Context

Documento de referência para manter consistência entre **Super Admin** e **Clinic Admin**.

---

## 1. Visão Geral do Sistema

### 1.1 Propósito

O **App Saúde** é uma plataforma SaaS multi-tenant para gestão de cuidados com pacientes (principalmente idosos), conectando cuidadores, familiares e contatos de emergência.

### 1.2 Arquitetura de Módulos

**Decisão**: Projeto **unificado** com Route Groups do Next.js.

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Saúde Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    app/ (mesmo projeto)                     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                             ││
│  │  ┌─────────────────────┐    ┌─────────────────────────┐   ││
│  │  │  (super-admin)/     │    │   (clinic-admin)/        │   ││
│  │  ├─────────────────────┤    ├─────────────────────────┤   ││
│  │  │ • Gerenciar clínicas│    │ • Gerenciar pacientes   │   ││
│  │  │ • Gerenciar admins  │    │ • Gerenciar cuidadores  │   ││
│  │  │ • Métricas globais  │    │ • Métricas da clínica  │   ││
│  │  │ • Config global     │    │ • Checklists           │   ││
│  │  │ • Auditoria total   │    │ • Turnos e registros   │   ││
│  │  └─────────────────────┘    └─────────────────────────┘   ││
│  │                                                             ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │           components/ (compartilhado)               │   ││
│  │  │  ui/  layout/  shared/  [entidade]/                │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Supabase Backend                         ││
│  │            (Auth + PostgreSQL + RLS)                       ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Estrutura de Pastas

```
app/
├── (auth)/                          # Login (compartilhado)
│   ├── login/
│   └── layout.tsx
│
├── (main)/                          # Rotas autenticadas
│   ├── (super-admin)/               # Super Admin
│   │   ├── dashboard/
│   │   ├── clinics/[id]/
│   │   ├── users/[id]/
│   │   ├── patients/[id]/
│   │   ├── checklists/[id]/
│   │   ├── reports/
│   │   ├── audit-logs/
│   │   └── settings/
│   │
│   ├── (clinic-admin)/             # Clinic Admin
│   │   ├── dashboard/
│   │   ├── patients/[id]/
│   │   ├── caregivers/
│   │   ├── shifts/
│   │   ├── checklists/
│   │   └── reports/
│   │
│   └── layout.tsx                   # Layout compartilhado
│       # Sidebar/Topbar adaptam por role
│
├── layout.tsx                       # Root layout
├── page.tsx                         # Redirect /dashboard
└── globals.css
```

---

## 2. Arquitetura Técnica

### 2.1 Stack Completa

| Camada            | Tecnologia                                    |
| ----------------- | --------------------------------------------- |
| **Framework**     | Next.js 16.x (App Router)                     |
| **UI**            | React 19                                      |
| **Linguagem**     | TypeScript (strict mode)                      |
| **Estilização**   | Tailwind CSS v4 + CSS Variables               |
| **Componentes**   | shadcn/ui + Radix UI                          |
| **Ícones**        | Lucide React                                  |
| **Estado Global** | Zustand                                       |
| **Estado Server** | TanStack Query                                |
| **Formulários**   | React Hook Form + Zod v4                      |
| **Banco**         | Supabase (PostgreSQL + Auth + RLS + Realtime) |
| **Notificações**  | Sonner (toasts)                               |
| **Deploy**        | Vercel                                        |

### 2.2 Estrutura de Pastas (obrigatória)

```
projeto/
├── app/
│   ├── (main)/                    # Rotas autenticadas
│   │   ├── layout.tsx             # Layout principal (sidebar + topbar)
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Server Component
│   │   │   └── actions.ts         # Server Actions
│   │   ├── [entidade]/
│   │   │   ├── page.tsx          # Lista + filtros
│   │   │   ├── [id]/page.tsx     # Detalhes (drill-down)
│   │   │   ├── actions.ts        # CRUD operations
│   │   │   └── components/       # Componentes específicos
│   │   └── settings/
│   │
│   ├── auth/
│   │   ├── login/
│   │   ├── layout.tsx
│   │
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Redirect para dashboard
│   └── globals.css
│
├── components/
│   ├── ui/                        # shadcn/ui (NÃO MODIFICAR)
│   ├── layout/                    # sidebar, topbar, providers
│   ├── [entidade]/               # Componentes por módulo
│   └── shared/                   # Componentes compartilhados
│
├── lib/
│   ├── supabase.ts               # Browser client
│   ├── supabase-server.ts        # Server client (SSR)
│   ├── supabase-admin.ts        # Admin client (bypass RLS)
│   ├── auth.ts                   # requireSuperAdmin()
│   ├── utils.ts                  # cn(), helpers
│   └── validations/              # Zod schemas
│       ├── auth.ts
│       ├── user.ts
│       ├── clinic.ts
│       ├── patient.ts
│       └── checklist.ts
│
├── types/
│   ├── database.ts               # Tipos do banco
│   ├── auth.ts                  # Tipos de autenticação
│   └── index.ts                 # Exports
│
├── store/
│   └── auth-store.ts            # Zustand store
│
├── hooks/
│   └── use-current-user.ts
│
├── docs/
├── public/
└── supabase/
    └── migrations/              # Migrations do banco
```

### 2.3 Convenções de Nomenclatura

| Tipo                 | Padrão          | Exemplo                                    |
| -------------------- | --------------- | ------------------------------------------ |
| **Arquivos**         | kebab-case      | `clinic-form.tsx`, `patient-table.tsx`     |
| **Componentes**      | PascalCase      | `ClinicForm`, `PatientTable`               |
| **Funções**          | camelCase       | `getPatientById`, `createClinic`           |
| **Variáveis**        | camelCase       | `patientName`, `clinicId`                  |
| **Tipos/Interfaces** | PascalCase      | `PatientDetails`, `UserFormValues`         |
| **Constantes**       | SCREAMING_SNAKE | `ROLE_LABELS`, `STATUS_COLORS`             |
| **Pastas**           | kebab-case      | `components/users/`, `app/(main)/clinics/` |

### 2.4 Padrões de Código

```typescript
// 1. Server Actions SEMPRE começam com "use server"
"use server"

import { revalidatePath } from "next/cache"
import { requireSuperAdmin } from "@/lib/auth"

export async function getEntity(params: {...}): Promise<Result> {
  const { supabase } = await requireSuperAdmin()
  // ... lógica
  return result
}

// 2. Mutações retornam { success, error? }
export async function createEntity(
  raw: EntityFormValues
): Promise<{ success: boolean; error?: string; id?: string }> {
  await requireSuperAdmin()

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  // ... lógica de criação

  revalidatePath("/entity")
  return { success: true, id: newId }
}

// 3. Validação Zod usa .issues (não .errors)
const result = schema.safeParse(data)
if (!result.success) {
  throw new Error(result.error.issues[0].message)
}

// 4. Server Components são o padrão
//    Client Components apenas quando necessário interactivity

// 5. Tipos explícitos SEMPRE (nunca use any)
interface UserDetails {
  user: User
  clinic: { id: string; name: string } | null
}

// 6. Loading states com Suspense
export default async function EntityPage({ params }: Props) {
  return (
    <Suspense fallback={<EntitySkeleton />}>
      <EntityContent id={params.id} />
    </Suspense>
  )
}
```

---

## 3. Autenticação e Permissões (RBAC)

### 3.1 Roles do Sistema

| Role                | Escopo  | Descrição                               |
| ------------------- | ------- | --------------------------------------- |
| `super_admin`       | Global  | Dono da plataforma, acesso total        |
| `clinic_admin`      | Clínica | Administrador de uma clínica específica |
| `caregiver`         | Clínica | Cuidador que atende pacientes           |
| `family`            | Clínica | Familiar de paciente                    |
| `emergency_contact` | Clínica | Contato de emergência                   |

### 3.2 Fluxo de Autenticação

```
┌──────────┐     ┌─────────────┐     ┌──────────────────┐
│  Usuário │────▶│ Login Page  │────▶│ Supabase Auth    │
└──────────┘     └─────────────┘     │ (email/password) │
                                      └────────┬─────────┘
                                               │
                                               ▼
                                      ┌──────────────────┐
                                      │ Session + Cookie │
                                      └────────┬─────────┘
                                               │
                    ┌──────────────────────────┴───────────────┐
                    ▼                                              ▼
         ┌──────────────────┐                        ┌──────────────────┐
         │   Super Admin    │                        │   Clinic Admin   │
         │ requireSuperAdmin│                        │ requireClinicAdmin│
         │  (verifica role) │                        │ (verifica clinic) │
         └──────────────────┘                        └──────────────────┘
```

### 3.3 Super Admin - `requireSuperAdmin()`

```typescript
// lib/auth.ts
export async function requireSuperAdmin(): Promise<SuperAdminContext> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // RPC call to avoid RLS recursion
  const { data: role } = await supabase.rpc("get_my_role")
  if (role !== "super_admin") redirect("/access-denied")

  return { user, supabase }
}
```

### 3.4 Clinic Admin - `requireClinicAdmin()` (a implementar)

```typescript
// lib/auth.ts (Clinic Admin)
export async function requireClinicAdmin(): Promise<ClinicAdminContext> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: role } = await supabase.rpc("get_my_role")
  if (role === "super_admin") {
    // Super admin pode acessar qualquer clínica
    return { user, clinicId: null, isSuperAdmin: true }
  }

  if (role !== "clinic_admin") redirect("/access-denied")

  // clinic_id vem do perfil do usuário
  const clinicId = user.clinic_id // ou via RPC

  return { user, clinicId, isSuperAdmin: false }
}
```

### 3.5 Multi-Tenancy

**Princípio**: Cada `clinic_id` é um tenant separado.

```typescript
// Super Admin vê TUDO (sem filtro de clínica)
const { data } = await supabase.from("patients").select("*")

// Clinic Admin vê apenas sua clínica
const { data } = await supabase
  .from("patients")
  .select("*")
  .eq("clinic_id", user.clinic_id) // Filtro obrigatório
```

### 3.6 Row Level Security (RLS)

O RLS do Supabase deve filtrar automaticamente por `clinic_id`:

```sql
-- Exemplo: policy para pacientes
CREATE POLICY "Users see own clinic patients"
ON patients FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users
    WHERE clinic_id = patients.clinic_id
    OR role = 'super_admin'
  )
);
```

---

## 4. Design System e UI

### 4.1 Configuração do Tailwind

```typescript
// tailwind.config.ts (ou arquivo de config)
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: "calc(var(--radius) - 2px)",
    },
  },
}
```

### 4.2 CSS Variables (globals.css)

O projeto usa **Tailwind CSS v4** com CSS Variables (OKLCH) para cores. Cada módulo (Super Admin e Clinic Admin) pode ter seu próprio tema.

```css
/* ============================
   SUPER ADMIN - Tema Neutro
   ============================ */

:root {
  /* Usar variáveis do tema padrão (neutro/slate) */
  --primary: oklch(0.45 0.15 250); /* Azul padrão */
  --primary-foreground: oklch(0.98 0 0);
  --background: oklch(1 0 0);
  --foreground: oklch(0.15 0 0);
  /* ... outras variáveis */
}

/* ============================
   CLINIC ADMIN - Tema Roxo
   ============================ */

.clinic-admin {
  --primary: oklch(0.45 0.15 300); /* Roxo #764b9d */
  --primary-foreground: oklch(0.98 0 0);
  --background: oklch(0.97 0.01 300); /* Lavanda #f6f4fe */
  --foreground: oklch(0.15 0 0);
  --card: oklch(1 0 0); /* White */
  --accent: oklch(0.92 0.03 300); /* Roxo claro */
  --sidebar: oklch(1 0 0);
  --sidebar-primary: oklch(0.45 0.15 300);
  /* ... outras variáveis */
}
```

### 4.2.1 Paleta de Cores Clinic Admin

| Cor             | Hex     | OKLCH                  | Uso                      |
| --------------- | ------- | ---------------------- | ------------------------ |
| `primary`       | #764b9d | `oklch(0.45 0.15 300)` | Botões, links, destaques |
| `primary-light` | #f6f4fe | `oklch(0.96 0.02 300)` | Backgrounds suaves       |
| `white`         | #ffffff | `oklch(1 0 0)`         | Cards, sidebar, inputs   |
| `accent`        | #9d6bb5 | `oklch(0.55 0.10 300)` | Hover states, bordas     |
| `foreground`    | #1a1a1a | `oklch(0.15 0 0)`      | Texto principal          |

### 4.2.2 Implementação do Tema

```css
/* globals.css */
@layer base {
  /* Super Admin - Tema padrão */
  :root { ... }

  /* Clinic Admin - Tema Roxo */
  .clinic-admin {
    --primary: oklch(0.45 0.15 300);
    --background: oklch(0.97 0.01 300);
    --foreground: oklch(0.15 0 0);
    --card: oklch(1 0 0);
    --accent: oklch(0.92 0.03 300);
    --border: oklch(0.90 0.02 300);
    --ring: oklch(0.45 0.15 300);
  }
}

/* Aplica tema roxo no layout do Clinic Admin */
.clinic-admin body {
  background-color: oklch(0.97 0.01 300);
}
```

### 4.2.3 Aplicação por Layout

```tsx
// Super Admin Layout (tema padrão)
export default function SuperAdminLayout({ children }) {
  return <div>{children}</div>
}

// Clinic Admin Layout (tema roxo)
export default function ClinicAdminLayout({ children }) {
  return <div className="clinic-admin">{children}</div>
}
```

### 4.3 Componentes shadcn/ui

**Instalados:**

- `button`, `input`, `label`, `textarea`
- `card`, `badge`, `avatar`
- `dialog`, `alert-dialog`, `sheet`
- `select`, `tabs`, `switch`, `checkbox`
- `table`, `skeleton`, `separator`
- `dropdown-menu`, `tooltip`
- `alert`, `sonner` (toast)

**Uso padrão:**

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
```

### 4.4 Layout de Página

```tsx
export default function Page() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header com título e ações */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Título</h1>
        <Button>Nova Entidade</Button>
      </div>

      {/* Cards de estatísticas (opcional) */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>...</Card>
      </div>

      {/* Tabela ou conteúdo principal */}
      <EntityTable ... />
    </div>
  )
}
```

### 4.5 Tabela com Paginação (padrão)

```tsx
export function EntityTable({ entities, total, page, pageSize, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2">
        <Input placeholder="Buscar..." />
        <Select>...</Select>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>...</Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span>{total} resultados</span>
          <div className="flex gap-2">
            <Button disabled={page <= 1}>Anterior</Button>
            <span>
              {page} / {totalPages}
            </span>
            <Button disabled={page >= totalPages}>Próxima</Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 4.6 Formulários (padrão)

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { entitySchema, EntityFormValues } from "@/lib/validations/entity"

export function EntityForm({ onSubmit, defaultValues }) {
  const form = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Salvar</Button>
      </form>
    </Form>
  )
}
```

---

## 5. Banco de Dados

### 5.1 Schema Principal

```sql
-- Clínicas
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active', -- active, inactive, suspended
  plan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Usuários (perfil público)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  clinic_id UUID REFERENCES clinics(id), -- NULL para super_admin
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL, -- super_admin, clinic_admin, caregiver, family, emergency_contact
  status TEXT DEFAULT 'active', -- active, blocked
  created_at TIMESTAMPTZ DEFAULT now(),
  last_sign_in_at TIMESTAMPTZ
);

-- Pacientes
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  contractor_id UUID REFERENCES clinics(id),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cuidadores <> Pacientes (relação N:N)
CREATE TABLE caregiver_patient (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES users(id),
  patient_id UUID REFERENCES patients(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Templates de Checklist
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id), -- NULL = template global
  name TEXT NOT NULL,
  icon TEXT,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Itens de Checklist
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- boolean, text, number, select
  required BOOLEAN DEFAULT false,
  has_observation BOOLEAN DEFAULT false
);

-- Opções de Item (para tipo 'select')
CREATE TABLE checklist_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL
);

-- Turnos
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  caregiver_id UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress' -- in_progress, completed, cancelled
);

-- Registros de Checklist por Turno
CREATE TABLE shift_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES shifts(id),
  checklist_id UUID REFERENCES checklists(id),
  status TEXT DEFAULT 'pending', -- pending, completed
  observation TEXT
);

-- Logs de Auditoria
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sistema SOS
-- Tabela principal de alertas de emergência
CREATE TABLE sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  triggered_by UUID NOT NULL REFERENCES users(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  notes TEXT,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de notificações SOS (destinatários)
CREATE TABLE sos_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_alert_id UUID NOT NULL REFERENCES sos_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  channel TEXT NOT NULL CHECK (channel IN ('push', 'email', 'sms')),
  recipient TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.2 Diferenciação de Dados Globais vs Por Clínica

| Tabela              | Escopo  | Comentário                     |
| ------------------- | ------- | ------------------------------ |
| `clinics`           | Global  | Lista de todas as clínicas     |
| `users`             | Misto   | `clinic_id` NULL = super_admin |
| `patients`          | Clínica | Sempre tem `clinic_id`         |
| `checklists`        | Misto   | `clinic_id` NULL = global      |
| `shifts`            | Clínica | Sempre tem `clinic_id`         |
| `audit_logs`        | Misto   | Log de todas as ações          |
| `sos_alerts`        | Clínica | Sempre tem `clinic_id`         |
| `sos_notifications` | Clínica | Relacionado ao SOS             |

### 5.3 Função RPC de Role

```sql
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. API e Integração

### 6.1 Comunicação entre Sistemas

Os dois sistemas (Super Admin e Clinic Admin) compartilham:

1. **Mesmas tabelas Supabase** - dados persistidos no mesmo banco
2. **Mesmas validações Zod** - podem ser extraídas para um pacote shared
3. **Mesmos tipos TypeScript** - `types/database.ts`

```
┌──────────────────┐     ┌──────────────────┐
│    Super Admin   │     │   Clinic Admin   │
│  (app-saude-     │     │  (app-saude-     │
│   super-admin)   │     │   admin)         │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         │    ┌────────────────────┘
         │    │   types/database.ts (compartilhado)
         │    │   lib/validations/*.ts (compartilhado)
         ▼    ▼
┌──────────────────────────────────────┐
│              Supabase                 │
│  ┌─────────┐  ┌──────────────────┐   │
│  │   Auth  │  │   PostgreSQL    │   │
│  │         │  │  + RLS Policies  │   │
│  └─────────┘  └──────────────────┘   │
└──────────────────────────────────────┘
```

### 6.2 Tipos Compartilhados (recomendado)

Para manter consistência, crie um pacote `packages/shared`:

```
packages/
└── shared/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── types/
        │   └── database.ts      # Tipos do banco
        ├── validations/
        │   ├── auth.ts
        │   ├── user.ts
        │   ├── patient.ts
        │   └── index.ts
        └── utils/
            └── cn.ts
```

**Uso:**

```typescript
// No Clinic Admin
import { Patient } from "@app-saude/shared/types"
import { patientFiltersSchema } from "@app-saude/shared/validations"
```

### 6.3 Padrão de Server Actions

```typescript
// ─── Listar (com paginação e filtros) ─────────────────────────
export async function getPatients(params: {
  search?: string
  clinicId?: string
  page?: number
  pageSize?: number
}): Promise<{ patients: Patient[]; total: number }>

// ─── Criar ────────────────────────────────────────────────────
export async function createPatient(
  raw: PatientFormValues
): Promise<{ success: boolean; error?: string; id?: string }>

// ─── Atualizar ────────────────────────────────────────────────
export async function updatePatient(
  id: string,
  raw: PatientFormValues
): Promise<{ success: boolean; error?: string }>

// ─── Buscar por ID (com detalhes relacionados) ─────────────────
export async function getPatientById(id: string): Promise<PatientDetails | null>

// ─── Ações específicas ────────────────────────────────────────
export async function linkCaregiverToPatient(
  patientId: string,
  caregiverId: string
): Promise<{ success: boolean; error?: string }>
```

### 6.4 Reativas (opcional para Clinic Admin)

Para o app de Cuidadores (mobile), usar Realtime:

```typescript
// Inscrever em mudanças de turnos
supabase
  .channel("shifts")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "shifts" },
    (payload) => {
      // Atualizar UI em tempo real
    }
  )
  .subscribe()
```

---

## 7. Regras de Consistência

### 7.1 O que DEVE ser idêntico

| Item                                  | Motivo                           |
| ------------------------------------- | -------------------------------- |
| **Estrutura de pastas**               | Familiaridade e manutenibilidade |
| **Convenções de nomenclatura**        | Clareza e consistência           |
| **Componentes UI (`components/ui/`)** | Design system unificado          |
| **Validações Zod**                    | Regras de negócio consistentes   |
| **Tipos TypeScript**                  | Type-safety em todo lugar        |
| **Funções de autenticação**           | Segurança consistente            |
| **RLS policies**                      | Isolamento de dados              |

### 7.2 O que PODE ser diferente

| Item                    | Diferença permitida                            |
| ----------------------- | ---------------------------------------------- |
| **Rotas/páginas**       | Clinic Admin tem escopo menor                  |
| **Menu sidebar**        | Itens específicos por role                     |
| **Dashboard KPIs**      | Métricas relevantes por contexto               |
| **Features exclusivas** | Super Admin: settings globais, planos          |
| **UI layout**           | Pode ter drawer em vez de página para detalhes |
| **Estilização**         | Classes customizadas além do shadcn            |

### 7.3 Checklist de Implementação

Ao criar o Clinic Admin, verifique:

- [ ] Mesma estrutura de pastas (`app/(main)/`, `components/`, `lib/`)
- [ ] Componentes shadcn/ui instalados (copiar `components/ui/`)
- [ ] Tipos copiados ou via pacote shared
- [ ] Validações Zod compartilhadas
- [ ] `requireClinicAdmin()` implementado
- [ ] RLS policies cubram Clinic Admin role
- [ ] Sidebar refletindo escopo do Clinic Admin
- [ ] Mesma estratégia de Server Components

### 7.4 Boas Práticas

1. **Nunca exponha credenciais admin ao cliente**
   - Usar `supabase-admin.ts` apenas em Server Actions

2. **Sempre validar inputs no servidor**
   - Zod validation no server + client

3. **Usar Suspense para loading states**
   - Nunca mostrar spinner genérico

4. **Revalidar paths após mutações**

   ```typescript
   revalidatePath("/patients")
   revalidatePath(`/patients/${id}`)
   ```

5. **Tratamento de erros consistente**

   ```typescript
   if (error) {
     console.error("[action]", error)
     return { success: false, error: error.message }
   }
   ```

6. **Testar com diferentes roles**
   - Verificar RLS filtrando corretamente

---

## 7. Sistema SOS (Alertas de Emergência)

### 7.1 Visão Geral

Sistema para resposta rápida a emergências envolvendo pacientes. Quando um cuidador ou familiar detecta uma situação crítica, pode acionar o botão SOS para notificar imediatamente a clínica e familiares.

### 7.2 Fluxo Completo

```
┌─────────────┐      1. Clica SOS       ┌──────────────────┐
│   App       │ ─────────────────────▶  │   Supabase       │
│ Cuidador/   │                         │   (trigger)      │
│  Família    │                         └────────┬─────────┘
└─────────────┘                                │
                                               ▼
                              ┌───────────────────────────────┐
                              │  2. Cria registro sos_alerts  │
                              │     status: 'active'          │
                              └───────────────────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
           ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
           │  App Família  │         │ Clinic Admin  │         │ Super Admin  │
           │ (push notify) │         │  (dashboard)  │         │  (dashboard) │
           └───────────────┘         └───────────────┘         └───────────────┘
                                          │
                                          ▼
                               ┌─────────────────────────┐
                               │  3. Admin confirma     │
                               │  ou resolve o alerta   │
                               └─────────────────────────┘
```

### 7.3 Status do Alerta

| Status         | Descrição                                |
| -------------- | ---------------------------------------- |
| `active`       | Alerta recém-criado, aguardando resposta |
| `acknowledged` | Admin viu e está trabalhando no caso     |
| `resolved`     | Situação resolvida                       |

### 7.4 Canais de Notificação

| Canal   | Uso                                               |
| ------- | ------------------------------------------------- |
| `push`  | Push notification via Firebase/Expo (apps móveis) |
| `email` | Email para contatos de emergência                 |
| `sms`   | SMS para contatos de emergência                   |

### 7.5 Destinatários do SOS

Ao criar um SOS, os seguintes usuários recebem notificação:

1. **Todos os admins da clínica** (`role = 'clinic_admin'`)
2. **Familiares vinculados ao paciente** (`role = 'family'`)
3. **Cuidadores vinculados ao paciente** (`role = 'caregiver'`)
4. **Contatos de emergência** (via `emergency_contacts`)

### 7.6 Tipos TypeScript

```typescript
// types/sos.ts

export type SosStatus = "active" | "acknowledged" | "resolved"

export type NotificationChannel = "push" | "email" | "sms"

export type NotificationStatus = "pending" | "sent" | "delivered" | "failed"

export interface SosAlert {
  id: string
  patient_id: string
  triggered_by: string
  clinic_id: string
  status: SosStatus
  location_lat: number | null
  location_lng: number | null
  notes: string | null
  acknowledged_by: string | null
  resolved_at: string | null
  created_at: string
}

export interface SosNotification {
  id: string
  sos_alert_id: string
  user_id: string | null
  channel: NotificationChannel
  recipient: string
  status: NotificationStatus
  sent_at: string | null
  created_at: string
}
```

### 7.7 Server Actions (SOS)

```typescript
// app/(main)/sos/actions.ts

// Criar novo SOS
export async function createSosAlert(params: {
  patientId: string
  triggeredBy: string
  clinicId: string
  locationLat?: number
  locationLng?: number
  notes?: string
}): Promise<{ success: boolean; error?: string; id?: string }>

// Acknowledge SOS
export async function acknowledgeSosAlert(
  alertId: string,
  acknowledgedBy: string
): Promise<{ success: boolean; error?: string }>

// Resolve SOS
export async function resolveSosAlert(
  alertId: string
): Promise<{ success: boolean; error?: string }>

// Listar SOS (Super Admin: todos, Clinic Admin: filtrado)
export async function getSosAlerts(params: {
  status?: SosStatus | "all"
  clinicId?: string
  page?: number
  pageSize?: number
}): Promise<{ alerts: SosAlert[]; total: number }>
```

### 7.8 Rotas SOS

| Módulo       | Rota         | Descrição                            |
| ------------ | ------------ | ------------------------------------ |
| Super Admin  | `/sos`       | Visor global de SOS (todas clínicas) |
| Super Admin  | `/dashboard` | Card SOS pendentes                   |
| Clinic Admin | `/sos`       | SOS da clínica específica            |
| Clinic Admin | `/dashboard` | Card SOS pendentes da clínica        |

### 7.9 RLS Policies

```sql
-- SOS Alerts: acesso por clinic_id
CREATE POLICY "Users see clinic sos_alerts"
ON sos_alerts FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users
    WHERE clinic_id = sos_alerts.clinic_id
    OR role = 'super_admin'
  )
);

-- SOS Notifications: acesso via sos_alerts
CREATE POLICY "Users see clinic sos_notifications"
ON sos_notifications FOR SELECT
USING (
  sos_alert_id IN (
    SELECT id FROM sos_alerts WHERE clinic_id IN (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  )
);
```

---

## 8. Resumo Rápido para Novo Desenvolvedor

### Setup

```bash
# Clonar projeto base
git clone <repo> app-saude-clinic-admin
cd app-saude-clinic-admin

# Instalar dependências
npm install

# Copiar componentes UI
# (Execute init.sh do shadcn/ui se disponível)

# Configurar ambiente
cp .env.example .env.local
# Preencher NEXT_PUBLIC_SUPABASE_*
```

### Fluxo de Desenvolvimento

1. **Criar tipos** → `types/database.ts`
2. **Criar validações** → `lib/validations/entity.ts`
3. **Criar actions** → `app/(main)/entity/actions.ts`
4. **Criar componentes** → `components/entity/*.tsx`
5. **Criar página** → `app/(main)/entity/page.tsx`
6. **Adicionar ao menu** → `components/layout/sidebar.tsx`
7. **Testar** → Build + lint + typecheck

### Comandos Úteis

```bash
npm run dev          # Development
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript
```

### Arquivos de Referência

- **Autenticação**: `lib/auth.ts` → `requireSuperAdmin()`
- **Tipos**: `types/database.ts`
- **Layout**: `app/(main)/layout.tsx`
- **Sidebar**: `components/layout/sidebar.tsx`
- **Formulários**: `components/users/user-form.tsx`
- **Tabelas**: `components/users/user-table.tsx`
- **Validações**: `lib/validations/user.ts`

---

_Documento criado para manter consistência entre módulos. Atualize quando houver mudanças na arquitetura._
