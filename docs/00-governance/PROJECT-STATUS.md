# Estado atual do projeto

**Atualizado em:** 26/07/2026  
**Branch de referência:** `main`  
**Classificação atual:** protótipo integrado com memória portátil e serviço de contexto neutro funcionais; ainda não é uma release operacional reproduzível.

## Resumo executivo

A CIRCE já possui frontend React com interface espacial, backend FastAPI com REST/WebSocket/MQTT/SQLite, firmware ESP32-S3 para o mecanismo do case e serviços experimentais de voz e visão.

A evolução mais recente implementou o `ContextService` v0.1, que recupera memórias ativas pelo `MemoryService` e coordena o `ContextBuilder` sem expor a persistência aos provedores nem criar dependências de fornecedor no Core.

O principal gargalo continua sendo transformar o protótipo integrado em uma baseline reproduzível, observável e validada ponta a ponta.

## Última entrega concluída

### Context Service v0.1

Concluído:

- integração entre `MemoryService` e `ContextBuilder`;
- recuperação de memórias ativas sem acesso direto ao repositório;
- isolamento de contexto por usuário;
- exclusão de memórias superadas ou excluídas;
- composição neutra de personalidade, histórico, ferramentas e mensagem atual;
- SPEC-004 com escopo e critérios de aceite;
- cinco novos testes de integração;
- 25 testes passando no backend.

PRs relacionados:

- PR #2 — arquitetura de memória independente de provedor;
- PR #3 — contratos e persistência do Memory Core;
- PR #4 — Memory Runtime v0.1 e API REST explícita.
- commit `0353d4d` — validação de persistência após reinício, publicado na `main`;
- commits `41990e5` e `e6f814f` — `ContextBuilder` v0.1, publicados na `main`.

## Maturidade

| Área | Estado | Nível |
|---|---|---:|
| Produto | visão definida, escopo amplo | 3/5 |
| Frontend | protótipo avançado e build validado | 3/5 |
| Backend | MVP funcional com memória explícita | 3/5 |
| Memória | Core, recuperação e construção de contexto funcionais; troca de provedor pendente | 3/5 |
| Firmware | controle mecânico parcial | 2/5 |
| Voz | experimental, sem baseline confiável | 1/5 |
| Visão | protótipo isolado | 2/5 |
| DevOps | broker apenas no Compose | 1/5 |
| Segurança | laboratório | 1/5 |
| Testes | cobertura inicial com 25 testes | 2/5 |

## Implementado e comprovado

- FastAPI, endpoints REST, WebSocket, SQLite e MQTT;
- React/Vite/TypeScript, orbe 3D, store Zustand e controles;
- build de produção do frontend concluído;
- adaptadores experimentais Gemini Live e OpenAI Realtime;
- firmware ESP32-S3 com Wi-Fi, MQTT, servo e fins de curso;
- face tracking MediaPipe e simulador MQTT;
- arquitetura de memória independente de provedor;
- persistência explícita de preferências, fatos, episódios e decisões;
- recuperação da memória após reinício completo do backend;
- API REST de memória com ciclo completo de CRUD;
- contrato e modelo neutro do `ContextBuilder` v0.1;
- composição determinística de contexto sem dependência de provedor;
- `ContextService` v0.1 com recuperação de memória isolada por usuário;
- memórias superadas ou excluídas bloqueadas antes da composição do contexto;
- 25 testes passando no backend.

## Ainda não comprovado

- stack completa iniciada por um único comando;
- autenticação, autorização e gestão segura de segredos;
- confirmação física/acknowledgement de comandos;
- DHT22, PWM de fans e WS2812B no firmware atual;
- voz confiável em produção;
- CI/CD e release reproduzível;
- injeção do contexto em adaptadores de IA;
- troca entre dois adaptadores de IA preservando o mesmo contexto e memória;

## Próximo passo exato

Implementar o contrato de provedor de IA v0.1:

1. definir um contrato neutro que receba `ModelContext`;
2. impedir que adaptadores recebam `MemoryService` ou repositórios;
3. comprovar com dois adaptadores de teste que o mesmo contexto preserva as memórias;
4. manter fora do escopo chamadas reais de rede, voz e streaming.

## Próxima entrega planejada

### Provider Contract v0.1

Objetivo:

- definir a fronteira entre o Core e qualquer provedor de IA;
- entregar somente o `ModelContext` neutro ao adaptador;
- validar a troca de adaptador sem perda de continuidade.

Não inclui:

- integração real com OpenAI ou Gemini;
- voz e streaming;
- embeddings ou banco vetorial;
- memória automática ou emocional;
- agentes autônomos.

## Bloqueios e riscos conhecidos

- `main.py` ainda concentra responsabilidades;
- inicialização usa `@app.on_event("startup")`, já depreciado;
- `declarative_base()` usa import antigo do SQLAlchemy;
- bundle principal do frontend excede 500 kB após minificação;
- segurança ainda adequada apenas para laboratório local;
- voz ainda não possui baseline confiável.

## Como retomar o projeto

1. abrir `docs/00-governance/PROJECT-STATUS.md`;
2. revisar `docs/04-delivery/ROADMAP.md`;
3. revisar `docs/00-governance/CHANGELOG.md`;
4. sincronizar a branch `main`;
5. executar os testes do backend;
6. executar o build do frontend;
7. iniciar pelo item em **Próximo passo exato**.

## Validação rápida do ambiente

Backend:

```powershell
cd C:\Projetos\circe-home-platform\backend
.\venv\Scripts\Activate.ps1
python -m pytest -q
```

Resultado esperado:

```text
25 passed
```

Frontend:

```powershell
cd C:\Projetos\circe-home-platform\frontend
npm install
npm run build
```

Resultado esperado: build concluído sem erro.
