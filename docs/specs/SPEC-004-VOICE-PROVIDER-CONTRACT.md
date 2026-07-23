# SPEC-004 — Contrato de provedor de voz

**Status:** Implemented

## Problema

O frontend aciona diretamente a implementação Gemini Live, o que acopla a experiência da IRIS a um fornecedor e impede a troca controlada de adaptadores.

## Objetivo

Definir o menor contrato de voz independente de fornecedor e fazer a integração Gemini existente atendê-lo sem alterar o comportamento visual ou funcional atual.

## Escopo

- contrato TypeScript `VoiceProvider`;
- opções de conexão e callbacks normalizados;
- operações `connect`, `disconnect`, `mute` e `unmute`;
- implementação Gemini Live existente atrás do contrato;
- bloqueio do envio de áudio e desativação da trilha do microfone durante `mute`.

## Fora de escopo

- implementação ou ativação do OpenAI Realtime;
- troca do mecanismo atual de credencial Gemini no navegador;
- novos controles visuais para mute/unmute;
- normalização de métricas, custos, barge-in ou function calling entre provedores;
- inclusão de novas chaves de API.

## Requisitos

1. O consumidor deve depender de `VoiceProvider`, não da classe Gemini.
2. O contrato não deve usar nomes ou tipos específicos de fornecedor.
3. `disconnect` deve encerrar WebSocket, captura e reprodução de áudio como já fazia.
4. `mute` deve desativar as trilhas de áudio e impedir o envio de novos chunks.
5. `unmute` deve reativar as trilhas e o envio de áudio.
6. A sessão deve iniciar desmutada para preservar o comportamento existente.

## Critérios de aceite

- lint e build do frontend passam;
- testes existentes do backend passam;
- o fluxo visual de conexão e desconexão permanece inalterado;
- nenhuma nova chave ou segredo aparece no diff;
- o adaptador OpenAI existente não é ativado nem ampliado.

## Riscos

- mute/unmute não possui teste automatizado de navegador nesta baseline;
- a credencial Gemini legada continua sendo tratada no frontend e permanece como débito de segurança já registrado.

## Observabilidade e testes

- validação estática por TypeScript e ESLint;
- build de produção do frontend;
- testes automatizados existentes do backend;
- validação manual de microfone e Gemini depende de navegador, permissão de áudio e credencial externa.
