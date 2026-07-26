# Estado atual do projeto

**Atualizado em:** 26/07/2026  
**Branch de referência:** `main`  
**Classificação atual:** protótipo integrado com memória portátil e troca neutra de provedor comprovadas no Core; ainda não é uma release operacional reproduzível.

## Resumo executivo

A CIRCE já possui frontend React com interface espacial, backend FastAPI com REST/WebSocket/MQTT/SQLite, firmware ESP32-S3 para o mecanismo do case e serviços experimentais de voz e visão.

A evolução mais recente concluiu o Provider Contract v0.1 e a auditoria técnica
da memória. Dois adaptadores simulados recebem o mesmo `ModelContext` sem acesso
à persistência, preservando personalidade e memórias durante a troca.

O principal gargalo continua sendo transformar o protótipo integrado em uma baseline reproduzível, observável e validada ponta a ponta.

## Última entrega concluída

### Provider Contract v0.1 e auditoria técnica da memória

Concluído:

- contrato abstrato `AIProvider.complete(ModelContext)`;
- resposta neutra `ProviderResponse`;
- troca entre dois adaptadores simulados usando a mesma instância de contexto;
- preservação da personalidade e das memórias durante a troca;
- fronteira de provedor sem acesso a `MemoryService`, repositórios ou SQLite;
- auditoria técnica documentada com quatro achados corrigidos;
- cópia defensiva de metadados, normalização UTC e validação cronológica;
- validação consistente de identificadores e textos em branco;
- SPEC-005 implementada;
- 35 testes passando no backend.

PRs relacionados:

- PR #2 — arquitetura de memória independente de provedor;
- PR #3 — contratos e persistência do Memory Core;
- PR #4 — Memory Runtime v0.1 e API REST explícita;
- commit `0353d4d` — validação de persistência após reinício, publicado na `main`;
- commits `41990e5` e `e6f814f` — `ContextBuilder` v0.1, publicados na `main`;
- commit `ef91ab0` — implementação completa do `ContextService` v0.1 publicada
  na `main`;
- a entrega atual é o commit que contém a SPEC-005 e este estado consolidado.

## Maturidade

| Área | Estado | Nível |
|---|---|---:|
| Produto | visão definida, escopo amplo | 3/5 |
| Frontend | protótipo avançado e build validado | 3/5 |
| Backend | MVP funcional com memória explícita | 3/5 |
| Memória | Core, recuperação, contexto e troca neutra de provedor comprovados | 4/5 |
| Firmware | controle mecânico parcial | 2/5 |
| Voz | experimental, sem baseline confiável | 1/5 |
| Visão | protótipo isolado | 2/5 |
| DevOps | broker apenas no Compose | 1/5 |
| Segurança | laboratório | 1/5 |
| Testes | cobertura inicial com 35 testes | 3/5 |

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
- 35 testes passando no backend.

## Ainda não comprovado

- stack completa iniciada por um único comando;
- autenticação, autorização e gestão segura de segredos;
- confirmação física/acknowledgement de comandos;
- DHT22, PWM de fans e WS2812B no firmware atual;
- voz confiável em produção;
- CI/CD e release reproduzível;
- integração do contrato com um adaptador real de IA;
- resposta visível na interface utilizando memória persistida;
- autenticação e autorização por proprietário nas operações de memória;
- trilha imutável de criação, revisão e exclusão de memória;
- política de retenção, exportação e backup.

## Próximo passo exato

Implementar o primeiro adaptador real de texto atrás do contrato neutro:

1. manter segredos exclusivamente no backend;
2. conectar `ContextService` → `AIProvider` em uma fatia textual mínima;
3. demonstrar que uma preferência explícita altera a resposta do modelo;
4. manter voz, streaming e seleção automática de provedor fora desse incremento.

## Próxima entrega planejada

### Provider Integration v0.1

Objetivo:

- implementar um adaptador real de texto atrás de `AIProvider`;
- produzir a primeira resposta observável usando a memória persistida;
- preservar o Core e o banco independentes do fornecedor.

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
35 passed
```

Frontend:

```powershell
cd C:\Projetos\circe-home-platform\frontend
npm install
npm run build
```

Resultado esperado: build concluído sem erro.
