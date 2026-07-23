# ADR-0002 — MQTT como barramento local

**Status:** Accepted

## Decisão

Usar MQTT para telemetria e comandos entre backend e dispositivos, com contratos versionados e acknowledgements.

## Consequências

Bom desacoplamento e suporte IoT; requer autenticação, ACLs, QoS apropriado e reconciliação de estado.
