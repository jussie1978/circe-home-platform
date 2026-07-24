# Arquitetura de memória

## Objetivo

Garantir continuidade da CIRCE independentemente do modelo de IA utilizado, mantendo memória, identidade e preferências sob controle do Core.

## Princípios

1. A memória pertence ao usuário e ao CIRCE Core.
2. O provedor de IA nunca é a fonte oficial de verdade.
3. Texto e dados estruturados são permanentes; embeddings são índices descartáveis.
4. O modelo recebe somente contexto relevante e autorizado.
5. O MVP grava apenas memórias explícitas e eventos operacionais necessários.

## Componentes

```text
Interaction
    ↓
Memory Candidate Evaluator
    ↓
Memory Manager
    ├── Working Memory
    ├── Episodic Memory
    ├── Semantic Memory
    ├── Preferences
    └── Operational Memory
            ↓
Persistent Store
            ↓
Retrieval / Ranking
            ↓
Context Builder
            ↓
AI Provider Adapter
```

## Tipos de memória do MVP

- **Working Memory:** contexto temporário da interação atual.
- **Preferences:** preferências explicitamente declaradas e aprovadas.
- **Episodic Memory:** decisões e acontecimentos relevantes com origem e data.
- **Operational Memory:** estado necessário para continuidade e auditoria do sistema.

Memória inferida automaticamente, perfil comportamental, memória emocional e consolidação autônoma ficam fora do MVP.

## Modelo mínimo de registro

```text
MemoryRecord
- id
- ownerId
- type
- content
- structuredData
- source
- confidence
- importance
- createdAt
- updatedAt
- expiresAt
- status
```

## Embeddings e índices

Embeddings não são a memória. São derivados regeneráveis usados para recuperação semântica.

Cada índice deve registrar:

- provedor;
- modelo;
- versão;
- data de criação;
- referência ao `MemoryRecord`.

Trocar o modelo de embedding exige reindexação, não migração da memória original.

## Context Builder

O Context Builder monta o pacote enviado ao modelo combinando:

1. personalidade e políticas do Core;
2. resumo da interação atual;
3. memórias relevantes e autorizadas;
4. estado das ferramentas;
5. limites de custo, tamanho e privacidade.

O provedor nunca consulta diretamente o banco de memória.

## Contratos previstos

```ts
interface MemoryProvider {
  save(record: MemoryRecord): Promise<MemoryRecord>;
  search(query: MemoryQuery): Promise<MemoryRecord[]>;
  update(id: string, patch: MemoryPatch): Promise<MemoryRecord>;
  delete(id: string): Promise<void>;
}

interface ContextBuilder {
  build(input: ContextBuildInput): Promise<ModelContext>;
}
```

Os contratos serão implementados somente após validação da baseline e definição do local correto no backend.

## Critérios de aceitação do primeiro incremento

- salvar uma preferência explícita;
- recuperar a preferência em outra sessão;
- trocar o adaptador de IA sem perder a preferência;
- excluir a preferência e impedir nova injeção no contexto;
- registrar origem e data da memória;
- funcionar sem acesso direto do provedor ao armazenamento.
