# Estratégia de testes

## Pirâmide

- unitários: regras, schemas e tradução de comandos;
- integração: SQLite, MQTT e WebSocket;
- contrato: payloads REST/MQTT;
- hardware-in-the-loop: fins de curso, servo, sensores e fail-safe;
- ponta a ponta: browser → backend → broker → dispositivo → ack.

## Gates por release

R0.4 exige instalação limpa, health checks e smoke tests. R0.5 exige testes de timeout/idempotência. R0.6 exige bancada física. R0.7 exige latência, interrupção, falhas de rede e custo.

R0.7.1 exige persistência após reinício real, isolamento por usuário, ciclo de
vida da memória, construção determinística do contexto e troca entre dois
adaptadores usando o mesmo `ModelContext`. A auditoria técnica normativa está em
[`MEMORY-AUDIT-2026-07-26.md`](MEMORY-AUDIT-2026-07-26.md).
