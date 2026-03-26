# Tech Spec - App Saúde (Painel Administrativo Unificado)

## Arquitetura

### Decisão de Arquitetura

Painel administrativo **unificado** em um único projeto Next.js, usando **Route Groups** para separar Super Admin e Clinic Admin.

```
app/
├── (auth)/           # Login compartilhado
├── (main)/
│   ├── (super-admin)/ # Super Admin - rotas com prefixo /super-admin/* (opcional)
│   └── (clinic-admin)/ # Clinic Admin - rotas com prefixo /admin/*
```

### Benefícios

- Código 100% compartilhado (componentes UI, types, validações)
- Deploy único e simples
- Consistência garantida de design
- CI/CD simplificado
- RLS do Supabase garante isolamento de dados

## Stack Técnica

- Next.js 16.x (App Router) + React 19
- TypeScript strict mode
- Tailwind CSS v4 + shadcn/ui + Radix UI
- Supabase (PostgreSQL + Auth + RLS)
- TanStack Query + Zustand
- React Hook Form + Zod v4

## Design System - Temas

### Super Admin - Tema Neutro

Tema padrão shadcn/ui (cores neutras/slate)

### Clinic Admin - Tema Roxo

Cores customizadas para diferenciação visual:

| Elemento   | Cor     | Hex     | OKLCH                  |
| ---------- | ------- | ------- | ---------------------- |
| Primary    | Roxo    | #764b9d | `oklch(0.45 0.15 300)` |
| Background | Lavanda | #f6f4fe | `oklch(0.97 0.01 300)` |
| Card       | White   | #ffffff | `oklch(1 0 0)`         |

**Implementação**: Classe `.clinic-admin` no layout do `(clinic-admin)/layout.tsx`

## Módulos do Sistema

### Super Admin (`app/(main)/(super-admin)/`)

| Rota          | Descrição                        |
| ------------- | -------------------------------- |
| `/dashboard`  | KPIs globais da plataforma       |
| `/clinics`    | CRUD completo de clínicas        |
| `/users`      | Gestão de usuários (todos roles) |
| `/patients`   | Visão global de pacientes        |
| `/checklists` | Templates de checklists          |
| `/reports`    | Relatórios consolidados          |
| `/audit-logs` | Logs de auditoria                |
| `/settings`   | Configurações globais            |
| `/sos`        | Sistema SOS - visor global       |

### Clinic Admin (`app/(main)/(clinic-admin)/`)

| Rota          | Descrição                  |
| ------------- | -------------------------- |
| `/dashboard`  | KPIs da clínica específica |
| `/patients`   | Pacientes da clínica       |
| `/caregivers` | Cuidadores da clínica      |
| `/shifts`     | Turnos e registros         |
| `/checklists` | Checklists da clínica      |
| `/sos`        | Sistema SOS da clínica     |
| `/reports`    | Relatórios da clínica      |

## Regras de Acesso

| Role           | Acesso                                                   |
| -------------- | -------------------------------------------------------- |
| `super_admin`  | Todas as rotas, visualização sem filtros                 |
| `clinic_admin` | Apenas rotas de `clinic-admin`, filtrado por `clinic_id` |
| `caregiver`    | App Cuidadores (futuro)                                  |
| `family`       | App Familiares (futuro)                                  |

## Multi-Tenancy

### Princípio

Cada `clinic_id` representa um tenant separado. O RLS do Supabase deve filtrar automaticamente.

### Query Patterns

```typescript
// Super Admin - vê tudo
const { data } = await supabase.from("patients").select("*")

// Clinic Admin - vê apenas sua clínica
const { data } = await supabase
  .from("patients")
  .select("*")
  .eq("clinic_id", user.clinic_id)
```

## Modelos de Dados

Baseado no diagrama ER (ver `docs/database-schema.md`)

---

## Sistema SOS

### Visão Geral

Sistema de alertas de emergência para resposta rápida a situações críticas envolvendo pacientes.

### Fluxo

1. Cuidador/Familiar clica botão SOS no app
2. Cria registro em `sos_alerts` (status: 'active')
3. Identifica destinatários (clinic_admin + family + emergency_contacts)
4. Cria registros em `sos_notifications`
5. Envia Push Notification via Firebase/Expo
6. Destinatários recebem alerta no app
7. Admin confirma (acknowledge) ou resolve o alerta

### Tabelas

```sql
-- Tabela principal de SOS
CREATE TABLE sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  triggered_by UUID REFERENCES users(id) NOT NULL,
  clinic_id UUID REFERENCES clinics(id) NOT NULL,
  status TEXT DEFAULT 'active', -- active, acknowledged, resolved
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  notes TEXT,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de notificações SOS
CREATE TABLE sos_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_alert_id UUID REFERENCES sos_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  channel TEXT NOT NULL, -- push, email, sms
  recipient TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, failed
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Checklist de Implementação Clinic Admin

### Fase 1: Foundation

- [ ] Implementar `requireClinicAdmin()` em `lib/auth.ts`
- [ ] Criar layout para `(clinic-admin)` com sidebar específica
- [ ] Criar `redirectToClinicDashboard()` helper

### Fase 2: Core

- [ ] Dashboard da clínica com KPIs locais
- [ ] Lista de pacientes da clínica
- [ ] Lista de cuidadores da clínica
- [ ] Gestão de turnos

### Fase 3: Operations

- [ ] Execução de checklists durante turnos
- [ ] Relatórios específicos da clínica
- [ ] Configurações da clínica (para admin)

### Fase 4: SOS

- [ ] Criar tabelas `sos_alerts` e `sos_notifications` no banco
- [ ] Implementar server actions para SOS
- [ ] Criar página `/sos` no Super Admin (visor global)
- [ ] Criar página `/sos` no Clinic Admin
- [ ] Dashboard cards com SOS pendentes
- [ ] Ações: acknowledge, resolve

---

Esta spec será atualizada conforme o desenvolvimento progredir.
