# CIRCE Home Platform — Estratégia de Testes

## Cobertura existente

`backend/tests/test_controls.py` possui três testes:

1. health/status;
2. controles REST atualizando estado;
3. controles WebSocket e estado completo.

Isso valida o caminho feliz do backend em memória.

## Resultado da auditoria

A execução não chegou à coleta porque o ambiente não tinha `paho-mqtt`. A falha é de dependência do ambiente de análise, não evidência de falha lógica dos testes.

O build frontend também não pôde ser avaliado sem `node_modules`.

## Pirâmide recomendada

### Unidade

- validação de comandos;
- parsing MQTT;
- transições de estado;
- reducers/store;
- conversão e análise de áudio.

### Integração

- FastAPI + SQLite temporário;
- FastAPI + MQTT mock/fake;
- WebSocket com múltiplos clientes;
- command/ack;
- reconnect do frontend.

### Hardware-in-the-loop

- homing;
- fins de curso;
- perda de Wi-Fi/MQTT;
- servo travado;
- watchdog/failsafe.

### Ponta a ponta

- simulador publica telemetria;
- backend persiste e transmite;
- frontend renderiza;
- comando retorna ack confirmado.

## Gates mínimos

- PR: lint, typecheck, pytest e build;
- release: testes de integração e smoke hardware;
- alteração elétrica: checklist de bancada e revisão humana obrigatória.
