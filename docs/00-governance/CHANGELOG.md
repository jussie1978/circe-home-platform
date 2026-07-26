# Changelog

## Unreleased

### Added

- estrutura documental profissional por domínio;
- visão, plano mestre, arquitetura, roadmap, backlog e releases;
- baseline de segurança, testes, observabilidade e rastreabilidade;
- ADRs e SPECs iniciais para voz plugável e estado desejado/reportado;
- configuração e dependências de lint do frontend;
- registro verificável da validação da baseline em 23/07/2026;
- ADR-0005 para memória independente de provedor;
- arquitetura oficial de memória do Core;
- domínio `MemoryRecord`, tipos e estados de memória;
- contrato abstrato `MemoryRepository`;
- `MemoryService`;
- adaptador SQLAlchemy e modelo `memory_records`;
- API REST explícita de memória;
- endpoints de criação, listagem, atualização e exclusão;
- testes de domínio, persistência e integração da API;
- teste de regressão com dois processos reais do backend para validar persistência após reinício;
- contrato abstrato `ContextBuilder`;
- modelos neutros `ContextBuildInput`, `ModelContext`, `ConversationTurn` e `ToolDefinition`;
- implementação determinística `DeterministicContextBuilder`;
- testes unitários de composição, ordenação, normalização e filtragem do contexto;
- SPEC-004 para o `ContextService` v0.1;
- `ContextService` para coordenar recuperação de memória e construção de contexto;
- testes de integração do serviço de contexto;
- SPEC-005 para o Provider Contract v0.1;
- contrato abstrato `AIProvider` consumindo somente `ModelContext`;
- resposta neutra `ProviderResponse`;
- testes com dois adaptadores simulados preservando personalidade e memória;
- auditoria técnica da memória em 26/07/2026;
- validações de integridade temporal, metadados e campos textuais da memória.

### Changed

- `README.md` passa a apontar para uma fonte única da verdade;
- documentação antiga movida para `docs/legacy/`;
- `backend/requirements.txt` normalizado para UTF-8;
- lockfile do frontend atualizado com as ferramentas de lint;
- timestamps de memória normalizados em UTC na fronteira de persistência;
- roadmap atualizado para refletir o estado real da memória portátil;
- `PROJECT-STATUS.md` passa a funcionar como painel oficial de retomada;
- metadados de memória passam a ser copiados defensivamente na fronteira do domínio;
- timestamps de memória são normalizados em UTC e validados cronologicamente;
- `MemoryService.recall` normaliza o identificador do usuário;
- API de memória rejeita textos compostos apenas por espaços com HTTP 422;
- roadmap registra a conclusão do marco R0.7.1 no Core.

### Validated

- frontend com build de produção concluído;
- ciclo completo de memória validado em SQLite temporário;
- isolamento por usuário e tipo de memória;
- respostas 404 para memórias inexistentes;
- memória revisada e excluída pela API;
- mesma memória recuperada do SQLite após encerrar o primeiro processo Uvicorn e iniciar um segundo processo;
- contexto neutro construído sem dependências de OpenAI, Gemini, embeddings ou persistência;
- histórico preservado na ordem de entrada, ferramentas ordenadas e memórias ativas priorizadas de forma determinística;
- memórias superadas ou excluídas impedidas de entrar no contexto;
- recuperação de memórias ativas pelo `MemoryService` antes da construção do contexto;
- isolamento do contexto por usuário;
- composição completa sem acesso do serviço a repositórios ou provedores;
- troca entre dois adaptadores simulados usando a mesma instância de `ModelContext`;
- preservação da personalidade e da memória sem acesso do provedor à persistência;
- ausência de dependências de fornecedor ou memória no módulo de provedores;
- cópia defensiva de metadados aninhados;
- normalização UTC e rejeição de cronologia inválida;
- validação uniforme de identificadores e conteúdo em branco;
- backend com 35 testes passando após a auditoria.

### Deprecated

- documentos em `docs/legacy/` como referência normativa.
