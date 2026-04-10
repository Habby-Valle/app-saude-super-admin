# IMPLEMENTATION PLAN - App Saúde (Painel Administrativo Unificado)

> Documento vivo — atualizado a cada feature concluída.
> Seguindo: Spec-Driven Development → PRD → Tech Spec → Implementation Plan → Código

---

## Visão Geral

### Super Admin Features (✅ Concluídas)

| #   | Feature                                  | Fase           | Prioridade | Status       |
| --- | ---------------------------------------- | -------------- | ---------- | ------------ |
| 1   | Configuração Completa da Base do Projeto | 1 - Foundation | 🔴 Crítico | ✅ Concluído |
| 2   | Autenticação e Gestão de Sessão          | 1 - Foundation | 🔴 Crítico | ✅ Concluído |
| 3   | Dashboard Global com KPIs                | 2 - Core       | 🔴 Crítico | ✅ Concluído |
| 4   | Gestão de Clínicas (CRUD completo)       | 2 - Core       | 🔴 Crítico | ✅ Concluído |
| 5   | Gestão de Usuários Admin                 | 2 - Core       | 🔴 Crítico | ✅ Concluído |
| 6   | Gestão de Pacientes (visão global)       | 3 - Operations | 🟠 Alto    | ✅ Concluído |
| 7   | Checklists Globais (templates)           | 3 - Operations | 🟡 Médio   | ✅ Concluído |
| 8   | Relatórios e Analytics                   | 4 - Insights   | 🟡 Médio   | ✅ Concluído |
| 9   | Auditoria e Logs                         | 4 - Insights   | 🟡 Médio   | ✅ Concluído |
| 10  | Configurações Globais (planos, sistema)  | 5 - Admin      | 🟢 Normal  | ✅ Concluído |
| 11  | Detalhes de Clínica (drill-down)         | 6 - Details    | 🟠 Alto    | ✅ Concluído |
| 12  | Detalhes de Usuário (perfil completo)    | 6 - Details    | 🟠 Alto    | ✅ Concluído |
| 13  | Detalhes de Paciente (prontuário)        | 6 - Details    | 🟠 Alto    | ✅ Concluído |
| 14  | Detalhes de Checklist (estatísticas)     | 6 - Details    | 🟠 Alto    | ✅ Concluído |

### Super Admin - Pendências

- [ ] Vincular clínicas a planos (via gestão de clínicas)
- [ ] Configurar tipos de sinais vitais padrão
- [ ] Configurações de email/notificações
- [ ] Criar tabelas no Supabase: `plans`, `shift_categories`, `alert_thresholds`

---

## Melhorias Globais

| #   | Feature                                  | Prioridade | Status       |
| --- | ---------------------------------------- | ---------- | ------------ |
| 28  | Paginação completa em todas as tabelas   | 🟡 Médio   | ✅ Concluído |
| 29  | SEO - Meta tags, Open Graph, sitemap.xml | 🟡 Médio   | ✅ Concluído |

### Paginação (Feature 28)

Melhorar experiência de navegação com paginação completa:

- [x] Lazy loading / infinite scroll para tabelas grandes
- [x] Indicador de registros por página
- [x] Ir para página específica
- [x] Resumo: "Mostrando 1-10 de 156 registros"

### SEO (Feature 29)

Otimização para mecanismos de busca:

- [x] Meta tags dinâmicas por página (title, description)
- [x] Open Graph tags para compartilhamento
- [x] sitemap.xml automático
- [x] robots.txt
- [x] Canonical URLs
- [x] Structured data (JSON-LD) para organização
- [x] Favicon e ícones PWA
- [ ] Otimização de performance (Core Web Vitals)
- [x] Variáveis de ambiente por ambiente (dev/homolog/prod)

---

## Variáveis de Ambiente

### APP_ENV

Controla o ambiente de execução da aplicação:

| Valor          | Ambiente        | Indexação    | Título                    |
| -------------- | --------------- | ------------ | ------------------------- |
| `development`  | Desenvolvimento | ❌ Bloqueada | "Dev - App Saúde"         |
| `homologation` | Homologação     | ✅ Permitida | "Homologação - App Saúde" |
| `production`   | Produção        | ✅ Permitida | "App Saúde"               |

### Configurações por Ambiente

- **Development**: `robots.txt` bloqueia indexação, sitemap vazio, meta tag `noindex`
- **Homologation**: Indexação permitida para teste de SEO
- **Production**: Indexação completa ativada

### Arquivos Configurados

- `lib/env.ts` - Utilitários de ambiente
- `app/layout.tsx` - Metadata dinâmica por ambiente
- `app/sitemap.ts` - Sitemap respects `SHOULD_INDEX`
- `app/robots.ts` - Robots respects `SHOULD_INDEX`
- `components/layout/seo-provider.tsx` - JSON-LD só em produção

---

## Clinic Admin - Próxima Fase

| #   | Feature                     | Fase           | Prioridade | Status       |
| --- | --------------------------- | -------------- | ---------- | ------------ |
| 15  | Foundation Clinic Admin     | 7 - Foundation | 🔴 Crítico | ✅ Concluído |
| 15a | Tema Roxo (CSS customizado) | 7 - Foundation | 🔴 Crítico | ✅ Concluído |
| 16  | Dashboard da Clínica        | 8 - Core       | 🔴 Crítico | ✅ Concluído |
| 17  | Gestão de Pacientes         | 8 - Core       | 🔴 Crítico | ✅ Concluído |
| 18  | Gestão de Cuidadores        | 8 - Core       | 🟠 Alto    | ✅ Concluído |
| 19  | Gestão de Turnos            | 9 - Operations | 🟠 Alto    | ✅ Concluído |
| 20  | Checklists da Clínica       | 9 - Operations | 🟡 Médio   | ✅ Concluído |
| 21  | Relatórios da Clínica       | 10 - Insights  | 🟡 Médio   | ✅ Concluído |

---

## Tema Roxo - Clinic Admin

### Cores

| Elemento   | Cor     | Hex     | OKLCH                  |
| ---------- | ------- | ------- | ---------------------- |
| Primary    | Roxo    | #764b9d | `oklch(0.45 0.15 300)` |
| Background | Lavanda | #f6f4fe | `oklch(0.97 0.01 300)` |
| Card       | White   | #ffffff | `oklch(1 0 0)`         |

### Tarefas

- [x] Adicionar variáveis CSS no globals.css
- [x] Criar classe `.clinic-admin` com tema roxo
- [x] Aplicar classe no layout `(clinic-admin)/layout.tsx`
- [x] Testar tema no browser

---

## Sistema SOS

| #   | Feature                                     | Fase     | Prioridade | Status       |
| --- | ------------------------------------------- | -------- | ---------- | ------------ |
| 22  | Tabelas SOS (sos_alerts, sos_notifications) | 11 - SOS | 🔴 Crítico | ✅ Concluído |
| 23  | Server Actions SOS                          | 11 - SOS | 🔴 Crítico | ✅ Concluído |
| 24  | Super Admin: Página SOS global              | 11 - SOS | 🔴 Crítico | ✅ Concluído |
| 25  | Clinic Admin: Página SOS                    | 11 - SOS | 🔴 Crítico | ✅ Concluído |
| 26  | Dashboard Cards SOS                         | 11 - SOS | 🟠 Alto    | ✅ Concluído |
| 27  | Ações: Acknowledge e Resolve                | 11 - SOS | 🟠 Alto    | ✅ Concluído |
| 28  | Paginação completa em todas as tabelas      | 12 - UX  | 🟡 Médio   | ✅ Concluído |
| 29  | SEO - Meta tags, Open Graph, sitemap.xml    | 12 - UX  | 🟡 Médio   | ✅ Concluído |

---

## Segurança

| #   | Feature                                        | Prioridade | Status                          |
| --- | ---------------------------------------------- | ---------- | ------------------------------- |
| 30  | RLS Policies restritivas por tabela            | 🔴 Crítico | ✅ Concluído                    |
| 31  | Validação de input em todos os formulários     | 🔴 Crítico | ✅ Concluído                    |
| 32  | Sanitização de dados de saída                  | 🔴 Crítico | ✅ Concluído                    |
| 33  | Rate limiting em endpoints críticos            | 🟠 Alto    | ✅ Concluído (simplificado)     |
| 34  | HTTPS e headers de segurança (CSP, HSTS, etc.) | 🟠 Alto    | ✅ Concluído                    |
| 35  | Logs de auditoria para ações sensíveis         | 🟠 Alto    | ✅ Concluído                    |
| 36  | Criptografia de dados sensíveis (LGPD)         | 🟠 Alto    | ✅ Concluído                    |
| 37  | Autenticação 2FA para admins                   | 🟡 Médio   | ⏸ Pulado (não necessário agora) |
| 38  | Sessoes com timeout automático                 | 🟡 Médio   | ⏸ Pulado (não necessário agora) |
| 39  | Revisão de dependências (npm audit)            | 🟡 Médio   | ✅ Concluído                    |

### Detalhamento

#### RLS Policies (Feature 30)

- [x] Policies por tabela: `patients`, `shifts`, `checklists`, `sos_alerts`
- [x] Policy para `auth.users` (gerenciar roles)
- [x] Funções auxiliares: `auth.is_super_admin()`, `auth.get_user_clinic_id()`
- [ ] Testar isolamento entre clínicas

**Script SQL**: `docs/SQL/rls-policies.sql`

#### Tabelas com RLS

| Tabela            | Super Admin    | Clinic Admin                    | Cuidador                  |
| ----------------- | -------------- | ------------------------------- | ------------------------- |
| clinics           | CRUD           | -                               | -                         |
| users             | CRUD           | Read/Update (própria clínica)   | Read/Update (próprio)     |
| patients          | CRUD           | CRUD                            | -                         |
| caregiver_patient | CRUD           | CRUD                            | -                         |
| checklists        | CRUD (globais) | Read (globais) + CRUD (própria) | Read                      |
| checklist_items   | CRUD           | CRUD                            | Read                      |
| shifts            | CRUD           | CRUD                            | -                         |
| sos_alerts        | CRUD           | Update (própria)                | Insert/Select (acionados) |
| sos_notifications | CRUD           | Update (própria)                | -                         |
| audit_logs        | Read           | -                               | Insert                    |

#### Validação de Input (Feature 31)

- [x] Zod schemas para todos os formulários
- [x] Validação server-side em todas as mutations
- [x] Sanitização de strings (XSS prevention)

**Schemas**: `lib/validations/`

| Schema         | Descrição                     |
| -------------- | ----------------------------- |
| `auth.ts`      | Login                         |
| `clinic.ts`    | Clínicas (com validação CNPJ) |
| `user.ts`      | Usuários                      |
| `patient.ts`   | Pacientes                     |
| `caregiver.ts` | Cuidadores                    |
| `checklist.ts` | Checklists e itens            |
| `shift.ts`     | Turnos                        |
| `sos.ts`       | Alertas SOS                   |

**Utilitários**: `lib/validation.ts`

- `parseWithSanitize()` - Validação com sanitização
- `validateEmail()` - Validação de email
- `validateUuid()` - Validação de UUID
- `validateCnpj()` - Validação de CNPJ
- `validateCpf()` - Validação de CPF

**Sanitização**: `lib/sanitize.ts`

- `sanitizeString()` - Remove scripts/iframes
- `sanitizeObject()` - Sanitiza campos específicos
- `escapeHtml()` - Escapa caracteres HTML
- `stripHtml()` - Remove tags HTML

#### Headers de Segurança (Feature 34)

- [x] Content-Security-Policy (CSP)
- [x] HTTP Strict Transport Security (HSTS)
- [x] X-Frame-Options
- [x] X-Content-Type-Options
- [x] Referrer-Policy
- [x] X-DNS-Prefetch-Control
- [x] X-XSS-Protection
- [x] Permissions-Policy

**Arquivo**: `next.config.mjs`

| Header                    | Valor                                        |
| ------------------------- | -------------------------------------------- |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload |
| X-Frame-Options           | SAMEORIGIN                                   |
| X-Content-Type-Options    | nosniff                                      |
| X-XSS-Protection          | 1; mode=block                                |
| Referrer-Policy           | origin-when-cross-origin                     |
| Permissions-Policy        | camera=(), microphone=(), geolocation=()     |
| Content-Security-Policy   | default-src 'self'; script-src ...           |

#### LGPD/Privacidade (Feature 36)

- [x] Criptografia de dados de saúde (`lib/crypto.ts` — AES-256-GCM, Node.js built-in)
- [x] Integração: `sos_alerts.notes` e `location_lat/lng` criptografados
- [x] Política de retenção de dados (UI + `data_retention_policies` table)
- [x] Exportação de dados do usuário/paciente em JSON (`lib/lgpd.ts` + `lgpd-actions.ts`)
- [x] Anonimização (direito ao esquecimento — `anonymizeUser`, `anonymizePatient`)
- [x] Consentimento explícito (tabela `user_consents` — `docs/SQL/lgpd.sql`)

**Arquivos criados:**

- `lib/crypto.ts` — Utilitário AES-256-GCM (`encrypt`, `decrypt`, `encryptIfPresent`, `decryptIfPresent`)
- `lib/lgpd.ts` — Exportação e anonimização de titulares
- `app/.../settings/lgpd-actions.ts` — Server Actions LGPD protegidas por `requireSuperAdmin()`
- `components/super-admin/settings/lgpd-settings.tsx` — Aba LGPD/Privacidade nas Configurações
- `docs/SQL/lgpd.sql` — Migração SQL (`user_consents`, `data_retention_policies`, `anonymized_at`)

**Configuração necessária:**

```env
# .env.local
ENCRYPTION_KEY=<string segura gerada com: openssl rand -base64 32>
```

---

## Estrutura de Rotas (Unificada)

```
# Super Admin
/app/(main)/(super-admin)/
├── dashboard/        ✅
├── clinics/          ✅
│   └── [id]/        ✅
├── users/            ✅
│   └── [id]/        ✅
├── patients/         ✅
│   └── [id]/        ✅
├── checklists/       ✅
│   └── [id]/        ✅
├── reports/          ✅
├── audit-logs/       ✅
├── settings/        ✅
└── sos/             ✅

# Clinic Admin
/app/(main)/(clinic-admin)/
├── dashboard/        ✅
├── patients/         ✅
│   └── [id]/        ✅
├── caregivers/       ✅
│   └── [id]/        ✅
├── shifts/           ✅
├── checklists/       ✅
│   └── [id]/        ✅
├── reports/          ✅
└── sos/              ✅
```

---

## Convenções do Projeto

### Commits

```
feat(super-admin): add clinic crud
feat(clinic-admin): add patients management
fix: middleware redirect for non-super-admin
chore: install supabase dependencies
```

### Arquivos

- `kebab-case.tsx` para arquivos
- `PascalCase` para componentes
- `camelCase` para funções/variáveis

### Server Actions

```typescript
// Super Admin
"use server"
export async function requireSuperAdmin() {
  // Verifica sessão + role === 'super_admin'
}

// Clinic Admin
;("use server")
export async function requireClinicAdmin() {
  // Verifica sessão + role === 'clinic_admin' ou 'super_admin'
  // Retorna { user, clinicId, isSuperAdmin }
}
```

---

## Sistema SOS - Especificação

### Fluxo

```
1. Cuidador/Familiar clica botão SOS no app
         ↓
2. Cria registro em sos_alerts (status: 'active')
         ↓
3. Identifica destinatários (clinic_admin + family + emergency_contacts)
         ↓
4. Cria registros em sos_notifications
         ↓
5. Envia Push Notification via Firebase/Expo
         ↓
6. Destinatários recebem alerta no app
         ↓
7. Admin confirma (acknowledge) ou resolve o alerta
```

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

## Sistema de Assinaturas e Billing

| #   | Feature                                        | Fase         | Prioridade | Status       |
| --- | ---------------------------------------------- | ------------ | ---------- | ------------ |
| S01 | Job de expiração automática (pg_cron)          | 13 - Billing | 🔴 Crítico | ✅ Concluído |
| S02 | Sistema de Trial (14 dias automático)          | 13 - Billing | 🔴 Crítico | ✅ Concluído |
| S03 | Notificações de expiração (7/3/1 dias)         | 13 - Billing | 🟠 Alto    | ✅ Concluído |
| S04 | Verificação de assinatura em actions           | 13 - Billing | 🔴 Crítico | ✅ Concluído |
| S05 | Banner de expiração na UI                      | 13 - Billing | 🟠 Alto    | ✅ Concluído |
| S06 | Página de renewal (/admin/plan)                | 13 - Billing | 🔴 Crítico | ✅ Concluído |
| S07 | Integração Stripe Checkout                     | 13 - Billing | 🔴 Crítico | ✅ Concluído |
| S08 | Webhook Stripe (payment events)                | 13 - Billing | 🔴 Crítico | ✅ Concluído |
| S09 | Dashboard de assinaturas (SA)                  | 13 - Billing | 🟠 Alto    | ✅ Concluído |
| S10 | Página de detalhes da assinatura               | 13 - Billing | 🟠 Alto    | ✅ Concluído |
| S11 | Ativação manual pelo Super Admin               | 13 - Billing | 🟠 Alto    | ✅ Concluído |
| S12 | Histórico de cobranças (/super-admin/payments) | 13 - Billing | 🟠 Alto    | ✅ Concluído |
| S13 | Billing Pró-rata (upgrade/downgrade)           | 13 - Billing | 🟡 Médio   | ✅ Concluído |
| S14 | Cancelamento via Stripe Portal                 | 13 - Billing | 🟡 Médio   | ✅ Concluído |

### Tabelas Criadas

```sql
-- Planos
CREATE TABLE plans (...);

-- Assinaturas
CREATE TABLE clinic_plans (...);

-- Benefícios
CREATE TABLE plan_benefits (...);
CREATE TABLE plan_benefit_relations (...);

-- Histórico de pagamentos
CREATE TABLE subscription_payments (...);

-- Notificações
CREATE TABLE subscription_notifications (...);
```

### APIs Criadas

| Rota                               | Descrição                 |
| ---------------------------------- | ------------------------- |
| `POST /api/checkout`               | Cria sessão Stripe        |
| `POST /api/webhooks/stripe`        | Recebe eventos Stripe     |
| `POST /api/portal`                 | Cria sessão Stripe Portal |
| `GET /api/subscriptions/[id]`      | Detalhes assinatura       |
| `POST /api/subscriptions/activate` | Ativação manual           |
| `GET /api/plans`                   | Lista planos              |

### Páginas Criadas

| Rota                              | Descrição            |
| --------------------------------- | -------------------- |
| `/admin/plan`                     | Gestão de plano (CA) |
| `/admin/plan/manage`              | Portal Stripe (CA)   |
| `/super-admin/subscriptions`      | Dashboard (SA)       |
| `/super-admin/subscriptions/[id]` | Detalhes (SA)        |
| `/super-admin/payments`           | Histórico (SA)       |

---

## Última atualização: 2026-04-11

### Resumo das Mudanças Recentes

- ✅ **Feature S01-S14** — Sistema de Assinaturas e Billing completo
  - Trial automático de 14 dias
  - Jobs pg_cron para expiração e notificações
  - Integração Stripe Checkout + Webhook
  - Dashboard de assinaturas e pagamentos
  - Cancelamento via Stripe Portal
  - Billing pró-rata implementado

- ✅ **Simplificação Feature 33** — Rate Limiting: Removida complexidade desnecessária. Solução agora usa Map in-memory em vez de tabelas no banco. Mantém eficácia para contexto de painel administrativo interno.
- ✅ Feature 34 — Security Headers: Implementados todos os headers de segurança (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-DNS-Prefetch-Control, X-XSS-Protection, Permissions-Policy) no `next.config.mjs`
- ✅ Feature 28 — Paginação completa: Componente `DataTablePagination` com seletor de registros/página (10/20/50), ir para página específica, resumo "Mostrando X-Y de Z registros", aplicado em todas as tabelas
- ✅ Feature 26 — Dashboard Cards SOS: Cards de resumo (ativos, reconhecidos, resolvidos hoje)
- ✅ Feature 27 — Ações SOS: Acknowledge e Resolve implementados nas tabelas SOS
