# SPEC-004 — Context Service v0.1

**Status:** Implemented

## Problema

O `ContextBuilder` recebe memórias candidatas, mas ainda não existe uma camada do
Core que recupere as memórias persistidas do usuário e coordene a construção do
contexto. Sem essa camada, um adaptador de IA poderia acabar acessando a
persistência diretamente.

## Objetivo

Integrar `MemoryService` e `ContextBuilder` dentro do Core, mantendo o contexto
independente de provedor e o armazenamento invisível aos adaptadores de IA.

## Escopo

- recuperar memórias ativas pelo `MemoryService`;
- respeitar o isolamento por usuário;
- entregar as memórias recuperadas ao `ContextBuilder`;
- compor personalidade, histórico, ferramentas e mensagem atual;
- devolver um `ModelContext` neutro.

## Fora de escopo

- endpoints HTTP;
- integração com OpenAI, Gemini ou outro provedor;
- embeddings ou banco vetorial;
- seleção semântica de memórias;
- memória automática, emocional ou inferência de hábitos.

## Requisitos

1. O serviço deve exigir um `user_id` não vazio.
2. O serviço deve recuperar memórias exclusivamente pelo `MemoryService`.
3. O serviço deve repassar ao builder apenas as memórias ativas do usuário.
4. O serviço não deve acessar repositórios, banco de dados ou provedores.
5. O resultado deve usar o modelo neutro `ModelContext`.

## Critérios de aceite

- contexto completo construído com memória persistida;
- memórias de outro usuário ausentes do resultado;
- memórias superadas ou excluídas ausentes do resultado;
- nenhum endpoint ou adaptador de provedor adicionado;
- suíte completa do backend passando.

## Riscos

- a recuperação v0.1 usa o limite padrão do `MemoryService` e ainda não aplica
  relevância semântica ou orçamento de tokens;
- a seleção atual é adequada ao MVP explícito, mas precisará de política própria
  antes de crescer o volume de memória.

## Observabilidade e testes

Testes de integração com SQLite temporário comprovam composição, isolamento por
usuário, filtragem de estados e normalização do identificador.
