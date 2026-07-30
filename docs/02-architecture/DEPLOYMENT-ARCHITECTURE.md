# Arquitetura de implantação

## Estado atual

- Compose de desenvolvimento validado para Mosquitto, backend e frontend;
- Mosquitto na porta `1883`;
- backend Uvicorn na porta `8001`;
- frontend Vite na porta `3000`;
- SQLite em volume nomeado no Compose e em arquivo local fora do Docker;
- health checks configurados para os três serviços;
- scripts auxiliares separados.

A execução do Compose completo foi validada em host Windows com Docker Desktop
e WSL 2 em 29/07/2026.

## Alvo R0.4

O Compose de desenvolvimento inicia broker, backend e frontend, com volumes,
health checks e variáveis em `.env.example`. Smoke tests e persistência do
SQLite foram validados localmente.

## Alvo residencial

- host local dedicado, preferencialmente Linux;
- rede IoT segmentada;
- TLS/reverse proxy para interfaces;
- backup de configuração e banco;
- watchdog e reinício automático;
- logs com rotação.
