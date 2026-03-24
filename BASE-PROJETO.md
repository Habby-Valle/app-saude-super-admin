
# BASE-PROJETO.md - Template Base App Saúde

## Informações Gerais
- Nome da Plataforma: App Saúde
- Tipo de Sistema: Gestão de Cuidados para Idosos (Care Management)
- Banco de Dados: Supabase (PostgreSQL)
- Padrão de Autenticação: Supabase Auth + RLS
- Arquitetura: Multi-tenant (por clínica)

## Papéis (Roles) da Plataforma
- **super_admin** → Dono da empresa (acesso total)
- **clinic_admin** → Administrador da clínica
- **caregiver** → Cuidador
- **family** → Familiar
- **emergency_contact** → Contato de emergência

## Regras Globais de Segurança (RLS)
- Todo registro deve ter `clinic_id`
- Super Admin ignora `clinic_id` (acesso global)
- Demais usuários só acessam dados da sua própria clínica
- Registros de execução (shifts, checklists) são imutáveis após finalização

## Estrutura Recomendada de Tabelas
- `clinics`
- `users` (com role e clinic_id)
- `patients`
- `caregiver_patient` (relação muitos-para-muitos)
- `emergency_contacts`
- `checklists` + `checklist_items` + `checklist_item_options` (templates)
- `shifts`
- `shift_checklists` + `shift_checklist_items` (execução)

## Padrões de Nomenclatura
- Tabelas: snake_case
- Colunas: snake_case
- Arquivos: kebab-case
- Componentes: PascalCase
- Tipos TypeScript: PascalCase + sufixo `Type` ou `Schema`

## Boas Práticas para Este Projeto
- Sempre armazenar `created_by` e `clinic_id`
- Usar soft delete quando necessário (deleted_at)
- Manter histórico completo de alterações sensíveis
- Separar claramente templates (checklists) de execuções (shift_checklists)

Este documento deve ser usado como referência para todos os ambientes da plataforma (Super Admin, Admin Clínica e App Cuidadores).