# ADR-0003 — Voz plugável

**Status:** Accepted

## Contexto

A dependência direta do Gemini Live gerou dificuldade operacional e risco de lock-in.

## Decisão

Introduzir uma interface `VoiceProvider`; OpenAI Realtime será o primeiro candidato à baseline, sem remover imediatamente os experimentos existentes.

O contrato inicial recebe opções neutras de conexão e callbacks e expõe `connect`, `disconnect`, `mute` e `unmute`. O Gemini Live existente é o primeiro adaptador colocado atrás dessa interface; isso não promove o experimento a baseline nem implementa OpenAI Realtime.

O incremento seguinte torna `OpenAIRealtimeProvider` o padrão. O navegador negocia WebRTC por `POST /api/v1/voice/session`; o backend usa a chave permanente para encaminhar `sdp` e `session` à interface unificada `POST /v1/realtime/calls`. Nenhuma credencial OpenAI é entregue ao frontend. Gemini permanece como adaptador legado.

Enquanto o MVP for estritamente local e não houver autenticação, o endpoint faturável aceita somente clientes loopback e origens locais explícitas, com rate limit conservador em memória. Essa é uma contenção temporária, não uma fronteira de autenticação, e deverá ser substituída antes de qualquer exposição em LAN ou Internet. A negociação no frontend pode ser cancelada durante `connecting` e possui timeout para garantir a liberação do microfone e dos recursos WebRTC.

## Consequências

Troca de fornecedor e testes ficam mais simples. Haverá custo inicial de abstração e normalização de eventos. A execução em rede permanece bloqueada até a introdução de identidade de usuário e controles distribuídos de abuso/custo.
