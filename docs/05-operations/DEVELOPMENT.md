# Desenvolvimento

## Pré-requisitos

- Python 3.11+;
- Node.js compatível com o lockfile;
- Docker/Compose;
- PlatformIO para firmware.

## Estado atual de execução

O Compose original sobe apenas Mosquitto. Backend e frontend devem ser iniciados separadamente até a tarefa R0.4 ser concluída.

## Fluxo Git

- branches curtas: `feat/`, `fix/`, `docs/`, `chore/`;
- commits focados;
- PR com contexto, validação, riscos e documentos atualizados;
- nenhuma alteração de arquitetura sem ADR.

## Definition of Done

Código revisado, testes relevantes executados, documentação atualizada, migração/rollback descritos e ausência de segredo no diff.
