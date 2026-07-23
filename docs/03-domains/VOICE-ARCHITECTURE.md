# Arquitetura de voz

## Estado

A integração Gemini Live apresentou baixa confiabilidade no projeto. Existe um adaptador experimental para OpenAI Realtime, mas ele ainda não constitui uma baseline funcional validada.

## Direção

Adotar voz plugável:

```text
VoiceProvider
├── OpenAIRealtimeProvider
├── GeminiLiveProvider (experimental/deprecated até nova validação)
├── PipelineProvider (STT + LLM + TTS)
└── LocalProvider (futuro)
```

## Interface mínima

- `connect()` / `disconnect()`;
- `mute()` / `unmute()`;
- eventos `listening`, `thinking`, `speaking`, `error`;
- interrupção/barge-in;
- function calling;
- métricas de latência e custo.

## Recomendação imediata

Implementar uma prova isolada de OpenAI Realtime via WebRTC, sem MQTT. Depois adicionar uma ferramenta somente de leitura. Só então habilitar comandos físicos com validação no backend.

## Guardrails

- chave permanente somente no backend;
- segredo efêmero para o navegador;
- allowlist de ferramentas;
- confirmação verbal para ações perigosas;
- timeout, idempotência e auditoria.
