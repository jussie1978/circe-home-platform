# Estado atual do projeto

**Atualizado em:** 26/07/2026  
**Branch de referência:** `main`  
**Classificação atual:** protótipo integrado com base de memória portátil e construção de contexto neutro funcionais; ainda não é uma release operacional reproduzível.

## Resumo executivo

A CIRCE já possui frontend React com interface espacial, backend FastAPI com REST/WebSocket/MQTT/SQLite, firmware ESP32-S3 para o mecanismo do case e serviços experimentais de voz e visão.

A evolução mais recente implementou o `ContextBuilder` v0.1, capaz de combinar personalidade, histórico recente, memórias explícitas, ferramentas e mensagem atual em um modelo neutro, sem acessar provedores de IA ou persistência.

O principal gargalo continua sendo transformar o protótipo integrado em uma baseline reproduzível, observável e validada ponta a ponta.

## Última entrega concluída

### Context Builder v0.1

Concluído:

- contrato abstrato `ContextBuilder`;
- modelos neutros `ContextBuildInput` e `ModelContext`;
- composição de personalidade, histórico, memórias, ferramentas e mensagem atual;
- preservação da ordem recebida do histórico recente;
- ordenação determinística de memórias por importância, confiança, criação e ID;
- ordenação determinística de ferramentas por nome e descrição;
- exclusão de memórias com estado diferente de `active`;
- seis novos testes unitários;
- 20 testes passando no backend.

PRs relacionados:

- PR #2 — arquitetura de memória independente de provedor;
- PR #3 — contratos e persistência do Memory Core;
- PR #4 — Memory Runtime v0.1 e API REST explícita.
- commit `0353d4d` — validação de persistência após reinício, publicado na `main`;
- entrega atual do `ContextBuilder` v0.1 ainda não publicada.

## Maturidade

| Área | Estado | Nível |
|---|---|---:|
| Produto | visão definida, escopo amplo | 3/5 |
| Frontend | protótipo avançado e build validado | 3/5 |
| Backend | MVP funcional com memória explícita | 3/5 |
| Memória | Core e construção de contexto funcionais; integração de recuperação pendente | 3/5 |
| Firmware | controle mecânico parcial | 2/5 |
| Voz | experimental, sem baseline confiável | 1/5 |
| Visão | protótipo isolado | 2/5 |
| DevOps | broker apenas no Compose | 1/5 |
| Segurança | laboratório | 1/5 |
| Testes | cobertura inicial com 20 testes | 2/5 |

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
- 20 testes passando no backend.

## Ainda não comprovado

- stack completa iniciada por um único comando;
- autenticação, autorização e gestão segura de segredos;
- confirmação física/acknowledgement de comandos;
- DHT22, PWM de fans e WS2812B no firmware atual;
- voz confiável em produção;
- CI/CD e release reproduzível;
- troca entre dois provedores de IA preservando continuidade;
- recuperação de memórias pelo serviço de contexto sem acesso direto do provedor;
- injeção do contexto em adaptadores de IA;

## Próximo passo exato

Implementar o `ContextService` v0.1:

1. recuperar memórias ativas do usuário por meio do `MemoryService`;
2. entregar essas memórias ao `ContextBuilder`;
3. comprovar isolamento por usuário;
4. comprovar que memórias excluídas ou superadas não entram no contexto;
5. não integrar ainda OpenAI, Gemini, embeddings, banco vetorial ou endpoint HTTP.

## Próxima entrega planejada

### Context Service v0.1

Objetivo:

- integrar recuperação de memória e construção de contexto dentro do Core;
- manter o provedor sem acesso direto ao armazenamento;
- preparar a validação posterior de troca entre provedores.

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
20 passed
```

Frontend:

```powershell
cd C:\Projetos\circe-home-platform\frontend
npm install
npm run build
```

Resultado esperado: build concluído sem erro.
