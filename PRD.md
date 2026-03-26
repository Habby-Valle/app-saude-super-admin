# PRD - App Saúde (Painel Administrativo Unificado)

## Visão Geral

Plataforma SaaS multi-tenant para gestão de cuidados com pacientes (principalmente idosos), conectando cuidadores, familiares e contatos de emergência.

O sistema é composto por um **painel administrativo unificado** com dois módulos:

1. **Super Admin** - Dono da plataforma, gestão global
2. **Clinic Admin** - Administrador de cada clínica

## Objetivos

- **Super Admin**: Visibilidade completa e controle centralizado de todas as clínicas
- **Clinic Admin**: Gestão operacional da clínica específica (pacientes, cuidadores, turnos)
- **SOS (Alerta de Emergência)**: Resposta rápida a emergências envolvendo pacientes
- Garantir conformidade, segurança e qualidade dos cuidados prestados
- Conectar cuidadores, familiares e contatos de emergência

---

## Módulo Super Admin

### Objetivos

- Gerenciar crescimento da rede (cadastro de novas clínicas)
- Monitorar saúde financeira e operacional da plataforma
- Garantir conformidade, segurança e qualidade dos cuidados prestados

### Funcionalidades Principais

#### Gestão de Clínicas

- [x] CRUD de clínicas (nome, CNPJ, status, plano)
- [x] Visualizar métricas por clínica (drill-down)

#### Gestão de Usuários

- [x] Visualizar todos os usuários da plataforma
- [x] Gerenciar administradores de clínicas
- [x] Bloquear/desbloquear acessos

#### Monitoramento Global

- [x] Dashboard com KPIs: total de clínicas, pacientes, cuidadores, turnos
- [x] Gráficos de evolução
- [x] Lista de alertas críticos

#### Configurações Globais

- [x] Gerenciar templates de checklists
- [ ] Gerenciar planos de assinatura
- [ ] Configurar alertas globais

#### Relatórios e Auditoria

- [x] Relatórios consolidados
- [x] Logs de auditoria

#### Sistema SOS (Alertas de Emergência)

- [ ] Visor global de SOS ativos (todas as clínicas)
- [ ] Dashboard com card de SOS pendentes
- [ ] Página de gestão de SOS global
- [ ] Histórico de alertas por período

---

## Módulo Clinic Admin

### Objetivos

- Gestão diária da clínica específica
- Coordenação de cuidadores e pacientes
- Registro de turnos e execução de checklists
- Relatórios operacionais da clínica

### Funcionalidades Principais

#### Dashboard da Clínica

- [ ] KPIs: pacientes ativos, cuidadores, turnos do dia
- [ ] Alertas e pendências
- [ ] Próximos turnos

#### Gestão de Pacientes

- [ ] Lista de pacientes da clínica
- [ ] Cadastro e edição de pacientes
- [ ] Vinculação de cuidadores
- [ ] Contatos de emergência

#### Gestão de Cuidadores

- [ ] Lista de cuidadores da clínica
- [ ] Alocação de pacientes

#### Gestão de Turnos

- [ ] Iniciar/finalizar turno
- [ ] Vincular checklists ao turno
- [ ] Registrar observações

#### Checklists

- [ ] Templates disponíveis na clínica
- [ ] Execução de checklists durante turnos
- [ ] Histórico de execuções

#### Relatórios

- [ ] Relatórios operacionais da clínica
- [ ] Exportação de dados

#### Sistema SOS (Alertas de Emergência)

- [ ] Dashboard com SOS da clínica
- [ ] Página de gestão de SOS
- [ ] Ações: confirmar (acknowledge), resolver
- [ ] Visualizar notificação enviada

---

## Priorização

### Super Admin (✅ Concluído)

**Must Have**: ✅ Gestão de Clínicas, Dashboard Global, Gestão de Usuários Admin  
**Should Have**: ✅ Relatórios, Checklists, Auditoria  
**Could Have**: Faturamento, Integrações

### Clinic Admin (⏸ Em desenvolvimento)

**Must Have**: Dashboard, Pacientes, Turnos, Checklists, **SOS**  
**Should Have**: Cuidadores, Relatórios  
**Could Have**: Configurações avançadas

---

## Arquitetura

- **Projeto único** com Route Groups do Next.js
- **Mesma base de código** para Super Admin e Clinic Admin
- **Supabase** como backend (Auth + PostgreSQL + RLS)
- **Multi-tenant**: dados isolados por `clinic_id`

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

### Rotas

| Módulo       | Rota                      | Descrição           |
| ------------ | ------------------------- | ------------------- |
| Super Admin  | `/super-admin/sos`        | Visor global de SOS |
| Super Admin  | `/super-admin/dashboard`  | Card SOS pendentes  |
| Clinic Admin | `/clinic-admin/sos`       | SOS da clínica      |
| Clinic Admin | `/clinic-admin/dashboard` | Card SOS da clínica |

---

Data: 25/03/2026  
Última atualização: Adicionado Sistema SOS ao PRD
