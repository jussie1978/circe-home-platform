# Desenvolvimento

## Pré-requisitos

- Python 3.11+;
- Node.js compatível com o lockfile;
- Docker/Compose;
- PlatformIO para firmware.

## Estado atual de execução

O Compose constrói e inicia Mosquitto, backend e frontend. A execução completa,
os health checks, os smoke tests e a persistência do SQLite foram validados em
29/07/2026.

## Execução com Compose

Na raiz do repositório:

```powershell
docker compose up --build --detach
docker compose ps
```

O build usa `https://registry.npmjs.org/` por padrão. Se esse domínio estiver
indisponível apenas dentro do Docker, escolha temporariamente outro registro:

```powershell
$env:NPM_REGISTRY="https://registry.npmmirror.com/"
docker compose up --build --detach
Remove-Item Env:NPM_REGISTRY
```

Smoke tests:

```powershell
Invoke-RestMethod http://127.0.0.1:8001/health
curl.exe -I http://127.0.0.1:3000/
```

Encerramento:

```powershell
docker compose down
```

O comando `down` preserva o volume do SQLite. Use `docker compose down --volumes`
somente quando a exclusão dos dados persistidos for intencional.

## Execução fora do Docker

Os defaults continuam sendo SQLite em `backend/circe_home.db`, MQTT em
`localhost:1883`, backend na porta `8001` e frontend na porta `3000`. As
variáveis disponíveis estão documentadas em `backend/.env.example`.

## Fluxo Git

- branches curtas: `feat/`, `fix/`, `docs/`, `chore/`;
- commits focados;
- PR com contexto, validação, riscos e documentos atualizados;
- nenhuma alteração de arquitetura sem ADR.

## Definition of Done

Código revisado, testes relevantes executados, documentação atualizada, migração/rollback descritos e ausência de segredo no diff.
