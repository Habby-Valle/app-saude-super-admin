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

- [x] Usuário consegue fazer login com email e senha corretos
- [x] Mensagem de erro exibida para credenciais incorretas
- [x] Redirecionamento para dashboard após login bem-sucedido
- [x] Sessão persistida ao recarregar a página
- [x] Logout limpa sessão e redireciona para login

### Autorização

- [x] Super Admin acessa todas as rotas de Super Admin
- [ ] Super Admin acessa rotas de Clinic Admin
- [x] Clinic Admin acessa apenas rotas de Clinic Admin
- [x] Clinic Admin **não** acessa rotas de Super Admin (redirecionar)
- [x] Usuário não autenticado redirecionado para login

---

## 2. Super Admin - Clínicas

### Listagem

- [x] Tabela exibe todas as clínicas cadastradas
- [ ] Busca por nome funciona corretamente
- [x] Filtro por status funciona (ativa/inativa/pendente)
- [x] Paginação funciona corretamente
- [x] Contagem de pacientes e cuidadores exibida

### Criação

- [x] Botão "Nova Clínica" abre modal
- [x] Validação de campos obrigatórios (nome, CNPJ)
- [x] CNPJ válido verificado
- [x] Clínica criada com sucesso
- [x] Clínica aparece na listagem após criação

### Edição

- [x] Botão de editar abre modal com dados preenchidos
- [x] Alterações salvas corretamente
- [x] Validação funciona na edição

### Exclusão

- [ ] Confirmação antes de excluir
- [ ] Clínica removida da listagem após exclusão
- [ ] Soft delete (status = deleted)

### Detalhes

- [x] Página de detalhes exibe todas informações
- [x] Estatísticas corretas (pacientes, cuidadores, turnos)
- [x] Lista de pacientes vinculados exibida
- [ ] Editar a partir da página de detalhes

---

## 3. Super Admin - Usuários

### Listagem

- [x] Tabela exibe todos os usuários
- [ ] Busca por nome/email funciona
- [x] Filtro por perfil funciona (super_admin, clinic_admin, caregiver, family)
- [x] Filtro por clínica funciona
- [x] Paginação funciona

### Convite/Criação

- [x] Botão "Convidar Usuário" abre modal
- [ ] Email válido verificado
- [x] Seleção de perfil funciona
- [x] Seleção de clínica funciona (exceto super_admin)
- [ ] Convite enviado com sucesso
- [x] Email de convite recebido (se configurado)

### Edição

- [x] Nome do usuário editável
- [ ] Perfil editável
- [ ] Clínica editável
- [x] Alterações salvas corretamente

### Bloquear/Desbloquear

- [x] Botão bloqueia usuário com sucesso
- [x] Badge "Bloqueado" exibido na tabela
- [x] Botão desbloqueia usuário
- [x] Badge "Ativo" exibido após desbloqueio
- [ ] Usuário bloqueado não consegue fazer login

### Detalhes

- [x] Página de detalhes exibe todas informações
- [ ] Data de último acesso exibida
- [x] Clínica vinculada exibida

---

## 4. Super Admin - Pacientes

### Listagem

- [x] Tabela exibe todos os pacientes
- [ ] Busca por nome funciona
- [ ] Filtro por clínica funciona
- [x] Paginação funciona
- [x] Clínica de origem exibida

### Detalhes

- [x] Informações pessoais completas
- [x] Idade calculada corretamente
- [x] Cuidadores vinculados exibidos
- [ ] Turnos vinculados exibidos
- [ ] Checklists executados exibidos

---

## 5. Super Admin - Checklists

### Listagem

- [x] Tabela exibe todos os templates
- [ ] Busca por nome funciona
- [x] Filtro por escopo funciona (global/clínica)
- [x] Paginação funciona
- [x] Contagem de itens exibida

### Criação de Template

- [x] Botão "Novo Template" abre modal
- [x] Nome do template obrigatório
- [ ] Ícone selecionável
- [x] Items podem ser adicionados (boolean, text, number, select)
- [x] Para tipo select, opções podem ser adicionadas
- [x] Campo "obrigatório" funciona
- [x] Campo "observação" funciona
- [x] Template salvo com sucesso

### Edição de Template

- [ ] Itens podem ser reordenados
- [ ] Itens podem ser editados
- [ ] Itens podem ser removidos
- [ ] Novas opções para select podem ser adicionadas

### Duplicação

- [x] Botão duplicar copia template
- [x] Cópia criada na clínica correta
- [x] Mensagem de sucesso exibida

### Exclusão

- [x] Confirmação antes de excluir
- [x] Template removido da listagem

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

| #   | Problema                                                                                                                                                             | Severidade | Status        | Link |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------- | ---- |
| 1   | **Autenticação**: Ao deslogar e ser redirecionado para o login, e depois tentar logar novamente, o login não acontece - é necessário recarregar a página manualmente | Alta       | **Corrigido** | -    |
| 2   | **Autenticação**: As informações do usuário logado (session/state) desaparecem quando uma página é recarregada                                                       | Alta       | **Corrigido** | -    |
| 3   | **Segurança**: Super Admin pode acessar painéis de Clinic Admin através de URL direta com ID da clínica - deve permitir redirecionamento apenas nas listagens        | Alta       | **Corrigido** | -    |
| 4   | **UX - Busca**: Input de busca não está com comportamento adequado (atraso, limpar, feedback visual) em todas as listagens                                           | Média      | **Corrigido** | -    |
| 5   | **Validação CNPJ**: Mensagem de erro confusa "Invalid input: expected string, received undefined" ao inserir CNPJ inválido                                           | Média      | **Corrigido** | -    |
| 6   | **Navegação**: Links de detail em clínicas não estão redirecionando corretamente                                                                                     | Média      | **Corrigido** | -    |
| 7   | **CRUD Clínicas**: Implementar soft delete (marcar como deleted) ao invés de exclusão física                                                                         | Média      | **Corrigido** | -    |
| 8   | **Detalhes Clínica**: Página de detalhes da clínica mostra número de usuários zerado (deveria mostrar cuidadores e admins vinculados)                                | Média      | **Corrigido** | -    |
| 9   | **Convite Usuário**: Erro "Email address 'renildorabi@gmail.com' is invalid" ao enviar convite para usuário - mesmo com email válido                                 | Alta       | **Corrigido** | -    |
| 10  | **Edição Usuário**: Não deve ser permitido editar o perfil (role) do usuário após criação                                                                            | Alta       | **Corrigido** | -    |
| 11  | **Edição Usuário**: Não deve ser permitido editar a clínica vinculada ao usuário                                                                                     | Alta       | **Corrigido** | -    |
| 12  | **Bloqueio Usuário**: Usuários bloqueados ainda conseguem fazer login no sistema                                                                                     | Alta       | **Corrigido** | -    |
| 13  | **Detalhes Usuário**: Campo "Último acesso" não está sendo exibido/populado na página de detalhes do usuário                                                         | Média      | **Corrigido** | -    |
| 14  | **Dashboard**: "Histórico de Ações Recentes" não está funcionando - dados não são exibidos                                                                           | Alta       | **Corrigido** | -    |
| 15  | **Filtro Pacientes**: Filtro por clínica não está funcionando na listagem de pacientes                                                                               | Alta       | **Corrigido** | -    |
| 16  | **Detalhes Paciente**: Checklists executados não estão sendo exibidos na página de detalhes                                                                          | Média      | **Corrigido** | -    |
| 17  | **Template Checklist**: Ícone do template deve permitir imagem (PNG/JPG) além dos ícones disponíveis                                                                 | Média      | **Corrigido** | -    |
| 18  | **Edição Checklist**: Ao editar um checklist existente, os itens existentes não estão sendo retornados/preenchidos no formulário                                     | Alta       | **Corrigido** | -    |
| 19  | **Super Admin - Pacientes**: Total de cuidadores vinculados ao paciente não está correto na listagem                                                                 | Média      | **Corrigido** | -    |
| 20  | **Clinic Admin - Pacientes**: Ao adicionar data de nascimento, sempre é exibido 1 dia antes (ex: 15/03/1990 → 14/03/1990)                                            | Alta       | **Corrigido** | -    |
| 21  | **Clinic Admin - Cuidadores**: Exclusão de cuidador não está funcionando                                                                                             | Alta       | **Corrigido** | -    |
| 22  | **Segurança**: Clinic Admin não possui permissões corretas via RLS policies - não consegue acessar/modificar dados da clínica                                        | Alta       | **Corrigido** | -    |

---

## Assinaturas

| Papel     | Nome | Data |
| --------- | ---- | ---- |
| Testador  |      |      |
| Revisor   |      |      |
| Aprovação |      |      |

---

_Última atualização: 2026-04-01_
