# SPEC-002 — OpenAI Realtime

**Status:** In Progress

## Objetivo

Fornecer conversa em português brasileiro com baixa latência, interrupção e ferramentas controladas.

## Incremento funcional implementado

- `OpenAIRealtimeProvider` WebRTC como provedor padrão do frontend;
- oferta SDP criada no navegador e enviada para `POST /api/v1/voice/session`;
- oferta SDP validada no navegador e novamente no backend antes da chamada externa;
- backend encaminha SDP e configuração para `POST /v1/realtime/calls`;
- modelo `gpt-realtime-2.1` e voz `marin` definidos somente no backend;
- `OPENAI_API_KEY` lida somente do ambiente do backend;
- estados de conexão e atividade derivados de WebRTC e eventos Realtime;
- `connect`, `disconnect`, `mute` e `unmute`;
- cancelamento idempotente durante `connecting`, com aborto do fetch, liberação imediata do microfone e timeout de negociação de 15 segundos;
- erros explícitos para backend, configuração, microfone e OpenAI;
- erros não-2xx da OpenAI com status e corpo sanitizado nos logs e mensagem real sanitizada no frontend;
- proteção temporária do endpoint por loopback, allowlist de origens locais e rate limit em memória de três criações por minuto;
- testes do endpoint com cliente OpenAI mockado, incluindo acessos permitidos, rejeitados e rate limit.

## Escopo ainda pendente

- ferramenta somente leitura de status;
- métricas de latência, erros e custo.
- validação de 20 sessões em navegador;

## Fora do primeiro incremento

Wake word, memória longa, clonagem de voz e acionamento físico sem confirmação.

## Critérios de aceite

- chave permanente não aparece no bundle;
- 20 sessões de teste sem vazamento de recursos (pendente);
- interrupção funciona;
- falha de rede é recuperável;
- ferramenta respeita schema e allowlist (pendente);
- custos por sessão são observáveis (pendente).

## Restrição de implantação

A proteção atual é exclusiva do MVP executado em uma única máquina e não equivale a autenticação. Antes de expor o backend na LAN ou na Internet, o endpoint faturável deverá exigir identidade de usuário e controles compartilhados de sessão, taxa e custo.
