# SPEC-001 — Baseline reproduzível

**Status:** Aprovada

## Resultado esperado

Em máquina limpa, um desenvolvedor inicia broker, backend e frontend seguindo um único guia, obtém health verde e executa smoke tests.

## Critérios de aceite

- [x] dependências em UTF-8 e instaláveis;
- [x] `.env.example` sem segredos;
- [x] Compose completo;
- [x] portas coerentes;
- [x] health/readiness;
- [x] testes backend e build frontend no CI;
- [x] documentação validada.

## Implementação mínima R0.4

- Mosquitto preservado como barramento local na porta `1883`;
- backend FastAPI em Python 3.11 na porta `8001`;
- frontend Vite em Node.js 24 na porta `3000`;
- SQLite persistido em volume nomeado;
- host MQTT e URL do banco configuráveis somente no backend;
- defaults locais preservados para execução fora do Docker;
- health checks nativos, sem novas dependências de aplicação.

A porta `9001` não é exposta porque a configuração atual do Mosquitto não
declara listener WebSocket.

## Validação

Em 29/07/2026, `docker compose up --build --detach` iniciou Mosquitto, backend e
frontend. Os três serviços ficaram `Healthy`, o backend respondeu `online`, o
frontend respondeu HTTP `200`, os logs não apresentaram erros críticos e o
SQLite manteve tamanho e SHA-256 após recriação dos containers.
