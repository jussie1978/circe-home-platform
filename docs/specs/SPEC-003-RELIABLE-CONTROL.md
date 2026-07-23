# SPEC-003 — Controle confiável

**Status:** Draft

## Fluxo

Usuário solicita → backend valida e registra → MQTT publica → dispositivo executa → dispositivo envia ack/report → backend reconcilia → frontend confirma.

## Critérios de aceite

- todo comando tem UUID e expiração;
- duplicatas são idempotentes;
- timeout visível;
- nenhum ack significa estado confirmado;
- histórico registra ator, parâmetros, resultado e duração;
- testes cobrem sucesso, falha, duplicata e dispositivo offline.
