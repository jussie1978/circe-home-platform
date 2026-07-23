# ADR-0003 — Voz plugável

**Status:** Accepted

## Contexto

A dependência direta do Gemini Live gerou dificuldade operacional e risco de lock-in.

## Decisão

Introduzir uma interface `VoiceProvider`; OpenAI Realtime será o primeiro candidato à baseline, sem remover imediatamente os experimentos existentes.

## Consequências

Troca de fornecedor e testes ficam mais simples. Haverá custo inicial de abstração e normalização de eventos.
