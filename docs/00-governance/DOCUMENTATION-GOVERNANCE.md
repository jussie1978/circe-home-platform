# Governança da documentação

## Fonte oficial

Somente os documentos ligados por `docs/INDEX.md` são normativos. `docs/legacy/` é histórico e pode conter conflitos.

## Eventos que exigem atualização

| Evento | Atualização obrigatória |
|---|---|
| nova funcionalidade | SPEC, backlog, testes e changelog |
| mudança arquitetural | ADR, arquitetura e rastreabilidade |
| mudança de API/MQTT | contrato, testes e changelog |
| mudança de prioridade | roadmap e backlog |
| correção relevante | changelog e, se recorrente, ADR ou guideline |
| fim de sessão | registrar decisões, tarefas concluídas e próximo passo |

## Estados documentais

- **Draft:** proposta em discussão;
- **Accepted:** aprovado para implementação;
- **Implemented:** refletido no código e validado;
- **Deprecated:** não orientar novas mudanças;
- **Superseded:** substituído por outro documento.

## Definição de pronto documental

Uma tarefa não está concluída quando altera comportamento sem atualizar os artefatos afetados. O pull request deve responder: o que mudou, por quê, como validar e quais documentos foram atualizados.
