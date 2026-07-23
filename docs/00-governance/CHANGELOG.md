# Changelog

## Unreleased

### Added
- `OpenAIRealtimeProvider` WebRTC usando o endpoint unificado de calls;
- endpoint `POST /api/v1/voice/session` com testes mockados;
- contrato `VoiceProvider` independente de fornecedor, com `connect`, `disconnect`, `mute` e `unmute`;
- SPEC-004 para o incremento inicial de voz plugável.
- estrutura documental profissional por domínio;
- visão, plano mestre, arquitetura, roadmap, backlog e releases;
- baseline de segurança, testes, observabilidade e rastreabilidade;
- ADRs e SPECs iniciais para voz plugável e estado desejado/reportado.
- configuração e dependências de lint do frontend;
- registro verificável da validação da baseline em 23/07/2026.

### Changed
- endpoint faturável de voz restrito a loopback e origens locais explícitas, com rate limit de três criações por minuto;
- conexão Realtime pode ser cancelada durante `connecting`, aborta a negociação após 15 segundos e libera imediatamente microfone e recursos WebRTC;
- negociação Realtime passa a rejeitar SDP vazio ou sem prefixo `v=0` antes da chamada à OpenAI e registra somente tamanho/prefixo;
- diagnóstico do relay Realtime passa a registrar status/corpo sanitizado e devolver a mensagem real da OpenAI sem expor credenciais ou SDP;
- OpenAI Realtime passa a ser o provedor de voz padrão, com modelo `gpt-realtime-2.1` e voz `marin` configurados no backend;
- estados `CONN`, connecting, listening, thinking, speaking e error passam a refletir eventos reais da sessão;
- integração Gemini Live existente colocada atrás do contrato de provedor de voz;
- `README.md` passa a apontar para uma fonte única da verdade;
- documentação antiga movida para `docs/legacy/`.
- `backend/requirements.txt` normalizado para UTF-8;
- lockfile do frontend atualizado com as ferramentas de lint.

### Deprecated
- documentos em `docs/legacy/` como referência normativa.
