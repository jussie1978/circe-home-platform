# Auditoria técnica da memória — 26/07/2026

## Resultado

**Aprovado com restrições para o MVP local.**

O subsistema preserva a memória fora dos provedores de IA, mantém isolamento na
recuperação por usuário, sobrevive ao reinício do backend, respeita o ciclo de
vida ativo/superado/excluído e entrega somente um `ModelContext` pronto aos
adaptadores.

Esta auditoria técnica está concluída. Ela não equivale à implementação de uma
trilha operacional de auditoria de alterações, que permanece pendente para
R0.8 junto com autenticação, autorização, retenção e backup.

## Escopo examinado

- domínio `MemoryRecord`;
- `MemoryService` e contrato `MemoryRepository`;
- adaptador SQLAlchemy/SQLite;
- API REST explícita;
- `ContextBuilder` e `ContextService`;
- contrato neutro de provedor;
- testes unitários, de persistência, API, reinício e troca de adaptador;
- ADR-0005, SPEC-004 e SPEC-005.

## Evidências

| Controle | Evidência | Resultado |
|---|---|---|
| Fonte de verdade no Core | `MemoryRepository` e SQLite sem SDK de IA | Conforme |
| Persistência real | teste com dois processos Uvicorn | Conforme |
| Isolamento de recuperação | testes por `user_id` e contexto | Conforme |
| Estados da memória | ativa, superada e excluída | Conforme |
| Exclusão | remoção física e ausência em nova recuperação | Conforme |
| Contexto neutro | `ModelContext` sem formato de fornecedor | Conforme |
| Fronteira do provedor | `AIProvider.complete(ModelContext)` | Conforme |
| Troca de adaptador | dois adaptadores recebem a mesma instância de contexto | Conforme |
| Validação textual | campos obrigatórios rejeitam valores em branco | Conforme |
| Integridade temporal | timestamps normalizados em UTC e ordem validada | Conforme |
| Integridade de metadados | cópia defensiva inclusive para estruturas aninhadas | Conforme |

## Achados corrigidos nesta auditoria

### A-01 — Referência mutável de metadados

O registro podia conservar a mesma referência recebida do chamador e sofrer
alterações externas depois de criado.

**Correção:** cópia defensiva profunda na fronteira do domínio.

### A-02 — Cronologia sem validação no domínio

Datas fornecidas diretamente podiam permanecer sem fuso horário ou apresentar
`updated_at` anterior a `created_at`.

**Correção:** normalização UTC e validação cronológica.

### A-03 — Texto composto apenas por espaços

Entradas em branco podiam atravessar a validação superficial da API e gerar
erro de domínio não traduzido.

**Correção:** normalização e resposta HTTP 422 para criação, consulta e revisão.

### A-04 — Recuperação inconsistente com identificador espaçado

O domínio normalizava `user_id` ao salvar, mas a recuperação direta pelo serviço
não aplicava a mesma regra.

**Correção:** normalização e rejeição de identificador vazio no `MemoryService`.

## Riscos aceitos e trabalho pendente

| Risco | Impacto | Destino |
|---|---|---|
| API sem autenticação e autorização por proprietário | alto fora de laboratório | R0.8 |
| ausência de trilha imutável de criação/revisão/exclusão | alto para operação auditável | R0.8 |
| origem/proveniência permanece convenção em `metadata` | médio | próximo incremento de governança da memória |
| ausência de política de retenção, exportação e backup | alto para dados duráveis | R0.8 |
| ausência de migrações versionadas e índice composto | médio com crescimento | baseline operacional |
| ausência de controle de concorrência por versão | médio em uso multioperador | após autenticação |
| recuperação limitada e sem orçamento de tokens | médio com grande volume | evolução do Context Builder |

## Limite de aprovação

A aprovação vale apenas para execução local em ambiente confiável e para
memórias explícitas do MVP. O subsistema não deve ser exposto à internet nem
usado como armazenamento multiusuário seguro antes dos controles de R0.8.
