# ADR-0004 — Desired e Reported State

**Status:** Accepted

## Decisão

Separar estado solicitado do estado confirmado pelo dispositivo. Toda ação recebe `command_id`, expiração e resultado.

## Consequências

A interface passa a mostrar estados pending/confirmed/failed. A confiabilidade aumenta, mas firmware e backend precisam implementar ack.
