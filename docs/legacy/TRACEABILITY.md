# CIRCE Home Platform — Matriz de Rastreabilidade

| Capacidade | Documento | Código atual | Situação |
|---|---|---|---|
| telemetria térmica | SPEC-001 | MQTT + FastAPI + SQLite | parcial; firmware sensor ausente |
| controle de fans | SPEC-001 | API/MQTT | backend pronto; firmware ausente |
| controle de aletas | SPEC-001 | API + firmware servo | protótipo presente |
| iluminação RGB | SPEC-001/DESIGN | API/MQTT | backend/UI; firmware ausente |
| interface IRIS | DESIGN-SYSTEM | App/OrbCanvas/store | protótipo avançado |
| voz conversacional | brainstorming/IRIS | voiceService | experimental |
| fallback GPT Realtime | brainstorming | gptRealtimeService | adaptador isolado |
| visão de presença | SPEC-003 | face_tracker + MQTT | protótipo isolado |
| banco local | ADR-003 | SQLAlchemy/SQLite | implementado básico |
| mensageria local | ADR-002 | Mosquitto/Paho | implementado básico |
| implantação completa | SPEC/README | Compose | não implementada; só broker |
| privacidade local-first | SPEC/AGENTS | arquitetura híbrida | parcial; voz usa nuvem |

## Documentos referenciados, porém ausentes no ZIP original

- `docs/ROADMAP.md` — criado nesta entrega.
- `docs/ARCHITECTURE.md` — criado nesta entrega.
- `docs/SPEC-002-UI-UX.md` — permanece ausente.
- `docs/ADR-006-interface-viva.md` — permanece ausente.
- `docs/ADR-008...` — permanece ausente.
- `docs/design/iris-interface-viva-v7.html` — permanece ausente.

Antes de declarar uma spec ou ADR como aprovado, o arquivo correspondente deve existir no repositório.
