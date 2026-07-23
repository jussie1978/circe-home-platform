# ADR-0001 — Monólito modular

**Status:** Accepted

## Contexto

O produto ainda está em estabilização e não há evidência de escala que justifique microserviços.

## Decisão

Manter FastAPI como monólito modular, com serviços internos e adaptadores bem separados.

## Consequências

Menor complexidade operacional e evolução mais rápida. Exige disciplina de módulos para evitar acoplamento excessivo.
