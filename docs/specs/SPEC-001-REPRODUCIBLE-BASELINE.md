# SPEC-001 — Baseline reproduzível

**Status:** Draft

## Resultado esperado

Em máquina limpa, um desenvolvedor inicia broker, backend e frontend seguindo um único guia, obtém health verde e executa smoke tests.

## Critérios de aceite

- dependências em UTF-8 e instaláveis;
- `.env.example` sem segredos;
- Compose completo;
- portas coerentes;
- health/readiness;
- testes backend e build frontend no CI;
- documentação validada.
