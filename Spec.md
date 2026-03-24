# Tech Spec - App Saúde (Super Admin)

## Arquitetura
- Next.js 15 App Router + Server Components
- Multi-tenant forte (filtro por `clinic_id`)
- Super Admin tem bypass de RLS para visualização global
- TanStack Query + Zustand
- Server Actions para operações críticas

## Telas Principais
- `/dashboard` → KPIs globais
- `/clinics` → Lista e gestão de clínicas
- `/users` → Gestão de usuários (com filtro por clínica)
- `/patients` → Visão global de pacientes
- `/checklists` → Gerenciamento de templates de checklists
- `/reports` → Relatórios e analytics
- `/settings` → Configurações globais

## Regras de Acesso
- Apenas usuários com `role = 'super_admin'` podem acessar este ambiente
- Todas as queries devem respeitar `clinic_id` (exceto quando super_admin)

## Modelos de Dados
Baseado no diagrama ER fornecido (ver `docs/database-schema.md`)

## Próximos Passos de Implementação
1. Configuração do projeto + Supabase + Auth
2. Middleware de proteção Super Admin
3. Dashboard com KPIs
4. CRUD de Clínicas
5. Gestão de Usuários Admin
6. Templates de Checklists

Esta spec será atualizada ao longo do projeto.