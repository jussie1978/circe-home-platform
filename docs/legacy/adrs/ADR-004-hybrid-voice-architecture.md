# ADR-004 — Arquitetura de Voz Híbrida com Execução Local

- **Status:** aceito como direção; implementação experimental
- **Data:** 20/07/2026

## Contexto

A CIRCE busca voz natural e baixa latência, mas também pretende manter controle doméstico local e privacidade operacional. O repositório contém integração Gemini Live no frontend e um adaptador separado para GPT Realtime.

## Decisão

Usar provedores de voz em streaming como camada conversacional substituível. Chamadas de função são validadas e executadas pela plataforma local; o provedor de IA não acessa diretamente o barramento MQTT.

## Consequências positivas

- conversa mais fluida;
- controle local desacoplado do fornecedor;
- possibilidade de fallback entre provedores;
- manutenção do núcleo de automação sem nuvem.

## Consequências negativas

- áudio pode sair da rede local;
- dependência de internet e custo variável;
- gestão de chaves/tokens;
- necessidade de normalizar function calling entre provedores.

## Restrições

- não armazenar chave permanente no navegador em produção;
- não executar ações perigosas sem validação/confirmacão local;
- documentar claramente quando áudio é transmitido à nuvem;
- manter modo de controle local sem voz.
