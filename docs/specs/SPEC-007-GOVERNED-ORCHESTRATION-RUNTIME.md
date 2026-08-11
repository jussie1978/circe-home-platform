# SPEC-007 — Runtime de orquestração governada v0.1

**Status:** Proposed

## Problema

A CIRCE consegue construir contexto com memória e obter uma resposta textual,
mas ainda não transforma intenções em tarefas verificáveis. As ferramentas
experimentais de voz são definidas e executadas no frontend, fora de uma
política central e sem registro persistente da execução.

## Objetivo

Implementar a menor fatia segura de orquestração no backend, limitada a
capacidades de leitura e geração de rascunho, com aprovação, auditoria e
independência de provedor preservadas.

## Escopo v0.1

- módulo interno `orchestration` no backend;
- catálogo versionado de capacidades;
- modelos `TaskRun`, `ToolRun` e `ApprovalRequest`;
- máquina de estados determinística para tarefas;
- política de risco R0–R4;
- executor backend com allowlist;
- uma execução por vez por `TaskRun`;
- persistência SQLite;
- endpoint para criar e consultar tarefas;
- endpoint para aprovar ou rejeitar ações que exigem aprovação;
- três capacidades iniciais:
  - `home.status.read`;
  - `memory.search`;
  - `briefing.daily.generate` sob demanda;
- quality gate determinístico para validar fontes, estado e completude do
  briefing;
- métricas básicas de duração, falha e provedor utilizado.

## Fora de escopo

- scheduler e execução noturna automática;
- múltiplos agentes debatendo entre si;
- banco vetorial, RAG amplo ou navegação web;
- envio de e-mail, mensagens ou publicações;
- edição autônoma de memória;
- controles físicos pela IA;
- voz/streaming e interface final do briefing;
- seleção dinâmica de provedor ou fallback automático;
- execução paralela distribuída.

## Modelo de domínio mínimo

### CapabilityDefinition

- `name` e `version`;
- descrição;
- schema de entrada e saída;
- nível de risco;
- timeout;
- indicação de efeito colateral;
- executor backend registrado.

### TaskRun

- `id` e `correlation_id`;
- `owner_id`, ator e canal de origem;
- intenção e plano proposto;
- estado;
- timestamps;
- provedor/modelo quando houver chamada de IA;
- resultado resumido e erro sanitizado.

### ToolRun

- `id`, `task_run_id` e capacidade/versionamento;
- entrada validada e hash de idempotência;
- estado, tentativa, duração e resultado;
- referência de aprovação quando exigida.

### ApprovalRequest

- `id`, `task_run_id`, ação e justificativa;
- risco, solicitante e aprovador;
- decisão, timestamp e expiração.

## Estados

```text
created -> planned -> awaiting_approval -> running -> verifying
        -> succeeded | failed | cancelled
```

- transições inválidas devem ser rejeitadas;
- tarefa expirada não pode executar;
- retry exige a mesma chave de idempotência ou nova tarefa explícita;
- `succeeded` exige verificação concluída;
- resultado de leitura simulado deve carregar `simulated: true`.

## Requisitos funcionais

1. O modelo nunca recebe executor, credencial, sessão de banco ou cliente MQTT.
2. Somente capacidades registradas no backend podem ser propostas ou executadas.
3. Entradas e saídas devem ser validadas por schemas versionados.
4. Toda tarefa deve registrar ator, origem e `correlation_id`.
5. A política deve ser aplicada antes de cada `ToolRun`.
6. Aprovação deve se vincular à ação e aos parâmetros exatos; alterar parâmetros
   invalida a aprovação.
7. O briefing deve citar internamente as fontes usadas e distinguir dado real,
   indisponível e simulado.
8. A falha de uma capacidade não pode alterar estado físico confirmado.
9. O adaptador de IA continua recebendo apenas `ModelContext`.
10. Segredos permanecem exclusivamente no backend.

## Endpoints propostos

```text
POST /api/v1/tasks
GET  /api/v1/tasks/{task_id}
POST /api/v1/tasks/{task_id}/approve
POST /api/v1/tasks/{task_id}/reject
POST /api/v1/briefings/daily
```

Os contratos HTTP finais devem ser versionados antes da implementação.

## Critérios de aceite

- catálogo rejeita capacidade desconhecida ou versão incompatível;
- máquina de estados rejeita transições inválidas;
- política permite R0/R1 e bloqueia R2–R4 sem aprovação adequada;
- aprovação não pode ser reutilizada com parâmetros modificados;
- reiniciar o backend preserva `TaskRun`, `ToolRun` e decisão de aprovação;
- `home.status.read` consulta somente o backend e não publica MQTT;
- `memory.search` respeita `owner_id` e não expõe o repositório ao provedor;
- briefing sob demanda distingue fontes reais, ausentes e simuladas;
- execução repetida com a mesma chave não duplica efeitos;
- logs não contêm chaves, tokens ou memória integral por padrão;
- todos os testes existentes permanecem aprovados;
- novos testes unitários, de persistência, autorização e integração passam sem
  rede e sem custo de API.

## Estratégia de implementação

1. domínio e máquina de estados sem FastAPI, SQLAlchemy ou provedor;
2. repositório e persistência SQLite;
3. catálogo e executores apenas de leitura;
4. política e aprovação;
5. API e observabilidade;
6. briefing determinístico com provedor simulado;
7. prova textual real somente após autorização explícita de custo;
8. integração visual em incremento posterior.

## Gates

- não iniciar antes de preservar o próximo passo exato do R0.5;
- não habilitar efeitos externos antes de autenticação/autorização do R0.8;
- não habilitar ação física até ACK real, persistência de comandos e política
  correspondente estarem validados;
- não adicionar scheduler antes de idempotência e recuperação após reinício.

## Validação

```powershell
cd C:\Projetos\circe-home-platform\backend
.\venv\Scripts\Activate.ps1
python -m pytest -q
python -m compileall -q app tests
```

Também executar lint/build do frontend e `git diff --check` antes da integração.
