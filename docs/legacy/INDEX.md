# CIRCE Home Platform — Índice de Documentação

**Gerado a partir do repositório em:** 22/07/2026
**Princípio:** o código e os documentos aprovados são a fonte da verdade; hipóteses estão explicitamente marcadas.

## Comece por aqui

1. [PROJECT-STATUS.md](PROJECT-STATUS.md) — estado real, evidências, lacunas e riscos.
2. [ARCHITECTURE.md](ARCHITECTURE.md) — arquitetura atual implementada.
3. [ROADMAP.md](ROADMAP.md) — sequência recomendada de evolução.
4. [BACKLOG.md](BACKLOG.md) — tarefas priorizadas e critérios de aceite.
5. [DEVELOPMENT.md](DEVELOPMENT.md) — como preparar, executar e validar o ambiente.

## Referência técnica

- [API.md](API.md) — endpoints REST e WebSocket.
- [MQTT-CONTRACT.md](MQTT-CONTRACT.md) — tópicos, payloads e responsabilidades.
- [DATA-MODEL.md](DATA-MODEL.md) — modelo SQLite/SQLAlchemy.
- [SECURITY.md](SECURITY.md) — riscos e controles mínimos.
- [TEST-STRATEGY.md](TEST-STRATEGY.md) — estado dos testes e estratégia recomendada.
- [TRACEABILITY.md](TRACEABILITY.md) — rastreabilidade entre requisitos, código e documentos.
- [CHANGELOG.md](CHANGELOG.md) — registro da consolidação documental.

## Decisões arquiteturais

- [ADR-001](adrs/ADR-001-fastapi-choice.md) — FastAPI.
- [ADR-002](adrs/ADR-002-mqtt-architecture.md) — MQTT.
- [ADR-003](adrs/ADR-003-sqlite-initial-db.md) — SQLite.
- [ADR-004](adrs/ADR-004-hybrid-voice-architecture.md) — voz híbrida com execução local.
- [ADR-005](adrs/ADR-005-websocket-state-sync.md) — sincronização de estado pelo backend.

## Documentos já existentes e preservados

- `SPEC-001-PLATFORM.md`
- `SPEC-003-VISION.md`
- `DESIGN-SYSTEM.md`
- `IRIS-IDENTITY.md`
- `BRAINSTORMING-IRIS-EVOLUTION.md`
- relatórios e plano do Sprint 000

## Regra operacional

Nenhuma decisão relevante deve existir apenas em conversa. Mudanças de arquitetura geram ADR; mudanças de escopo atualizam SPEC e ROADMAP; entregas atualizam PROJECT-STATUS, BACKLOG e CHANGELOG.
