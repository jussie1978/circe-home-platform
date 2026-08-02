# Estado atual do projeto

**Atualizado em:** 02/08/2026
**Entrega de referência:** merge commit
`9762144021ced018c80e6c208a0acb392961b156` na branch `main`, via PR #14
**Incremento atual:** prova vertical de acknowledgement e timeout do R0.5 para
teto/servos integrada à `main`; R0.5 ainda parcial

**Classificação atual:** protótipo integrado com memória portátil, primeiro
adaptador textual real validado ao vivo e baseline local reproduzível por
Docker Compose; ainda não é uma release de produção.

## Resumo executivo

A CIRCE já possui frontend React com interface espacial, backend FastAPI com REST/WebSocket/MQTT/SQLite, firmware ESP32-S3 para o mecanismo do case e serviços experimentais de voz e visão.

Na `main`, o teto/servos possui agora a primeira prova vertical de comando
confiável: criação como `pending`, envelope MQTT oficial, ACK correlacionado
pelo `command_id` e timeout determinístico. O registro ainda é efêmero e a R0.5
permanece parcial.

## Incremento integrado — R0.5 teto/servos

- escopo restrito a `POST /api/v1/controls/servos` e à infraestrutura MQTT
  mínima necessária;
- comando criado com status `pending`, `command_id`, `requested_at`, `actor`,
  `value` e `expires_at`;
- publicação oficial em `circe/alx/case/command/servos`;
- assinatura e processamento de ACK em
  `circe/alx/case/ack/{command_id}`;
- `reported_state`, `roof_angle` e `fins_state` confirmados somente após ACK
  válido e correlacionado;
- transição determinística de `pending` para `failed` no timeout;
- ACK desconhecido, divergente, inválido ou posterior ao timeout ignorado sem
  confirmar o estado;
- compatibilidade temporária preservada pela publicação escalar em
  `alx/case/servos/angle`;
- registro de comandos ainda efêmero, sem persistência ou histórico;
- fans, LEDs, frontend, firmware e homing não foram alterados e permanecem
  pendentes;
- revisão final encontrou e corrigiu uma corrida entre callback MQTT, rota REST
  e expiração, protegendo a correlação e as transições com lock;
- prova vertical integrada à `main` pelo PR #14, merge commit
  `9762144021ced018c80e6c208a0acb392961b156`.

A evolução mais recente concluiu e validou localmente o Compose de
desenvolvimento para broker, backend e frontend. A CI continua validando os 41
testes do backend, o lint e o build do frontend, sem chaves ou chamadas reais a
provedores.

## Última entrega concluída

### Compose para broker, backend e frontend

Configuração mínima integrada à `main` pelo PR #10, merge commit `fb2d4ef`,
após validação local e aprovação dos jobs Backend e Frontend:

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
| Testes | contratos físicos e regressão com 48 testes | 3/5 |

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
- contrato neutro de comandos físicos com `command_id`, `desired_state` e `reported_state`;
- cinco endpoints REST de controle integrados ao contrato, preservando os campos legados;
- 48 testes passando no backend sem chamadas externas;
- baseline local reproduzida em um segundo computador com Python 3.11;
- CI #1 executada com sucesso no GitHub Actions para o commit `0e034bc`;
- jobs remotos Backend e Frontend aprovados no PR #8;
- frontend validado localmente com Node.js 24, `npm ci`, lint e build;
- stack de desenvolvimento iniciada pelo Compose com os três serviços
  saudáveis;
- persistência do SQLite comprovada após recriação dos containers.

## Ainda não comprovado

- autenticação, autorização e gestão segura de segredos;
- acknowledgement real emitido pelo firmware e validado em bancada; a prova
  atual do teto/servos usa ACK MQTT exercitado por testes;
- DHT22, PWM de fans e WS2812B no firmware atual;
- voz confiável em produção;
- release reproduzível da stack completa;
- resposta visível na interface utilizando memória persistida;
- autenticação e autorização por proprietário nas operações de memória;
- trilha imutável de criação, revisão e exclusão de memória;
- política de retenção, exportação e backup.

## Próximo passo exato

Implementar em incremento separado a emissão de ACK real pelo firmware para
teto/servos e validá-la em bancada. Fans, LEDs, frontend, homing e persistência
do registro de comandos continuam fora dessa entrega e permanecem pendentes.
## Próxima entrega planejada

### R0.5 — Acknowledgement e timeout

Objetivo:

- [x] provar no backend o contrato de acknowledgement do teto/servos;
- [x] correlacionar ACK MQTT do teto/servos pelo `command_id`;
- [x] distinguir comandos do teto/servos pendentes, confirmados e expirados;
- [x] implementar timeout determinístico para o teto/servos;
- [ ] persistir o registro e o histórico dos comandos;
- [ ] implementar emissão de ACK real no firmware e validação em bancada;
- [ ] estender o contrato confiável aos demais controles físicos;
- preservar compatibilidade com os endpoints REST existentes;
- cobrir o incremento com testes automatizados.

Não inclui:

- voz e streaming;
- embeddings ou banco vetorial;
- memória automática ou emocional;
- agentes autônomos;
- catálogo amplo de dispositivos.

## Bloqueios e riscos conhecidos

- o registro de comandos do teto/servos é apenas em memória e se perde no
  reinício do backend;
- o firmware ainda não emite o ACK oficial; não há confirmação física real
  validada em bancada;
- fans e LEDs ainda não possuem ACK, timeout ou reconciliação;

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

- em 02/08/2026, suíte focal final do contrato de teto/servos aprovada:
  `19 passed, 4 warnings`;
- em 02/08/2026, regressão completa do backend aprovada:
  `57 passed, 4 warnings`;
- `python -m compileall -q app tests` aprovado;
- `git diff --check` aprovado;
- revisão integral do diff confirmou ausência de alterações em fans, LEDs,
  frontend, firmware e homing;
- PR #14 integrado à `main` pelo merge commit
  `9762144021ced018c80e6c208a0acb392961b156`;

- em 01/08/2026, 7 testes específicos do contrato físico aprovados;
- em 01/08/2026, regressão completa do backend aprovada: `48 passed, 3 warnings`;
- os avisos restantes correspondem ao `declarative_base()` antigo e ao `@app.on_event("startup")` depreciado;

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
- PR #10 aprovado nos jobs Backend e Frontend e integrado à `main` pelo merge
  commit `fb2d4ef`;
- branch local `main` sincronizada com `origin/main`, com working tree limpa;
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
57 passed
```

Frontend:

```powershell
cd C:\Projetos\circe-home-platform\frontend
npm.cmd ci
npm.cmd run lint
npm.cmd run build
```

Resultado esperado: lint e build concluídos sem erro.
