# IMPLEMENTATION PLAN - App Saúde (Super Admin Dashboard)

> Documento vivo — atualizado a cada feature concluída.
> Seguindo: Spec-Driven Development → PRD → Tech Spec → Implementation Plan → Código

---

## Visão Geral

| # | Feature | Fase | Prioridade | Status |
|---|---------|------|------------|--------|
| 1 | Configuração Completa da Base do Projeto | 1 - Foundation | 🔴 Crítico | ✅ Concluído |
| 2 | Autenticação e Gestão de Sessão | 1 - Foundation | 🔴 Crítico | ✅ Concluído |
| 3 | Dashboard Global com KPIs | 2 - Core | 🔴 Crítico | ✅ Concluído |
| 4 | Gestão de Clínicas (CRUD completo) | 2 - Core | 🔴 Crítico | ✅ Concluído |
| 5 | Gestão de Usuários Admin | 2 - Core | 🟠 Alto | ✅ Concluído |
| 6 | Gestão de Pacientes (visão global) | 3 - Operations | 🟠 Alto | ⏸ Pendente |
| 7 | Checklists Globais (templates) | 3 - Operations | 🟡 Médio | ⏸ Pendente |
| 8 | Relatórios e Analytics | 4 - Insights | 🟡 Médio | ⏸ Pendente |
| 9 | Auditoria e Logs | 4 - Insights | 🟡 Médio | ⏸ Pendente |
| 10 | Configurações Globais (planos, sistema) | 5 - Admin | 🟢 Normal | ⏸ Pendente |

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
- [ ] Tabela `audit_logs` no Supabase
- [ ] Registrar: criação de clínica, alteração de usuário, deleção, mudança de plano
- [ ] Interface de visualização de logs (filtro por tipo, data, usuário)
- [ ] Logs são imutáveis (sem UPDATE/DELETE no RLS)
- [ ] Exportar logs

---

## FASE 5 — Admin Tools (Feature 10)

### Feature 10: Configurações Globais

**Objetivo:** Configurar parâmetros globais da plataforma.

**Sub-tarefas:**
- [ ] Gerenciar planos de assinatura (nome, features, preço)
- [ ] Vincular clínicas a planos
- [ ] Configurar alertas globais (limites, thresholds)
- [ ] Configurar tipos de sinais vitais padrão
- [ ] Gerenciar categorias de turno
- [ ] Configurações de email/notificações

---

## Ordem de Implementação Justificada

```
Feature 1 (Base) → Feature 2 (Auth) → Feature 3 (Dashboard) → Feature 4 (Clínicas)
→ Feature 5 (Usuários) → Feature 6 (Pacientes) → Feature 7 (Checklists)
→ Feature 8 (Relatórios) → Feature 9 (Auditoria) → Feature 10 (Configurações)
```

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
'use server'
// 1. Verificar sessão
// 2. Verificar role === 'super_admin'
// 3. Executar operação
// 4. Registrar em audit_log (futuro)
```

---

Última atualização: 2026-03-25 — F5 Gestão de Usuários concluída
