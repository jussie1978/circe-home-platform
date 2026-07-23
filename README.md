# CIRCE Home Platform

> Plataforma local-first de automação residencial, interface espacial e assistência por voz.

**Estado:** protótipo integrado em estabilização

**Fonte oficial da documentação:** [`docs/INDEX.md`](docs/INDEX.md)
**Estado verificável:** [`docs/00-governance/PROJECT-STATUS.md`](docs/00-governance/PROJECT-STATUS.md)

## O que existe hoje

- frontend React/TypeScript com orbe 3D, painel e telemetria;
- backend FastAPI com REST, WebSocket, SQLite e ponte MQTT;
- firmware ESP32-S3 para mecanismo físico por servo e fins de curso;
- protótipos de voz, visão facial e simulação MQTT.

## Princípios

1. Controle físico local não depende da IA em nuvem.
2. Documentação é parte do produto, não um apêndice.
3. Toda mudança relevante atualiza especificação, decisão e entrega.
4. Estado desejado e estado físico observado não são tratados como equivalentes.
5. Segredos nunca ficam incorporados ao frontend em produção.

## Comece aqui

1. [Visão do produto](docs/01-product/PRODUCT-VISION.md)
2. [Estado atual](docs/00-governance/PROJECT-STATUS.md)
3. [Arquitetura](docs/02-architecture/SYSTEM-ARCHITECTURE.md)
4. [Roadmap](docs/04-delivery/ROADMAP.md)
5. [Backlog](docs/04-delivery/BACKLOG.md)
6. [Como desenvolver](docs/05-operations/DEVELOPMENT.md)

## Estrutura

```text
backend/       API, persistência, WebSocket e MQTT
frontend/      aplicação React, interface 3D e adaptadores de voz
firmware/      firmware ESP32-S3
scripts/       visão e simulação
hardware/      documentação física existente
docs/          fonte oficial de conhecimento do projeto
```

## Regra de trabalho

Nenhuma sessão de desenvolvimento é considerada concluída até que sejam avaliadas e, quando aplicável, atualizadas:

- especificação afetada;
- ADR correspondente;
- backlog e roadmap;
- changelog;
- matriz de rastreabilidade.

Veja [Governança da documentação](docs/00-governance/DOCUMENTATION-GOVERNANCE.md).
