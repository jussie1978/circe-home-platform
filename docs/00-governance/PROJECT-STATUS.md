# Estado atual do projeto

**Atualizado em:** 29/07/2026
**Entrega de referência:** merge commit `6644304` na branch `main`, via PR #9

**Classificação atual:** protótipo integrado com memória portátil, primeiro
adaptador textual real validado ao vivo e baseline local reproduzível por
Docker Compose; ainda não é uma release de produção.

## Resumo executivo

A CIRCE já possui frontend React com interface espacial, backend FastAPI com REST/WebSocket/MQTT/SQLite, firmware ESP32-S3 para o mecanismo do case e serviços experimentais de voz e visão.

A evolução mais recente concluiu e validou localmente o Compose de
desenvolvimento para broker, backend e frontend. A CI continua validando os 41
testes do backend, o lint e o build do frontend, sem chaves ou chamadas reais a
provedores.

## Última entrega concluída

### Compose para broker, backend e frontend

Configuração mínima validada sobre a `main` no commit-base `6644304`, ainda sem
commit ou publicação:

- Compose ampliado para os três serviços;
- backend em Python 3.11 na porta `8001`;
- frontend em Node.js 24 na porta `3000`;
- Mosquitto preservado na porta `1883`;
- health checks configurados para os três serviços;
- SQLite direcionado para volume nomeado no Compose;
- defaults de MQTT e SQLite preservados para execução local fora do Docker;
- registro npm configurável no build, com o registro oficial preservado como
  padrão;
- nenhuma chave, segredo ou chamada real a provedor.

Validado em 29/07/2026:

- imagens construídas e três containers iniciados pelo Compose;
- broker, backend e frontend em estado `Healthy`;
- backend respondeu `online` em `http://127.0.0.1:8001/health`;
- frontend abriu normalmente e respondeu HTTP `200`;
- logs sem erros críticos e conexão MQTT ativa;
- SQLite preservado após `docker compose down` e nova subida, com arquivo de
  `61.440 bytes` e SHA-256 idêntico antes e depois.

## Entrega anterior

### CI básica de backend e frontend

Validado na branch `chore/ci-baseline`, commits `0e034bc` e `51183ba`, e
integrado à `main` pelo PR #8, merge commit `7782609`:

- workflow único em `.github/workflows/ci.yml`;
- execução em pull requests para `main` e pushes na `main`;
- job de backend com Python 3.11, instalação por `requirements.txt` e `pytest`;
- job de frontend com Node.js 24 LTS, `npm ci`, lint e build;
- jobs independentes, permissões somente de leitura e limite de 10 minutos;
- nenhuma chave, segredo ou chamada real a provedor.

A execução CI #2 foi concluída com sucesso no GitHub Actions em 29/07/2026.
Os jobs Backend e Frontend passaram sobre o estado final do PR #8, concluindo o
critério de validação remota da CI básica.

## Entrega anterior

### Provider Integration v0.1

Concluído:

- adaptador real `OpenAITextProvider` atrás de `AIProvider`;
- `TextCompletionService` conectando `ContextService` ao provedor;
- chave e modelo configurados apenas no backend;
- `store: false` e limite de 256 tokens no payload da Responses API;
- erros mínimos de configuração, HTTP/rede e resposta vazia;
- teste com SQLite reaberto comprovando memória no payload;
- testes HTTP totalmente simulados, sem rede e sem custo;
- uma chamada real autorizada com `gpt-5-nano` comprovando resposta influenciada
  pela memória persistente;
- SPEC-006 concluída;
- 41 testes passando no backend.

PRs relacionados:

- PR #2 — arquitetura de memória independente de provedor;
- PR #3 — contratos e persistência do Memory Core;
- PR #4 — Memory Runtime v0.1 e API REST explícita;
- commit `0353d4d` — validação de persistência após reinício, publicado na `main`;
- commits `41990e5` e `e6f814f` — `ContextBuilder` v0.1, publicados na `main`;
- commit `ef91ab0` — implementação completa do `ContextService` v0.1 publicada
  na `main`;
- PR #6 — Provider Integration v0.1, commits `531a831` e `da4cb67`,
  integrados à `main` pelo merge commit `e4863d9`.

## Maturidade

| Área | Estado | Nível |
|---|---|---:|
| Produto | visão definida, escopo amplo | 3/5 |
| Frontend | protótipo avançado e build validado | 3/5 |
| Backend | MVP funcional com memória explícita | 3/5 |
| Memória | Core, recuperação, contexto e adaptador textual real testados | 4/5 |
| Firmware | controle mecânico parcial | 2/5 |
| Voz | experimental, sem baseline confiável | 1/5 |
| Visão | protótipo isolado | 2/5 |
| DevOps | Compose local e CI validados | 3/5 |
| Segurança | laboratório | 1/5 |
| Testes | cobertura inicial com 41 testes | 3/5 |

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
- contrato neutro de provedor consumindo somente `ModelContext`;
- troca entre dois adaptadores simulados sem perda de personalidade ou memória;
- auditoria técnica da memória concluída para o escopo local do MVP;
- metadados desacoplados da entrada, timestamps normalizados em UTC e textos
  obrigatórios validados;
- adaptador real da OpenAI Responses API implementado atrás do contrato neutro;
- memória persistida recuperada e traduzida para o payload do provedor;
- resposta real do `gpt-5-nano` influenciada pela memória persistente em uma
  única chamada autorizada;
- 41 testes passando no backend sem chamadas externas;
- baseline local reproduzida em um segundo computador com Python 3.11;
- CI #1 executada com sucesso no GitHub Actions para o commit `0e034bc`;
- jobs remotos Backend e Frontend aprovados no PR #8;
- frontend validado localmente com Node.js 24, `npm ci`, lint e build;
- stack de desenvolvimento iniciada pelo Compose com os três serviços
  saudáveis;
- persistência do SQLite comprovada após recriação dos containers.

## Ainda não comprovado

- autenticação, autorização e gestão segura de segredos;
- confirmação física/acknowledgement de comandos;
- DHT22, PWM de fans e WS2812B no firmware atual;
- voz confiável em produção;
- release reproduzível da stack completa;
- resposta visível na interface utilizando memória persistida;
- autenticação e autorização por proprietário nas operações de memória;
- trilha imutável de criação, revisão e exclusão de memória;
- política de retenção, exportação e backup.

## Próximo passo exato

Revisar o diff final do R0.4 e, após autorização do usuário, criar branch e Pull
Request sem enviar alterações diretamente para a `main`.

## Próxima entrega planejada

### R0.5 — Controle confiável

Objetivo:

- definir command IDs e estados desejado/reportado;
- implementar acknowledgement e timeout de comandos;
- manter o incremento mínimo e coberto por testes.

Não inclui:

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
- voz ainda não possui baseline confiável;
- operações de memória ainda não possuem autenticação, autorização por
  proprietário, trilha imutável, retenção ou backup;
- proveniência ainda é convenção no campo `metadata`, não um atributo obrigatório.
- `CIRCE_OPENAI_MODEL` não possui padrão deliberadamente: o modelo deve ser
  escolhido e autorizado antes da chamada.

## Como retomar o projeto

1. abrir `docs/00-governance/PROJECT-STATUS.md`;
2. revisar `docs/04-delivery/ROADMAP.md`;
3. revisar `docs/00-governance/CHANGELOG.md`;
4. sincronizar a branch `main`;
5. executar os testes do backend;
6. executar o build do frontend;
7. iniciar pelo item em **Próximo passo exato**.

## Validações da entrega atual

- baseline anterior: `35 passed`;
- suíte após a integração: `41 passed`;
- testes automatizados executados sem rede e sem custo;
- compilação Python concluída;
- `git diff --check` sem erros;
- uma chamada real autorizada ao `gpt-5-nano` em 26/07/2026;
- resultado observado: a resposta afirmou a preferência por respostas diretas
  e objetivas, recuperada de um SQLite reaberto;
- a primeira tentativa com execução direta do arquivo falhou na importação antes
  de alcançar a API; a chamada válida ocorreu uma única vez com execução como
  módulo;
- em 29/07/2026, num segundo computador: Python 3.11 com `41 passed`;
- em 29/07/2026, num segundo computador: Node.js 24 com `npm ci`, lint e build
  concluídos;
- em 29/07/2026, execução CI #1 concluída com sucesso no GitHub Actions para o
  commit `0e034bc`;
- jobs Backend e Frontend aprovados no PR #8.
- em 29/07/2026, neste checkout baseado em `6644304`: backend com `41 passed`;
- em 29/07/2026, neste checkout baseado em `6644304`: frontend com Node.js 24,
  lint e build aprovados;
- em 29/07/2026, Docker Compose iniciou broker, backend e frontend, todos
  `Healthy`, nas portas `1883`, `8001` e `3000`;
- smoke tests aprovados: backend `online`, frontend aberto e HTTP `200`, logs sem
  erros críticos e tráfego MQTT ativo;
- SQLite persistiu após recriação dos containers: `61.440 bytes` e SHA-256
  idêntico antes e depois;
- `registry.npmjs.org` apresentou `ECONNRESET` apenas dentro do Docker neste
  notebook; o build foi validado com `registry.npmmirror.com`, mantendo o
  registro oficial como padrão configurável.

## Validação rápida do ambiente

Backend:

```powershell
cd C:\Projetos\circe-home-platform\backend
.\venv\Scripts\python.exe -m pytest -q
```

Resultado esperado:

```text
41 passed
```

Frontend:

```powershell
cd C:\Projetos\circe-home-platform\frontend
npm.cmd ci
npm.cmd run lint
npm.cmd run build
```

Resultado esperado: lint e build concluídos sem erro.
