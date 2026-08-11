# Auditoria do Core para orquestração assistida — 11/08/2026

## Objetivo

Avaliar a viabilidade de evoluir a CIRCE para uma inteligência central com
capacidades especializadas, memória durável, briefings e execução de tarefas,
sem confundir apresentação visual com autonomia operacional comprovada.

Esta auditoria usa como referência conceitual sistemas públicos de “AI chief of
staff”, mas as decisões abaixo derivam exclusivamente do estado verificável do
repositório CIRCE.

## Veredito executivo

A evolução é **viável**, desde que implementada como orquestração governada no
monólito modular. A CIRCE já possui quatro fundações úteis:

1. `MemoryService` com persistência independente de provedor;
2. `ContextService` e `ModelContext` neutros;
3. contrato `AIProvider` e primeiro adaptador textual real;
4. contratos de comando físico com `command_id`, ACK e timeout para servos.

Ainda não existe base segura para chamar o produto de autônomo. Faltam catálogo
executável de capacidades, política de risco, aprovação humana, ciclo de
execução persistido, execução de ferramentas no backend, quality gate e
observabilidade de custo/latência.

## Evidências encontradas

| Área | Evidência atual | Avaliação |
|---|---|---|
| Memória | CRUD, SQLite, reinício e isolamento por usuário testados | base reutilizável |
| Contexto | personalidade, histórico, memórias e descrições de ferramentas em `ModelContext` | base reutilizável |
| Provedor | adaptador textual recebe somente contexto pronto | base reutilizável |
| Ferramentas | `ToolDefinition` contém apenas nome e descrição | insuficiente para execução |
| Execução | Gemini Live chama funções diretamente no frontend | inadequado como arquitetura-alvo |
| Segurança | chave Gemini recebida pelo browser; CORS e MQTT abertos | bloqueador fora do laboratório |
| Presença | `check_presence` devolve dado simulado no frontend | não pode ser apresentado como percepção real |
| Comandos físicos | servos possuem prova vertical de ACK/timeout no backend | padrão a ser reaproveitado |
| Auditoria | logs operacionais existem, mas não há `TaskRun`/`ToolRun` persistidos | ausente |
| Agendamento | não há scheduler ou briefing persistido | ausente |

## O que adotar

- uma identidade central da CIRCE diante do usuário;
- capacidades especializadas internas, sem personagens independentes por
  padrão;
- briefings determinísticos baseados em fontes registradas;
- memória explícita, editável e independente de provedor;
- separação entre planejar, aprovar, executar e verificar;
- quality gate para saídas que serão publicadas ou causarão efeitos;
- histórico de execução com correlação, duração, provedor, custo estimado e
  resultado;
- interface capaz de mostrar estados `planned`, `awaiting_approval`, `running`,
  `succeeded`, `failed` e `cancelled`.

## O que não adotar

- “17 agentes” como meta ou métrica de maturidade;
- microserviço por especialista;
- acesso direto do modelo ao MQTT, SQLite, memória ou credenciais;
- gravação automática de toda conversa como memória;
- execução física ou externa sem política e confirmação;
- banco vetorial antes de consultas semânticas mensuráveis;
- alegações de autonomia baseadas apenas em interface, prompt ou demonstração.

## Riscos prioritários e ajustes

### P0 — Segredos e execução no frontend

`frontend/src/services/voiceService.ts` recebe uma chave Gemini e executa
ferramentas localmente. Essa implementação permanece experimental e deve ser
substituída por sessão efêmera ou relay backend. Ferramentas devem ser
registradas e executadas somente pelo Core.

### P0 — Autorização

Não existe identidade autenticada nem política por ator. Até R0.8, o primeiro
incremento de orquestração deve aceitar somente capacidades de leitura e
simulação, em rede confiável.

### P0 — Verdade operacional

Resultados simulados devem ser marcados como `simulated` e nunca alimentar
briefings como fatos. A confirmação de ação física continua dependente de
`reported_state`/ACK.

### P1 — Modelo de execução

Criar `TaskRun`, `ToolRun`, `ApprovalRequest` e `ArtifactRef` persistentes. O
modelo pode propor um plano ou uma chamada de capacidade; o Core valida schema,
risco, autorização e idempotência antes de executar.

### P1 — Especialização

Começar com três capacidades mensuráveis, não com uma equipe fictícia:

1. `home.status.read` — leitura consolidada do estado residencial;
2. `memory.search` — recuperação autorizada da memória do proprietário;
3. `briefing.daily.generate` — resumo diário sem efeitos externos.

Especialistas de pesquisa, engenharia, conteúdo ou operações só entram quando
existir um caso de uso, conjunto de ferramentas e teste de aceitação próprios.

## Sequência recomendada

1. concluir a prova física de ACK do R0.5;
2. remover segredos permanentes e execução de ferramentas do frontend;
3. implementar o runtime v0.1 apenas com leitura, aprovação e auditoria;
4. entregar briefing sob demanda antes de qualquer scheduler;
5. adicionar scheduler somente após idempotência, retenção e recuperação de
   falhas;
6. integrar voz ao mesmo runtime, sem criar um caminho privilegiado;
7. autorizar ferramentas de escrita uma a uma, começando por baixo risco;
8. liberar controles físicos somente após R0.5/R0.6 e R0.8.

## Conclusão

A ideia é compatível com a arquitetura atual e fortalece a visão da CIRCE. O
incremento correto não é “criar agentes”, mas introduzir um runtime governado de
capacidades. A interface humanoide/orbe pode expressar esse runtime, porém não
substitui seus contratos, testes ou trilha de auditoria.
