# ADR-005 — Backend como Agregador de Estado para o Frontend

- **Status:** aceito no MVP
- **Data:** 22/07/2026

## Contexto

O frontend precisa receber telemetria, visão, voz e estado de controles em tempo real. Conectar o browser diretamente a todos os publishers MQTT aumentaria acoplamento e exposição do broker.

## Decisão

O backend FastAPI agrega mensagens MQTT e transmite um snapshot de estado pelo WebSocket `/ws`. Comandos chegam por WebSocket ou REST e são publicados pelo backend.

## Consequências positivas

- browser não precisa acessar MQTT;
- contrato único para a UI;
- CORS, autenticação e auditoria podem ser centralizados;
- simplifica o protótipo.

## Consequências negativas

- singleton em memória limita escala e múltiplos workers;
- broadcast envia snapshot completo a cada mudança;
- estado enviado pode ser otimista e não confirmado pelo hardware.

## Evolução obrigatória

Antes do R1.0, adicionar estado desejado/relatado, commandId, ack e schema versionado.
