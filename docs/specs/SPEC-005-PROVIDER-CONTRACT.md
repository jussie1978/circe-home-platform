# SPEC-005 — Provider Contract v0.1

**Status:** Implemented

## Problema

O Core já constrói um `ModelContext` neutro com personalidade, histórico,
memórias, ferramentas e mensagem atual, mas ainda não existe um contrato formal
para entregá-lo a provedores de IA. Sem essa fronteira, adaptadores podem criar
dependências diretas de persistência ou formatos específicos de fornecedor.

## Objetivo

Definir a fronteira mínima entre o CIRCE Core e adaptadores de IA, garantindo
que qualquer provedor receba somente o `ModelContext` pronto e devolva uma
resposta neutra.

## Escopo

- contrato abstrato `AIProvider`;
- operação síncrona `complete(ModelContext)`;
- resposta neutra `ProviderResponse`;
- identificador explícito do adaptador que produziu a resposta;
- dois adaptadores simulados exclusivamente nos testes;
- prova de troca de adaptador preservando o mesmo contexto e as mesmas memórias.

## Fora de escopo

- chamadas reais para OpenAI, Gemini ou outro serviço;
- voz, WebRTC, streaming ou function calling;
- seleção automática de provedor;
- retry, timeout, métricas e controle de custos;
- acesso do adaptador a `MemoryService`, repositórios ou SQLite.

## Requisitos

1. O contrato deve receber somente um `ModelContext`.
2. O contrato não deve importar nem expor serviços ou repositórios de memória.
3. A resposta deve identificar o adaptador e conter texto não vazio.
4. Dois adaptadores diferentes devem aceitar a mesma instância de contexto.
5. A troca de adaptador não deve modificar personalidade, histórico, memórias,
   ferramentas ou mensagem atual.

## Critérios de aceite

- contrato neutro implementado em módulo próprio do Core;
- dois adaptadores simulados recebem a mesma instância de `ModelContext`;
- ambos observam exatamente a mesma personalidade e memória;
- respostas identificam corretamente cada adaptador;
- nenhum SDK ou chamada de rede é adicionado;
- suíte completa do backend passando.

## Riscos

- a operação síncrona é deliberadamente mínima e não representa ainda o
  contrato de streaming necessário para voz;
- timeouts, cancelamento, métricas e tratamento uniforme de falhas serão
  definidos quando o primeiro adaptador real for integrado;
- modelos diferentes podem produzir respostas diferentes mesmo recebendo o
  mesmo contexto, mas a fonte de memória permanece invariável.

## Observabilidade e testes

Os testes usam adaptadores determinísticos que capturam o contexto recebido.
Eles comprovam a identidade da instância, a preservação integral da memória e
da personalidade e a validação da resposta neutra sem rede ou custo de API.
