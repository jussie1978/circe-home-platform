# Contratos de integração

## REST e WebSocket

O backend atual expõe health, status e controles. Antes da R0.5, contratos devem ganhar schemas versionados, erros padronizados e IDs de comando.

### Sessão de voz

`POST /api/v1/voice/session` recebe uma oferta WebRTC com `Content-Type: application/sdp` e devolve a resposta SDP. O backend fixa modelo e voz, lê `OPENAI_API_KEY` somente do ambiente e encaminha a negociação à OpenAI. Respostas `403` indicam cliente ou origem não local, `429` indica o limite temporário de três criações por cliente em 60 segundos, `503` indica configuração ausente e `502` indica indisponibilidade ou rejeição do provedor.

No MVP, o contrato aceita somente cliente loopback com `Origin` igual a `http://127.0.0.1:3000` ou `http://localhost:3000`. Esse controle é local e deverá ser substituído por autenticação/autorização de usuário e rate limit compartilhado antes de exposição em LAN ou Internet.

## MQTT

Padrão proposto:

```text
circe/{site}/{device}/telemetry/{metric}
circe/{site}/{device}/command/{capability}
circe/{site}/{device}/reported/{capability}
circe/{site}/{device}/ack/{command_id}
circe/{site}/{device}/status
```

Payload mínimo de comando:

```json
{
  "command_id": "uuid",
  "requested_at": "ISO-8601",
  "actor": "user|automation|voice",
  "value": {},
  "expires_at": "ISO-8601"
}
```

## Compatibilidade

Mudanças incompatíveis exigem versão de tópico ou payload e plano de migração.
