# Contratos de integração

## REST e WebSocket

O backend atual expõe health, status e controles. Antes da R0.5, contratos devem ganhar schemas versionados, erros padronizados e IDs de comando.

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
