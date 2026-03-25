# IMPLEMENTATION PLAN - App Saúde (Super Admin Dashboard)

> Documento vivo — atualizado a cada feature concluída.
> Seguindo: Spec-Driven Development → PRD → Tech Spec → Implementation Plan → Código

---

## Visão Geral

| #   | Feature                                  | Fase           | Prioridade | Status       |
| --- | ---------------------------------------- | -------------- | ---------- | ------------ |
| 1   | Configuração Completa da Base do Projeto | 1 - Foundation | 🔴 Crítico | ✅ Concluído |
| 2   | Autenticação e Gestão de Sessão          | 1 - Foundation | 🔴 Crítico | ✅ Concluído |
| 3   | Dashboard Global com KPIs                | 2 - Core       | 🔴 Crítico | ✅ Concluído |
| 4   | Gestão de Clínicas (CRUD completo)       | 2 - Core       | 🔴 Crítico | ✅ Concluído |
| 5   | Gestão de Usuários Admin                 | 2 - Core       | 🟠 Alto    | ✅ Concluído |
| 6   | Gestão de Pacientes (visão global)       | 3 - Operations | 🟠 Alto    | ✅ Concluído |
| 7   | Checklists Globais (templates)           | 3 - Operations | 🟡 Médio   | ✅ Concluído |
| 8   | Relatórios e Analytics                   | 4 - Insights   | 🟡 Médio   | ✅ Concluído |
| 9   | Auditoria e Logs                         | 4 - Insights   | 🟡 Médio   | ✅ Concluído |
| 10  | Configurações Globais (planos, sistema)  | 5 - Admin      | 🟢 Normal  | ✅ Concluído |
| 11  | Detalhes de Clínica (drill-down)         | 6 - Details    | 🟠 Alto    | ✅ Concluído |
| 12  | Detalhes de Usuário (perfil completo)    | 6 - Details    | 🟠 Alto    | ✅ Concluído |
| 13  | Detalhes de Paciente (prontuário)        | 6 - Details    | 🟠 Alto    | ⏸ Pendente   |
| 14  | Detalhes de Checklist (estatísticas)     | 6 - Details    | 🟠 Alto    | ⏸ Pendente   |

---

## FASE 1 — Foundation (Features 1 e 2)

### Feature 1: Configuração Completa da Base do Projeto

**Objetivo:** Projeto totalmente configurado, navegável e com estrutura pronta para desenvolvimento.

**Sub-tarefas:**

#### 1.1 — Instalação de Dependências

- [ ] `@supabase/supabase-js` + `@supabase/ssr`
- [ ] `zustand`
- [ ] `@tanstack/react-query` + `@tanstack/react-query-devtools`
- [ ] `react-hook-form` + `@hookform/resolvers`
- [ ] `zod`
- [ ] `husky` + `lint-staged`
- [ ] Componentes shadcn adicionais: sidebar, card, table, badge, dialog, dropdown-menu, avatar, separator, skeleton, toast

#### 1.2 — Estrutura de Pastas

- [ ] `app/(main)/dashboard/page.tsx`
- [ ] `app/(main)/clinics/page.tsx`
- [ ] `app/(main)/users/page.tsx`
- [ ] `app/(main)/patients/page.tsx`
- [ ] `app/(main)/checklists/page.tsx`
- [ ] `app/(main)/reports/page.tsx`
- [ ] `app/(main)/settings/page.tsx`
- [ ] `app/(main)/layout.tsx`
- [ ] `app/auth/login/page.tsx`
- [ ] `app/auth/layout.tsx`
- [ ] `components/layout/` (sidebar, topbar, nav-item)
- [ ] `components/clinics/`, `components/users/`, `components/patients/`
- [ ] `store/` (auth-store, ui-store)
- [ ] `hooks/` (use-supabase, use-current-user)
- [ ] `types/` (database.ts, auth.ts, clinic.ts, user.ts)

#### 1.3 — Configuração do Supabase

- [ ] `lib/supabase.ts` (client browser + server)
- [ ] Variáveis de ambiente (`.env.local.example`)

#### 1.4 — Middleware de Proteção Super Admin

- [ ] `middleware.ts` — protege todas as rotas `/(main)`
- [ ] Verifica sessão Supabase + role `super_admin`
- [ ] Redireciona para `/auth/login` se não autenticado
- [ ] Redireciona para `/access-denied` se não for super_admin

#### 1.5 — Auth: Login Page

- [ ] Layout de auth limpo e responsivo
- [ ] Formulário com React Hook Form + Zod
- [ ] Integração com Supabase Auth (email/password)
- [ ] Loading state, error handling
- [ ] Redirect após login para `/dashboard`

#### 1.6 — Layout Base (Main)

- [ ] Sidebar responsivo com navegação completa
- [ ] Topbar com avatar do usuário, modo dark toggle, logout
- [ ] Suporte completo a dark mode (next-themes)
- [ ] Mobile-friendly (sidebar colapsável)
- [ ] Active state nos nav items

#### 1.7 — Dashboard Inicial

- [ ] Page `/dashboard` com placeholder de KPIs
- [ ] Cards de métricas vazios prontos para dados reais
- [ ] Navegação funcionando entre todas as rotas
- [ ] QueryProvider + ZustandProvider configurados no layout

---

### Feature 2: Autenticação Robusta e Gestão de Sessão

**Objetivo:** Auth production-ready com refresh automático, proteção de rotas e estado global.

**Sub-tarefas:**

- [ ] Supabase Auth com SSR (cookies httpOnly)
- [ ] `AuthProvider` client-side com Zustand (user, role, loading)
- [ ] Hook `useCurrentUser()` — retorna super_admin info
- [ ] Refresh automático de sessão
- [ ] Página `/access-denied` para roles incorretos
- [ ] Logout com limpeza de estado
- [ ] Proteção contra CSRF em Server Actions

---

## FASE 2 — Core Features (Features 3, 4 e 5)

### Feature 3: Dashboard Global com KPIs

**Objetivo:** Visão executiva de toda a plataforma em tempo real.

**Métricas planejadas:**

- Total de clínicas ativas
- Total de pacientes na plataforma
- Total de usuários (por role)
- Turnos ativos agora
- Checklists completados hoje
- Alertas críticos pendentes

**Sub-tarefas:**

- [ ] Server Component que faz queries globais (sem clinic_id filter)
- [ ] Cards de KPI com skeleton loading
- [ ] Gráfico de crescimento de clínicas (recharts ou tremor)
- [ ] Gráfico de pacientes por clínica
- [ ] Lista de alertas críticos (top 5)
- [ ] Atualização em tempo real via Supabase Realtime (turnos ativos)

---

### Feature 4: Gestão de Clínicas (CRUD Completo)

**Objetivo:** Super Admin pode criar, visualizar, editar e desativar clínicas.

**Sub-tarefas:**

- [ ] Tabela de clínicas com busca, filtro e paginação
- [ ] Formulário de criação (nome, CNPJ, plano, status)
- [ ] Validação com Zod (CNPJ real)
- [ ] Modal de edição
- [ ] Soft delete (desativar clínica, não excluir)
- [ ] Visualização de métricas por clínica (drill-down)
- [ ] Server Actions para criação/edição (auditoria futura)
- [ ] Toast notifications de feedback

---

### Feature 5: Gestão de Usuários Admin

**Objetivo:** Gerenciar usuários com role `clinic_admin` em toda a plataforma.

**Sub-tarefas:**

- [ ] Tabela de usuários com filtro por clínica e role
- [ ] Criar novo clinic_admin vinculado a uma clínica
- [ ] Bloquear/desbloquear acesso (campo `status` no user)
- [ ] Trocar clínica de um admin
- [ ] Visualizar último acesso
- [ ] Enviar convite por email (Supabase invite)
- [ ] Server Actions com verificação de super_admin

---

## FASE 3 — Operations (Features 6 e 7)

### Feature 6: Gestão de Pacientes (Visão Global)

**Objetivo:** Super Admin vê todos os pacientes de todas as clínicas.

**Sub-tarefas:**

- [ ] Tabela global de pacientes com filtro por clínica
- [ ] Perfil do paciente (somente leitura no Super Admin)
- [ ] Dados: nome, clínica, cuidadores vinculados, status
- [ ] Busca por nome ou clínica
- [ ] Exportar lista (CSV)

---

### Feature 7: Checklists Globais (Templates)

**Objetivo:** Criar e gerenciar templates de checklists usados por todas as clínicas.

**Sub-tarefas:**

- [ ] Listagem de templates (globais vs por clínica)
- [ ] Criar template com itens e opções (form multi-step)
- [ ] Tipos de item: texto, boolean, seleção, número
- [ ] Reordenar itens via drag-and-drop
- [ ] Duplicar template entre clínicas
- [ ] Visualizar uso: quantas execuções por template
- [ ] Imutabilidade: templates usados não podem ser deletados

---

## FASE 4 — Insights (Features 8 e 9)

### Feature 8: Relatórios e Analytics

**Objetivo:** Relatórios consolidados da operação.

**Sub-tarefas:**

- [ ] Relatório de turnos por período (por clínica)
- [ ] Relatório de checklists completados vs pendentes
- [ ] Relatório de crescimento de pacientes
- [ ] Filtros por data range e clínica
- [ ] Exportar relatório em PDF/CSV
- [ ] Gráficos com recharts

---

### Feature 9: Auditoria e Logs

**Objetivo:** Rastrear todas as ações críticas do Super Admin.

**Sub-tarefas:**

- [x] Tabela `audit_logs` no Supabase
- [x] Registrar: criação de clínica, alteração de usuário, deleção, mudança de plano
- [x] Interface de visualização de logs (filtro por tipo, data, usuário)
- [x] Logs são imutáveis (sem UPDATE/DELETE no RLS)
- [x] Exportar logs

---

## FASE 5 — Admin Tools (Feature 10)

### Feature 10: Configurações Globais

**Objetivo:** Configurar parâmetros globais da plataforma.

**Sub-tarefas:**

- [x] Gerenciar planos de assinatura (nome, features, preço)
- [x] Gerenciar categorias de turno
- [x] Configurar alertas globais (limites, thresholds)
- [ ] Vincular clínicas a planos (via gestão de clínicas)
- [ ] Configurar tipos de sinais vitais padrão
- [ ] Configurações de email/notificações

**Status:** ✅ Implementado (dados mockados - aguardando tabelas no banco)

---

## FASE 6 — Detail Views (Features 11-14)

### Feature 11: Detalhes de Clínica (Drill-down)

**Objetivo:** Super Admin visualiza informações completas de uma clínica.

**URL:** `/clinics/[id]`

**Sub-tarefas:**

- [x] Header com nome, CNPJ, status, plano da clínica
- [x] Cards de métricas (pacientes, cuidadores, turnos no mês)
- [x] Lista de pacientes vinculados
- [x] Lista de usuários por role (admin, cuidadores)
- [x] Checklists configurados na clínica
- [x] Link de drill-down na tabela de clínicas

---

### Feature 12: Detalhes de Usuário (Perfil Completo)

**Objetivo:** Visualizar perfil e histórico de um usuário.

**URL:** `/users/[id]`

**Sub-tarefas:**

- [x] Header com avatar, nome, email, role
- [x] Clínica vinculada
- [x] Status da conta (ativo/bloqueado)
- [x] Último acesso
- [x] Histórico de ações (via audit_logs)
- [x] Pacientes vinculados (se cuidador)
- [x] Link de drill-down na tabela de usuários

---

### Feature 13: Detalhes de Paciente (Prontuário)

**Objetivo:** Prontuário completo do paciente para Super Admin.

**URL:** `/patients/[id]`

**Sub-tarefas:**

- [ ] Header com nome, idade, clínica, data de nascimento
- [ ] Cuidadores vinculados com status
- [ ] Último turno realizado
- [ ] Histórico de checklists completados
- [ ] Contractor (responsável) vinculado
- [ ] Contatos de emergência
- [ ] Ações: visualizar turnos, ver cuidadores

---

### Feature 14: Detalhes de Checklist (Estatísticas)

**Objetivo:** Estatísticas de uso de um template de checklist.

**URL:** `/checklists/[id]`

**Sub-tarefas:**

- [ ] Header com nome, escopo (global/clínica), ícone
- [ ] Total de execuções
- [ ] Taxa de conclusão (%)
- [ ] Lista de itens do template (preview)
- [ ] Clínicas que usam este template
- [ ] Período de maior uso (gráfico)
  - [ ] Ações: editar, duplicar, excluir (se não usado)

---

## Pendências

### Feature 10 - Itens pendentes:

- [ ] Vincular clínicas a planos (via gestão de clínicas)
- [ ] Configurar tipos de sinais vitais padrão
- [ ] Configurações de email/notificações
- [ ] Criar tabelas no Supabase: plans, shift_categories, alert_thresholds

---

## Estrutura de URLs (Detail Views)

```
/clinics/[id]       → Detalhes completos da clínica
/users/[id]          → Perfil e histórico do usuário
/patients/[id]       → Prontuário do paciente
/checklists/[id]     → Estatísticas do template
```

---

## Ordem de Implementação Justificada

```
Features 1-10: ✅ IMPLEMENTADAS
→ Feature 11 (Detalhes Clínica)
→ Feature 12 (Detalhes Usuário)
→ Feature 13 (Detalhes Paciente)
→ Feature 14 (Detalhes Checklist)
```

**Justificativa Features 11-14:**

1. **Detail views** complementam as listagens existentes
2. Drill-down permite ações mais granulares
3. Melhora UX do Super Admin para gestão detalhada

**Justificativa:**

1. **Features 1-2** são bloqueantes — sem base e auth nada funciona
2. **Feature 3** vem antes das outras para validar a arquitetura de dados globais
3. **Features 4-5** são o core do produto (clínicas e admins)
4. **Features 6-7** dependem de dados existentes (pacientes e checklists das clínicas)
5. **Features 8-9** dependem de volume de dados operacionais
6. **Feature 10** é a mais isolada, pode ser feita por último

---

## Convenções do Projeto

### Commits

```
feat: add clinic crud
fix: middleware redirect for non-super-admin
chore: install supabase dependencies
```

### Arquivos

- `kebab-case.tsx` para arquivos
- `PascalCase` para componentes
- `camelCase` para funções/variáveis

### Server Actions

Todo arquivo de Server Action deve ter:

```typescript
"use server"
// 1. Verificar sessão
// 2. Verificar role === 'super_admin'
// 3. Executar operação
// 4. Registrar em audit_log (futuro)
```

---

Última atualização: 2026-03-25 — Feature 12 Detalhes de Usuário concluída
