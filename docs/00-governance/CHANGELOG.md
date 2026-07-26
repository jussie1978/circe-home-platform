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
- teste de regressão com dois processos reais do backend para validar persistência após reinício.

### Changed

- `README.md` passa a apontar para uma fonte única da verdade;
- documentação antiga movida para `docs/legacy/`;
- `backend/requirements.txt` normalizado para UTF-8;
- lockfile do frontend atualizado com as ferramentas de lint;
- timestamps de memória normalizados em UTC na fronteira de persistência;
- roadmap atualizado para refletir o estado real da memória portátil;
- `PROJECT-STATUS.md` passa a funcionar como painel oficial de retomada.

### Validated

- backend com 14 testes passando;
- frontend com build de produção concluído;
- ciclo completo de memória validado em SQLite temporário;
- isolamento por usuário e tipo de memória;
- respostas 404 para memórias inexistentes;
- memória revisada e excluída pela API;
- mesma memória recuperada do SQLite após encerrar o primeiro processo Uvicorn e iniciar um segundo processo.

### Deprecated

- documentos em `docs/legacy/` como referência normativa.
