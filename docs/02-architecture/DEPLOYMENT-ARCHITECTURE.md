# Arquitetura de implantação

## Estado atual

- Mosquitto via Docker Compose;
- backend Uvicorn separado, porta observada 8001;
- frontend Vite separado, porta 3000;
- SQLite local;
- scripts auxiliares separados.

## Alvo R0.4

Um Compose de desenvolvimento deve iniciar broker, backend e frontend, com volumes, health checks e variáveis em `.env.example`.

## Alvo residencial

- host local dedicado, preferencialmente Linux;
- rede IoT segmentada;
- TLS/reverse proxy para interfaces;
- backup de configuração e banco;
- watchdog e reinício automático;
- logs com rotação.
