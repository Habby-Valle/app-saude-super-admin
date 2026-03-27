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

| #   | Feature                                        | Prioridade | Status       |
| --- | ---------------------------------------------- | ---------- | ------------ |
| 30  | RLS Policies restritivas por tabela            | 🔴 Crítico | ⏸ Pendente   |
| 31  | Validação de input em todos os formulários     | 🔴 Crítico | ⏸ Pendente   |
| 32  | Sanitização de dados de saída                  | 🔴 Crítico | ⏸ Pendente   |
| 33  | Rate limiting em endpoints críticos            | 🟠 Alto    | ⏸ Pendente   |
| 34  | HTTPS e headers de segurança (CSP, HSTS, etc.) | 🟠 Alto    | ⏸ Pendente   |
| 35  | Logs de auditoria para ações sensíveis         | 🟠 Alto    | ✅ Concluído |
| 36  | Criptografia de dados sensíveis (LGPD)         | 🟠 Alto    | ⏸ Pendente   |
| 37  | Autenticação 2FA para admins                   | 🟡 Médio   | ⏸ Pendente   |
| 38  | Sessoes com timeout automático                 | 🟡 Médio   | ⏸ Pendente   |
| 39  | Revisão de dependências (npm audit)            | 🟡 Médio   | ⏸ Pendente   |

### Detalhamento

#### RLS Policies (Feature 30)

- [ ] Policies por tabela: `patients`, `shifts`, `checklists`, `sos_alerts`
- [ ] Testar isolamento entre clínicas
- [ ] Policy para `auth.users` (gerenciar roles)

#### Validação de Input (Feature 31)

- [ ] Zod schemas para todos os formulários
- [ ] Validação server-side em todas as mutations
- [ ] Sanitização de strings (XSS prevention)

#### Headers de Segurança (Feature 34)

- [ ] Content-Security-Policy (CSP)
- [ ] HTTP Strict Transport Security (HSTS)
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Referrer-Policy

#### LGPD/Privacidade (Feature 36)

- [ ] Criptografia de dados de saúde
- [ ] Política de retenção de dados
- [ ] Exportação de dados do usuário (GDPR/LGPD)
- [ ] Consentimento explícito

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

## Última atualização: 2026-03-27

### Resumo das Mudanças Recentes

- ✅ Feature 28 — Paginação completa: Componente `DataTablePagination` com seletor de registros/página (10/20/50), ir para página específica, resumo "Mostrando X-Y de Z registros", aplicado em todas as tabelas
- ✅ Metadata em todas as páginas: Adicionado `export const metadata` com títulos apropriados para todas as páginas (Super Admin e Clinic Admin)
- ✅ Correção TypeScript: Tipo de casting no `shifts/actions.ts` para relations do Supabase
- ✅ Feature 26 — Dashboard Cards SOS: Cards de resumo (ativos, reconhecidos, resolvidos hoje)
- ✅ Feature 27 — Ações SOS: Acknowledge e Resolve implementados nas tabelas SOS
