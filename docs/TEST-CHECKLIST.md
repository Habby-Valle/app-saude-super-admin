# Checklist de Testes - App Saúde

> Documento de referência para testes manuais do painel administrativo.

---

## Índice

1. [Autenticação](#1-autenticação)
2. [Super Admin - Clínicas](#2-super-admin---clínicas)
3. [Super Admin - Usuários](#3-super-admin---usuários)
4. [Super Admin - Pacientes](#4-super-admin---pacientes)
5. [Super Admin - Checklists](#5-super-admin---checklists)
6. [Super Admin - Relatórios](#6-super-admin---relatórios)
7. [Super Admin - Logs de Auditoria](#7-super-admin---logs-de-auditoria)
8. [Super Admin - Configurações](#8-super-admin---configurações)
9. [Super Admin - SOS](#9-super-admin---sos)
10. [Clinic Admin - Dashboard](#10-clinic-admin---dashboard)
11. [Clinic Admin - Pacientes](#11-clinic-admin---pacientes)
12. [Clinic Admin - Cuidadores](#12-clinic-admin---cuidadores)
13. [Clinic Admin - Turnos](#13-clinic-admin---turnos)
14. [Clinic Admin - Checklists](#14-clinic-admin---checklists)
15. [Clinic Admin - Relatórios](#15-clinic-admin---relatórios)
16. [Clinic Admin - SOS](#16-clinic-admin---sos)
17. [Testes de Segurança](#17-testes-de-segurança)
18. [Testes de SEO](#18-testes-de-seo)

---

## 1. Autenticação

### Login

- [ ] Usuário consegue fazer login com email e senha corretos
- [ ] Mensagem de erro exibida para credenciais incorretas
- [ ] Redirecionamento para dashboard após login bem-sucedido
- [ ] Sessão persistida ao recarregar a página
- [ ] Logout limpa sessão e redireciona para login

### Autorização

- [ ] Super Admin acessa todas as rotas de Super Admin
- [ ] Super Admin acessa rotas de Clinic Admin
- [ ] Clinic Admin acessa apenas rotas de Clinic Admin
- [ ] Clinic Admin **não** acessa rotas de Super Admin (redirecionar)
- [ ] Usuário não autenticado redirecionado para login

---

## 2. Super Admin - Clínicas

### Listagem

- [ ] Tabela exibe todas as clínicas cadastradas
- [ ] Busca por nome funciona corretamente
- [ ] Filtro por status funciona (ativa/inativa/pendente)
- [ ] Paginação funciona corretamente
- [ ] Contagem de pacientes e cuidadores exibida

### Criação

- [ ] Botão "Nova Clínica" abre modal
- [ ] Validação de campos obrigatórios (nome, CNPJ)
- [ ] CNPJ válido verificado
- [ ] Clínica criada com sucesso
- [ ] Clínica aparece na listagem após criação

### Edição

- [ ] Botão de editar abre modal com dados preenchidos
- [ ] Alterações salvas corretamente
- [ ] Validação funciona na edição

### Exclusão

- [ ] Confirmação antes de excluir
- [ ] Clínica removida da listagem após exclusão
- [ ] Soft delete (status = deleted)

### Detalhes

- [ ] Página de detalhes exibe todas informações
- [ ] Estatísticas corretas (pacientes, cuidadores, turnos)
- [ ] Lista de pacientes vinculados exibida
- [ ] Editar a partir da página de detalhes

---

## 3. Super Admin - Usuários

### Listagem

- [ ] Tabela exibe todos os usuários
- [ ] Busca por nome/email funciona
- [ ] Filtro por perfil funciona (super_admin, clinic_admin, caregiver, family)
- [ ] Filtro por clínica funciona
- [ ] Paginação funciona

### Convite/Criação

- [ ] Botão "Convidar Usuário" abre modal
- [ ] Email válido verificado
- [ ] Seleção de perfil funciona
- [ ] Seleção de clínica funciona (exceto super_admin)
- [ ] Convite enviado com sucesso
- [ ] Email de convite recebido (se configurado)

### Edição

- [ ] Nome do usuário editável
- [ ] Perfil editável
- [ ] Clínica editável
- [ ] Alterações salvas corretamente

### Bloquear/Desbloquear

- [ ] Botão bloqueia usuário com sucesso
- [ ] Badge "Bloqueado" exibido na tabela
- [ ] Botão desbloqueia usuário
- [ ] Badge "Ativo" exibido após desbloqueio
- [ ] Usuário bloqueado não consegue fazer login

### Detalhes

- [ ] Página de detalhes exibe todas informações
- [ ] Data de último acesso exibida
- [ ] Clínica vinculada exibida

---

## 4. Super Admin - Pacientes

### Listagem

- [ ] Tabela exibe todos os pacientes
- [ ] Busca por nome funciona
- [ ] Filtro por clínica funciona
- [ ] Paginação funciona
- [ ] Clínica de origem exibida

### Detalhes

- [ ] Informações pessoais completas
- [ ] Idade calculada corretamente
- [ ] Cuidadores vinculados exibidos
- [ ] Turnos vinculados exibidos
- [ ] Checklists executados exibidos

---

## 5. Super Admin - Checklists

### Listagem

- [ ] Tabela exibe todos os templates
- [ ] Busca por nome funciona
- [ ] Filtro por escopo funciona (global/clínica)
- [ ] Paginação funciona
- [ ] Contagem de itens exibida

### Criação de Template

- [ ] Botão "Novo Template" abre modal
- [ ] Nome do template obrigatório
- [ ] Ícone selecionável
- [ ] Items podem ser adicionados (boolean, text, number, select)
- [ ] Para tipo select, opções podem ser adicionadas
- [ ] Campo "obrigatório" funciona
- [ ] Campo "observação" funciona
- [ ] Template salvo com sucesso

### Edição de Template

- [ ] Itens podem ser reordenados
- [ ] Itens podem ser editados
- [ ] Itens podem ser removidos
- [ ] Novas opções para select podem ser adicionadas

### Duplicação

- [ ] Botão duplicar copia template
- [ ] Cópia criada na clínica correta
- [ ] Mensagem de sucesso exibida

### Exclusão

- [ ] Confirmação antes de excluir
- [ ] Template removido da listagem

---

## 6. Super Admin - Relatórios

### Dashboard de Relatórios

- [ ] Cards de resumo carregados
- [ ] Gráfico de pacientes por clínica carregado
- [ ] Gráfico de atividade por período carregado
- [ ] Filtro por clínica funciona
- [ ] Filtro por período funciona (7 dias, 30 dias, 90 dias)
- [ ] Exportação CSV funciona

### Indicadores

- [ ] Total de pacientes correto
- [ ] Total de cuidadores correto
- [ ] Total de clínicas correto
- [ ] Total de turnos correto

---

## 7. Super Admin - Logs de Auditoria

### Listagem

- [ ] Tabela exibe todos os logs de auditoria
- [ ] Busca por usuário funciona
- [ ] Filtro por ação funciona (create, update, delete)
- [ ] Filtro por entidade funciona (clinic, user, patient, etc.)
- [ ] Filtro por período funciona
- [ ] Paginação funciona

### Detalhes do Log

- [ ] Ação correta exibida
- [ ] Usuário responsável identificado
- [ ] Entidade afetada identificada
- [ ] ID do registro afetado exibido
- [ ] Dados antigos e novos exibidos (quando aplicável)
- [ ] Data/hora correta
- [ ] Endereço IP exibido

### Ações Auditadas

- [ ] Criação de clínica logada
- [ ] Edição de clínica logada
- [ ] Exclusão de clínica logada
- [ ] Criação de usuário logada
- [ ] Bloqueio de usuário logado
- [ ] Desbloqueio de usuário logado
- [ ] Criação de paciente logada
- [ ] Edição de paciente logada
- [ ] Exclusão de paciente logada
- [ ] Início de turno logado
- [ ] Finalização de turno logada
- [ ] Cancelamento de turno logado
- [ ] SOS acionado logado
- [ ] SOS reconhecido logado
- [ ] SOS resolvido logado

---

## 8. Super Admin - Configurações

### Aba Planos

- [ ] Lista de planos exibida
- [ ] Criar novo plano funciona
- [ ] Editar plano funciona
- [ ] Excluir plano funciona
- [ ] Vincular plano a clínica funciona

### Aba Turnos

- [ ] Lista de categorias de turno exibida
- [ ] Criar categoria funciona
- [ ] Editar categoria funciona
- [ ] Excluir categoria funciona

### Aba Sinais Vitais

- [ ] Lista de tipos de sinais vitais exibida
- [ ] Criar tipo funciona
- [ ] Editar tipo funciona
- [ ] Excluir tipo funciona
- [ ] Limites (min/max) configuráveis

---

## 9. Super Admin - SOS

### Dashboard SOS

- [ ] Cards de resumo carregados
- [ ] Total de alertas ativos correto
- [ ] Total de alertas reconhecidos correto
- [ ] Total de alertas resolvidos correto
- [ ] Alertas de hoje corretos

### Listagem de Alertas

- [ ] Tabela exibe todos os alertas
- [ ] Filtro por clínica funciona
- [ ] Filtro por status funciona (active, acknowledged, resolved)
- [ ] Paginação funciona
- [ ] Status badges corretos (vermelho/amarelo/verde)

### Detalhes do Alerta

- [ ] Paciente envolvido identificado
- [ ] Cuidador que acionou identificado
- [ ] Clínica correta exibida
- [ ] Localização exibida (se disponível)
- [ ] Data/hora do acionamento correta
- [ ] Notas exibidas

### Ações no Alerta

- [ ] Botão "Reconhecer" visível para alertas ativos
- [ ] Reconhecer atualiza status para "acknowledged"
- [ ] Data/hora de reconhecimento registrada
- [ ] Usuário que reconheceu registrado
- [ ] Botão "Resolver" visível para alertas reconhecidos
- [ ] Resolver atualiza status para "resolved"
- [ ] Data/hora de resolução registrada
- [ ] Notificação criada para outras clínicas (se aplicável)

### Fluxo Completo SOS

1. [ ] Cuidador/Familiar aciona SOS → status "active"
2. [ ] Super Admin visualiza alerta na listagem
3. [ ] Super Admin clica "Reconhecer" → status "acknowledged"
4. [ ] Super Admin toma ação necessária
5. [ ] Super Admin clica "Resolver" → status "resolved"
6. [ ] Log de auditoria gerado para cada ação

---

## 10. Clinic Admin - Dashboard

### Cards de Resumo

- [ ] Total de pacientes correto
- [ ] Total de cuidadores correto
- [ ] Total de turnos em andamento correto
- [ ] Alertas SOS ativos correto

### Atividade Recente

- [ ] Últimos turnos exibidos
- [ ] Últimos pacientes adicionados exibidos
- [ ] Últimos cuidadores adicionados exibidos
- [ ] Últimos SOS exibidos

### Links Rápidos

- [ ] Link para pacientes funciona
- [ ] Link para cuidadores funciona
- [ ] Link para turnos funciona
- [ ] Link para SOS funciona

---

## 11. Clinic Admin - Pacientes

### Listagem

- [ ] Tabela exibe pacientes da clínica
- [ ] Busca por nome funciona
- [ ] Paginação funciona
- [ ] Número de cuidadores vinculado exibido
- [ ] Data de criação exibida

### Criação

- [ ] Botão "Novo Paciente" abre modal
- [ ] Nome obrigatório
- [ ] Data de nascimento obrigatória
- [ ] Multi-seleção de cuidadores funciona
- [ ] Paciente criado com sucesso
- [ ] Cuidadores vinculados corretamente

### Edição

- [ ] Nome editável
- [ ] Data de nascimento editável
- [ ] Cuidadores editáveis (adicionar/remover)
- [ ] Alterações salvas corretamente

### Exclusão

- [ ] Confirmação antes de excluir
- [ ] Paciente removido da listagem
- [ ] Links com cuidadores removidos

### Detalhes

- [ ] Informações pessoais completas
- [ ] Cuidadores vinculados listados
- [ ] Turnos do paciente listados
- [ ] Checklists executados listados

---

## 12. Clinic Admin - Cuidadores

### Listagem

- [ ] Tabela exibe cuidadores da clínica
- [ ] Busca por nome funciona
- [ ] Paginação funciona
- [ ] Número de pacientes vinculado exibido
- [ ] Status (ativo/bloqueado) exibido

### Criação

- [ ] Botão "Novo Cuidador" abre modal
- [ ] Email obrigatório e válido
- [ ] Nome obrigatório
- [ ] Cuidador criado no Supabase Auth
- [ ] Perfil criado na tabela users
- [ ] Vinculado à clínica correta

### Edição

- [ ] Nome editável
- [ ] Email não editável (para segurança)

### Bloquear/Desbloquear

- [ ] Botão bloqueia cuidador
- [ ] Cuidador bloqueado não consegue acessar

### Exclusão

- [ ] Confirmação antes de excluir
- [ ] Cuidador removido da listagem

---

## 13. Clinic Admin - Turnos

### Listagem

- [ ] Tabela exibe turnos da clínica
- [ ] Busca por paciente/cuidador funciona
- [ ] Filtro por status funciona
- [ ] Paginação funciona
- [ ] Status badges corretos

### Início de Turno

- [ ] Botão "Novo Turno" abre modal
- [ ] Seleção de paciente funciona
- [ ] Seleção de cuidador funciona (filtrado por paciente)
- [ ] Data/hora de início configurável
- [ ] Turno criado com status correto

### Finalização de Turno

- [ ] Botão "Finalizar" visível em turnos em andamento
- [ ] Data/hora de fim configurável
- [ ] Duração calculada e exibida
- [ ] Status atualizado para "completed"

### Cancelamento

- [ ] Botão "Cancelar" visível
- [ ] Motivo opcional pode ser informado
- [ ] Status atualizado para "cancelled"

### Fluxo Completo de Turno

1. [ ] Admin inicia turno → status "in_progress"
2. [ ] Badge "Aguardando início" se data futura
3. [ ] Cuidador inicia turno → status "in_progress"
4. [ ] Cuidador encerra turno → status "completed"
5. [ ] Duração calculada corretamente
6. [ ] Log de auditoria gerado

---

## 14. Clinic Admin - Checklists

### Listagem

- [ ] Checklists globais listados (leitura)
- [ ] Checklists da clínica listados (leitura+edição)
- [ ] Busca por nome funciona
- [ ] Filtro por escopo funciona
- [ ] Paginação funciona

### Duplicação

- [ ] Botão "Duplicar" em checklists globais
- [ ] Cópia criada na clínica
- [ ] Items duplicados corretamente

### Criação (Clínica)

- [ ] Botão "Novo Checklist" abre modal
- [ ] Checklist criado na clínica

### Edição (Clínica)

- [ ] Botão editar visível apenas em checklists da clínica
- [ ] Nome editável
- [ ] Items editáveis
- [ ] Alterações salvas

### Exclusão (Clínica)

- [ ] Botão excluir visível apenas em checklists da clínica
- [ ] Confirmação antes de excluir

### Detalhes

- [ ] Todos os items listados com tipos
- [ ] Badge "obrigatório" exibido
- [ ] Badge "observação" exibido
- [ ] Opções de select listadas

---

## 15. Clinic Admin - Relatórios

### Dashboard de Relatórios

- [ ] Cards de resumo carregados
- [ ] Total de pacientes correto
- [ ] Total de cuidadores correto
- [ ] Total de turnos correto
- [ ] Total de checklists correto

### Gráficos

- [ ] Gráfico de atividade por período carregado
- [ ] Filtro por período funciona (7 dias, 30 dias, 90 dias)
- [ ] Gráfico de distribuição de status de turnos

### Exportação

- [ ] Botão exportar CSV funciona
- [ ] Arquivo baixado com dados corretos

---

## 16. Clinic Admin - SOS

### Dashboard SOS

- [ ] Cards de resumo carregados
- [ ] Total de alertas ativos correto
- [ ] Total de alertas reconhecidos correto
- [ ] Total de alertas resolvidos correto
- [ ] Alertas de hoje corretos

### Listagem de Alertas

- [ ] Apenas alertas da clínica exibidos
- [ ] Filtro por status funciona
- [ ] Paginação funciona

### Ações no Alerta

- [ ] Botão "Reconhecer" visível para alertas ativos
- [ ] Reconhecer atualiza status
- [ ] Botão "Resolver" visível para alertas reconhecidos
- [ ] Resolver atualiza status

### Fluxo Completo SOS

1. [ ] Cuidador/Familiar aciona SOS → status "active"
2. [ ] Clinic Admin visualiza alerta
3. [ ] Clinic Admin clica "Reconhecer" → status "acknowledged"
4. [ ] Notificação enviada para Super Admin
5. [ ] Clinic Admin toma ação
6. [ ] Clinic Admin clica "Resolver" → status "resolved"
7. [ ] Super Admin visualiza resolução
8. [ ] Log de auditoria gerado para cada ação

---

## 17. Testes de Segurança

### RLS (Row Level Security)

- [ ] Clinic Admin vê apenas dados da sua clínica
- [ ] Clinic Admin **não** vê dados de outras clínicas
- [ ] Super Admin vê dados de todas as clínicas
- [ ] Cuidador vê apenas pacientes vinculados a ele

### Validação de Input

- [ ] Formulários rejeitam campos vazios
- [ ] Emails inválidos rejeitados
- [ ] CNPJs inválidos rejeitados
- [ ] Datas futuras permitidas em campos corretos
- [ ] XSS prevention (scripts em campos de texto)

### Autorização de Rotas

- [ ] Middleware bloqueia acesso não autorizado
- [ ] Redirecionamento para 403 ou login

### Sessão

- [ ] Session expira após tempo configurado
- [ ] Logout funciona em todas as páginas

### Dados Sensíveis

- [ ] Senhas não exibidas em lugar nenhum
- [ ] Tokens não expostos no frontend
- [ ] Service Role Key não exposta

---

## 18. Testes de SEO

### Meta Tags

- [ ] Title correto em cada página
- [ ] Description correta em cada página
- [ ] Template de título funciona (Página | App Saúde)

### Open Graph

- [ ] Tags OG presentes
- [ ] Imagem OG carrega corretamente
- [ ] Preview em redes sociais funciona

### Sitemap

- [ ] /sitemap.xml acessível
- [ ] Todas as rotas listadas
- [ ] Prioridades corretas

### Robots.txt

- [ ] /robots.txt acessível
- [ ] Regras corretas aplicadas

### JSON-LD

- [ ] Schema Organization presente
- [ ] Schema WebSite presente
- [ ] Dados corretos

### Performance

- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

---

## Ambiente de Homologação

Antes de publicar em produção, testar **todos** os itens acima em:

1. `NEXT_PUBLIC_APP_ENV=development` (localhost)
2. `NEXT_PUBLIC_APP_ENV=homologation` (ambiente de teste)
3. `NEXT_PUBLIC_APP_ENV=production` (produção)

### Checklist de Homologação

- [ ] Todos os testes acima passar em homologação
- [ ] Dados de teste criados e limpos
- [ ] E-mails de teste enviados e recebidos
- [ ] Integrações com serviços externos testadas
- [ ] Performance aceitável em homologação
- [ ] Backup do banco realizado antes do deploy

---

## Ambiente de Produção

### Pré-Deploy

- [ ] `NEXT_PUBLIC_APP_ENV=production`
- [ ] Variáveis de produção configuradas
- [ ] Supabase URL e Keys de produção
- [ ] APP_URL apontando para produção

### Pós-Deploy

- [ ] Aplica migrations se necessário
- [ ] Verifica RLS policies
- [ ] Testa login com usuários reais
- [ ] Verifica sitemap.xml
- [ ] Verifica robots.txt
- [ ] Testa compartilhamento em redes sociais
- [ ] Configura analytics (opcional)

---

## Links Úteis

- **Development**: http://localhost:3000
- **Homologation**: https://homologacao.appsaude.com.br
- **Production**: https://appsaude.com.br
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## Problemas Conhecidos

> Documentar aqui problemas identificados durante testes que ainda não foram corrigidos.

| #   | Problema | Severidade | Status | Link |
| --- | -------- | ---------- | ------ | ---- |
| 1   | -        | -          | -      | -    |
| 2   | -        | -          | -      | -    |

---

## Assinaturas

| Papel     | Nome | Data |
| --------- | ---- | ---- |
| Testador  |      |      |
| Revisor   |      |      |
| Aprovação |      |      |

---

_Última atualização: 2026-03-27_
