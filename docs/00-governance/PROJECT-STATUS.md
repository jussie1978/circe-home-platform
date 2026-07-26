# Estado atual do projeto

**Atualizado em:** 26/07/2026  
**Branch de referência:** `main`  
**Classificação atual:** protótipo integrado com base de memória portátil funcional; ainda não é uma release operacional reproduzível.

## Resumo executivo

A CIRCE já possui frontend React com interface espacial, backend FastAPI com REST/WebSocket/MQTT/SQLite, firmware ESP32-S3 para o mecanismo do case e serviços experimentais de voz e visão.

A evolução mais recente comprovou que a memória do Core persiste em SQLite após o encerramento e a inicialização de um novo processo do backend. O cenário está protegido por teste automatizado de regressão.

O principal gargalo continua sendo transformar o protótipo integrado em uma baseline reproduzível, observável e validada ponta a ponta.

## Última entrega concluída

### Validação de persistência após reinício

Concluído:

- backend iniciado em processo Uvicorn real;
- memória criada pela API REST;
- primeiro processo encerrado;
- segundo processo iniciado usando o mesmo arquivo SQLite;
- mesma memória recuperada integralmente pela API;
- teste automatizado `test_memory_survives_backend_restart`;
- 14 testes passando.

PRs relacionados:

- PR #2 — arquitetura de memória independente de provedor;
- PR #3 — contratos e persistência do Memory Core;
- PR #4 — Memory Runtime v0.1 e API REST explícita.
- branch de entrega `test/memory-restart-persistence`, ainda sem PR.

## Maturidade

| Área | Estado | Nível |
|---|---|---:|
| Produto | visão definida, escopo amplo | 3/5 |
| Frontend | protótipo avançado e build validado | 3/5 |
| Backend | MVP funcional com memória explícita | 3/5 |
| Memória | Core funcional, integração contextual pendente | 3/5 |
| Firmware | controle mecânico parcial | 2/5 |
| Voz | experimental, sem baseline confiável | 1/5 |
| Visão | protótipo isolado | 2/5 |
| DevOps | broker apenas no Compose | 1/5 |
| Segurança | laboratório | 1/5 |
| Testes | cobertura inicial com 14 testes | 2/5 |

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
- 14 testes passando no backend.

## Ainda não comprovado

- stack completa iniciada por um único comando;
- autenticação, autorização e gestão segura de segredos;
- confirmação física/acknowledgement de comandos;
- DHT22, PWM de fans e WS2812B no firmware atual;
- voz confiável em produção;
- CI/CD e release reproduzível;
- troca entre dois provedores de IA preservando continuidade;
- Context Builder usando memória, personalidade e histórico recente.

## Próximo passo exato

Implementar o contrato e o modelo neutro do `ContextBuilder` v0.1:

1. definir entrada e saída independentes de provedor;
2. combinar mensagem atual, histórico recente, memórias explícitas, personalidade e ferramentas;
3. manter ordenação determinística;
4. cobrir o contrato com testes unitários;
5. não integrar ainda OpenAI, Gemini, embeddings ou banco vetorial.

## Próxima entrega planejada

### Context Builder v0.1

Objetivo:

- combinar mensagem atual;
- histórico recente;
- memórias relevantes;
- personalidade do Core;
- ferramentas disponíveis;
- produzir contexto neutro para qualquer provedor de IA.

Não inclui:

- embeddings;
- banco vetorial;
- memória automática;
- inferência de hábitos;
- memória emocional;
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
14 passed
```

Frontend:

```powershell
cd C:\Projetos\circe-home-platform\frontend
npm install
npm run build
```

Resultado esperado: build concluído sem erro.
