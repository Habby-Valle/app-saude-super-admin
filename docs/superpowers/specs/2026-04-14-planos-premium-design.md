# Design: Sistema de Planos Premium

**Data:** 2026-04-14
**Status:** Aprovado
**Autor:** App Saúde Team

---

## 1. Visão Geral

Sistema de planos de assinatura para o App Saúde, estruturado em 4 planos (Free, Basic, Standard, Premium) com modelo freemium. O objetivo é atrair pequenas clínicas com um plano gratuito limitado e converter em clientes paying através de planos progressivos.

---

## 2. Estrutura de Planos

| Plano | Preço | Descrição |
|-------|-------|-----------|
| **Free** | R$ 0 | Para clínicas conhecerem o sistema |
| **Basic** | R$ 49/mês | Essentials para pequenas clínicas |
| **Standard** | R$ 99/mês | Para clínicas em crescimento |
| **Premium** | R$ 199/mês | Solução completa |

### 2.1 Ciclo de Cobrança

- ** mensal** (default)
- Trimestral (com desconto - futuro)
- Anual (com desconto - futuro)

### 2.2 Trial

- **14 dias** de Premium para novas clínicas
- Acesso total durante o trial
- Após expiração, clínica cai para o plano Free

---

## 3. Tabela de Limites por Plano

| Recurso | Free | Basic | Standard | Premium |
|---------|------|-------|----------|---------|
| **Pacientes** | 10 (leitura) | 25 | 100 | 300 |
| **Cuidadores** | 3 (leitura) | 3 | 10 | 50 |
| **Templates de Checklist** | 0 (leitura) | 3 | 10 | Ilimitado |
| **Exportações/mês** | 0 | 5 | 20 | Ilimitado |
| **SOS** | Ilimitado | Ilimitado | Ilimitado | Ilimitado |
| **Suporte** | - | Email (72h) | Chat (24h) | Chat (4h) + Telefone |

### 3.1 Definições de Recursos

| Recurso | Descrição |
|---------|-----------|
| **Pacientes** | Número máximo de pacientes que a clínica pode criar. Leitura = visualização sem limite. |
| **Cuidadores** | Número máximo de cuidadores ativos. Leitura = visualização sem limite. |
| **Templates de Checklist** | Número de templates de checklist que a clínica pode criar para uso próprio. |
| **Exportações/mês** | Número deexportações de relatórios/dados (PDF, Excel, CSV) permitidos por mês. |
| **SOS** | Sistema de alertas de emergência. **Disponível em todos os planos sem limite.** |
| **Suporte** | Canal e tempo de resposta do suporte ao cliente. |

### 3.2 Comportamento ao Exceder Limites

- **Bloqueio de criação/edição**: Quando a clínica atinge o limite de um recurso, não pode criar novos registros daquele tipo.
- **Leitura liberada**: Visualização dos dados existentes continua funcionando.
- **Banner de alerta**: Exibir aviso encouraging upgrade quando se aproximar do limite (80%).

---

## 4. Regras de Negócio

### 4.1 Upgrade

- Livre a qualquer momento
- Cobrança pró-rata (valor proporcional aos dias restantes)
- Acesso imediato ao novo plano

### 4.2 Downgrade

- Efetivado ao fim do período de cobrança atual
- Limites do novo plano aplicados imediatamente após expiração
- Dados existentes preservados (mesmo se exceder novo limite - apenas bloqueia novas criações)

### 4.3 Expiração de Assinatura

- Ao expirar, clínica retorna ao plano Free
- Limites do Free aplicados
- Dados preservados

### 4.4 Cancelamento

- Mantém acesso até o fim do período pago
- Não há reembolso (policy padrão)
- Após cancelamento, retorna ao Free

---

## 5. Funcionalidades Futuras (Possibilidades)

> **IMPORTANTE**: As funcionalidades abaixo são **possibilidades futuras** para expansão do modelo de negócio. **Não são确定的 planos de implementação** e estão sujeitas a análise e decisão posterior.

### 5.1 Tabela de Possibilidades

| Categoria | Funcionalidade | Tipo | Descrição |
|-----------|---------------|------|------------|
| **Comunicação** | Chat interno entre cuidadores | Add-on | Sistema de mensagens interno para equipe |
| **Comunicação** | Portal do familiar | Add-on | Portal para familiares acompanharem cuidados |
| **Geolocalização** | Rastreamento GPS | Add-on | Localização em tempo real de cuidadores em campo |
| **Geolocalização** | Check-in/out por GPS | Add-on | Registro de presença via localização |
| **Financeiro** | Fechamento de ponto | Add-on | Automação de controle de horas/trabalho |
| **Financeiro** | Gestão de folha | Add-on | Cálculo e gestão de pagamento de cuidadores |
| **Financeiro** | Notas fiscais | Add-on | Geração de notas fiscais de serviços |
| **Prontuário** | Prontuário eletrônico | Add-on | Registro digital de atendimento ao paciente |
| **Prontuário** | Anexos (exames/imagens) | Add-on | Armazenamento de documentos médicos |
| **Prontuário** | Assinatura digital | Add-on | Assinatura digital de documentos |
| **Medicação** | Controle de medicação | Add-on | Alertas e controle de medicação dos pacientes |
| **Medicação** | Histórico de medicação | Add-on | Registro completo de medicações aplicadas |
| **Medicação** | Relatórios de adherence | Add-on | Relatórios de adherence do paciente |
| **Agendamento** | Agenda e calendário | Add-on | Sistema de agendamento de visitas/consultas |
| **Agendamento** | Lembretes automáticos | Add-on | Notificações automáticas de agendamentos |
| **Integrações** | API para terceiros | Add-on | API REST para integração com outros sistemas |
| **Integrações** | Webhooks | Add-on | Eventos para automações externas |
| **Integrações** | Integração laboratórios | Add-on | Recebimento automático de resultados |
| **Personalização** | White Label | Add-on | Marca customizada para a clínica |
| **Personalização** | Domínio próprio | Add-on | Uso de domínio personalizado |
| **Armazenamento** | GB extras | Add-on | Armazenamento adicional em nuvem |
| **Armazenamento** | Retenção estendida | Add-on |Backup diário automático |
| **Armazenamento** | Backup automático | Add-on |backup diário automático |

### 5.2 Modelo de Add-ons

As funcionalidades futuras podem ser oferecidas como:

1. **Add-on por assinatura** - Valor mensal adicional ao plano
2. **Add-on por uso** - Cobrado por transação/ação
3. **Inclusos em planos superiores** - Alguns add-ons podem ser liberados nos planos mais altos

---

## 6. Implementação Técnica

### 6.1 Campos na Tabela `plans`

```sql
-- Estrutura existente + novos campos para limites
max_patients        integer
max_caregivers      integer
max_checklist_templates integer
max_exports_monthly integer
is_sos_unlimited    boolean
support_channel     text  -- 'email', 'chat', 'phone'
support_response_hours integer
```

### 6.2 Verificação de Limites

```typescript
// Estrutura sugerida em lib/auth.ts
async function checkPlanLimit(clinicId: string, resource: string): Promise<boolean> {
  // Verifica se a clínica pode usar o recurso
  // Retorna true se permitido, false se bloqueado
}

async function getPlanUsage(clinicId: string): Promise<PlanUsage> {
  // Retorna uso atual de cada recurso vs limites do plano
}
```

---

## 7. Status

| Item | Status |
|------|--------|
| Estrutura de planos | ✅ Definido |
| Tabela de limites | ✅ Definido |
| Regras de negócio | ✅ Definido |
| Possibilidades futuras | ✅ Documentado |
| Implementação técnica | Pendente |

---

## 8. Revisões

| Data | Versão | Mudanças |
|------|--------|----------|
| 2026-04-14 | 1.0 | Versão inicial |

---

_Documento criado em 2026-04-14_
