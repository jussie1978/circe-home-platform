# SPEC-002 — OpenAI Realtime

**Status:** Draft

## Objetivo

Fornecer conversa em português brasileiro com baixa latência, interrupção e ferramentas controladas.

## Escopo inicial

- endpoint backend para segredo efêmero;
- conexão WebRTC no frontend;
- estados listening/thinking/speaking/error;
- mute, disconnect e barge-in;
- ferramenta somente leitura de status;
- métricas de latência, erros e custo.

## Fora do primeiro incremento

Wake word, memória longa, clonagem de voz e acionamento físico sem confirmação.

## Critérios de aceite

- chave permanente não aparece no bundle;
- 20 sessões de teste sem vazamento de recursos;
- interrupção funciona;
- falha de rede é recuperável;
- ferramenta respeita schema e allowlist;
- custos por sessão são observáveis.
