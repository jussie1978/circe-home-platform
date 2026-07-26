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

## Provedor de IA

O Core expõe o contrato `AIProvider.complete(ModelContext)`. Adaptadores recebem
somente o contexto já construído e devolvem `ProviderResponse`, com identificador
do provedor e conteúdo textual.

É proibido injetar `MemoryService`, `MemoryRepository`, sessões SQLAlchemy ou
conexões SQLite em adaptadores. Traduções para formatos de OpenAI, Gemini ou
outro fornecedor pertencem ao adaptador e não alteram o modelo neutro do Core.

O contrato v0.1 é síncrono e textual. Streaming, voz, timeout, cancelamento,
métricas e tratamento uniforme de falhas serão especificados separadamente.
