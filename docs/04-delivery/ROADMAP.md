# Roadmap

## R0.4 — Baseline reproduzível

- corrigir codificação de dependências;
- Compose para broker/backend/frontend;
- `.env.example` e setup validado;
- health checks e logs coerentes;
- CI básica para backend e frontend.

## R0.5 — Controle confiável

- command IDs;
- desired/reported state;
- ack e timeout;
- auditoria;
- catálogo de dispositivos.

## R0.6 — Hardware completo

- sensores e atuadores reais;
- fail-safe;
- testes de bancada;
- documentação elétrica atualizada.

## R0.7 — Voz plugável

- OpenAI Realtime via WebRTC;
- provedor abstrato;
- ferramenta de leitura;
- comandos controlados e métricas de custo/latência.

## R0.7.1 — Memória portátil do Core

- contrato `MemoryProvider`;
- contrato `ContextBuilder`;
- persistência de preferências explícitas;
- recuperação entre sessões;
- exclusão e auditoria de memória;
- teste de troca entre dois provedores sem perda de continuidade.

Não inclui inferência automática de hábitos, memória emocional, RAG amplo ou agentes autônomos.

## R0.8 — Segurança e operação

- autenticação;
- MQTT protegido;
- segredos;
- backup e observabilidade.

## R1.0 — MVP residencial

Release candidata somente após execução contínua, recuperação de falhas e validação ponta a ponta.
