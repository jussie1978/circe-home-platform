# Estado atual do projeto

**Atualizado em:** 26/07/2026  
**Branch de referência:** `main`  
**Classificação atual:** protótipo integrado com base de memória portátil funcional; ainda não é uma release operacional reproduzível.

## Resumo executivo

A CIRCE já possui frontend React com interface espacial, backend FastAPI com REST/WebSocket/MQTT/SQLite, firmware ESP32-S3 para o mecanismo do case e serviços experimentais de voz e visão.

A evolução mais recente consolidou a memória como capacidade do Core, independente do provedor de IA. O domínio de memória, o serviço, o contrato de repositório, o adaptador SQLAlchemy e a API REST explícita estão implementados e cobertos por testes.

O principal gargalo continua sendo transformar o protótipo integrado em uma baseline reproduzível, observável e validada ponta a ponta.

## Última entrega concluída

### Memory Runtime v0.1

Concluído:

- domínio de memória desacoplado de frameworks e provedores;
- contrato `MemoryRepository`;
- `MemoryService`;
- persistência SQLAlchemy/SQLite;
- criação, listagem, revisão e exclusão de memórias;
- API REST explícita em `/api/v1/memories`;
- normalização de timestamps em UTC na fronteira de persistência;
- testes de domínio, repositório e integração da API;
- 13 testes passando.

PRs relacionados:

- PR #2 — arquitetura de memória independente de provedor;
- PR #3 — contratos e persistência do Memory Core;
- PR #4 — Memory Runtime v0.1 e API REST explícita.

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
| Testes | cobertura inicial com 13 testes | 2/5 |

## Implementado e comprovado

- FastAPI, endpoints REST, WebSocket, SQLite e MQTT;
- React/Vite/TypeScript, orbe 3D, store Zustand e controles;
- build de produção do frontend concluído;
- adaptadores experimentais Gemini Live e OpenAI Realtime;
- firmware ESP32-S3 com Wi-Fi, MQTT, servo e fins de curso;
- face tracking MediaPipe e simulador MQTT;
- arquitetura de memória independente de provedor;
- persistência explícita de preferências, fatos, episódios e decisões;
- API REST de memória com ciclo completo de CRUD;
- 13 testes passando no backend.

## Ainda não comprovado

- persistência real validada após reinício completo do backend;
- stack completa iniciada por um único comando;
- autenticação, autorização e gestão segura de segredos;
- confirmação física/acknowledgement de comandos;
- DHT22, PWM de fans e WS2812B no firmware atual;
- voz confiável em produção;
- CI/CD e release reproduzível;
- troca entre dois provedores de IA preservando continuidade;
- Context Builder usando memória, personalidade e histórico recente.

## Próximo passo exato

Validar a persistência real ponta a ponta:

1. iniciar o backend;
2. criar uma memória pela API;
3. parar o backend;
4. iniciar novamente;
5. recuperar a mesma memória do SQLite;
6. registrar o resultado em teste automatizado ou documento de validação.

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
13 passed
```

Frontend:

```powershell
cd C:\Projetos\circe-home-platform\frontend
npm install
npm run build
```

Resultado esperado: build concluído sem erro.
