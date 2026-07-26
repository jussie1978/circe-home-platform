# Estado atual do projeto

**Atualizado em:** 26/07/2026  
**Branch de referência:** `feat/provider-integration-v0.1`, baseada em `main` no
commit `e0618a8`

**Classificação atual:** protótipo integrado com memória portátil e primeiro
adaptador textual real validado ao vivo; ainda não é uma release operacional
reproduzível.

## Resumo executivo

A CIRCE já possui frontend React com interface espacial, backend FastAPI com REST/WebSocket/MQTT/SQLite, firmware ESP32-S3 para o mecanismo do case e serviços experimentais de voz e visão.

A evolução mais recente concluiu o Provider Integration v0.1. O
`OpenAITextProvider` recebe somente o `ModelContext`, e uma preferência
persistida é recuperada após reabertura do SQLite e incluída no payload textual.
Uma única chamada autorizada ao `gpt-5-nano` confirmou que a resposta real usa
essa memória.

O principal gargalo continua sendo transformar o protótipo integrado em uma baseline reproduzível, observável e validada ponta a ponta.

## Última entrega concluída

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
- a entrega atual ainda está sem commit ou push, na branch
  `feat/provider-integration-v0.1`.

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
| DevOps | broker apenas no Compose | 1/5 |
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
- 41 testes passando no backend sem chamadas externas.

## Ainda não comprovado

- stack completa iniciada por um único comando;
- autenticação, autorização e gestão segura de segredos;
- confirmação física/acknowledgement de comandos;
- DHT22, PWM de fans e WS2812B no firmware atual;
- voz confiável em produção;
- CI/CD e release reproduzível;
- resposta visível na interface utilizando memória persistida;
- autenticação e autorização por proprietário nas operações de memória;
- trilha imutável de criação, revisão e exclusão de memória;
- política de retenção, exportação e backup.

## Próximo passo exato

Revisar o diff consolidado e criar o commit da Provider Integration v0.1 na
branch `feat/provider-integration-v0.1`. Solicitar confirmação explícita antes
de qualquer push.

## Próxima entrega planejada

### Publicação da Provider Integration v0.1

Objetivo:

- revisar as alterações consolidadas;
- criar um commit único na branch de feature;
- publicar a branch somente após confirmação explícita;
- abrir PR para revisão antes da integração à `main`.

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
  módulo.

## Validação rápida do ambiente

Backend:

```powershell
cd C:\Projetos\circe-home-platform\backend
.\venv\Scripts\Activate.ps1
python -m pytest -q
```

Resultado esperado:

```text
41 passed
```

Frontend:

```powershell
cd C:\Projetos\circe-home-platform\frontend
npm install
npm run build
```

Resultado esperado: build concluído sem erro.
