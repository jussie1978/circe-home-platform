# Arquitetura de voz

## Estado

O frontend possui um contrato `VoiceProvider` independente de fornecedor. `OpenAIRealtimeProvider` é o adaptador padrão do MVP e usa WebRTC pela interface unificada de calls; o Gemini Live permanece disponível apenas como adaptador legado. A validação ponta a ponta em navegador ainda está pendente.

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

- `connect(options)` / `disconnect()`, com cancelamento durante negociação e liberação idempotente de recursos;
- `mute()` / `unmute()`, implementados nos adaptadores OpenAI e Gemini;
- eventos `listening`, `thinking`, `speaking`, `error`;
- interrupção/barge-in;
- function calling;
- métricas de latência e custo.

## Recomendação imediata

Validar o ciclo de vida, áudio e mute/unmute do OpenAI Realtime em navegador. Depois adicionar uma ferramenta somente de leitura. Só então habilitar comandos físicos com validação no backend.

## Guardrails

- chave permanente somente no backend;
- nenhuma credencial de provedor no navegador; o backend encaminha a oferta SDP;
- endpoint faturável restrito temporariamente a loopback/origens locais, com rate limit conservador; autenticação é obrigatória antes de exposição em rede;
- allowlist de ferramentas;
- confirmação verbal para ações perigosas;
- timeout, idempotência e auditoria.
