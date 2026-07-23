# CIRCE Home Platform — Contrato MQTT

## Convenção atual

Prefixo principal: `alx/`.

## Telemetria e eventos recebidos pelo backend

| Tópico | Publisher esperado | Payload | Efeito no backend |
|---|---|---|---|
| `alx/case/temperature` | ESP32/simulador | número em texto | atualiza temperatura e grava log |
| `alx/case/humidity` | ESP32/simulador | número em texto | atualiza umidade e grava log |
| `alx/vision/face` | face tracker | JSON | atualiza presença e coordenadas |
| `alx/voice/state` | serviço de voz/simulador | JSON | atualiza estado IRIS e texto |
| `alx/status` | ESP32 | texto | atualiza estado simplificado das aletas |

Payload de visão:

```json
{"faceDetected": true, "faceX": 0.12, "faceY": -0.08}
```

Payload de voz:

```json
{"irisState": "speaking", "text": "Ajustando ventilação."}
```

## Comandos publicados pelo backend

| Tópico | Payload | Consumidor esperado |
|---|---|---|
| `alx/case/fans/set` | `0`–`100` em texto | controlador de fans |
| `alx/case/fans/mode` | `auto`, `manual`, `silent` | controlador de fans |
| `alx/case/servos/angle` | `0`–`100` em texto | ESP32/mecanismo |
| `alx/case/leds/set` | cor hexadecimal | controlador LED |
| `alx/case/leds/mode` | `solid`, `breath`, `rainbow` | controlador LED |

## Lacuna crítica

O contrato atual não separa:

- comando solicitado;
- comando aceito;
- estado físico observado;
- disponibilidade do dispositivo.

## Contrato recomendado v1

```text
circe/v1/devices/{deviceId}/command/{capability}
circe/v1/devices/{deviceId}/reported/{capability}
circe/v1/devices/{deviceId}/availability
circe/v1/events/{domain}/{event}
```

Envelope recomendado:

```json
{
  "schemaVersion": 1,
  "commandId": "uuid",
  "timestamp": "ISO-8601",
  "value": 75,
  "source": "frontend"
}
```

Ack recomendado:

```json
{
  "schemaVersion": 1,
  "commandId": "uuid",
  "status": "confirmed",
  "reportedValue": 75,
  "timestamp": "ISO-8601"
}
```

## Segurança

A configuração atual usa `allow_anonymous true` e listener em `0.0.0.0`. Isso é aceitável somente em laboratório isolado. Produção deve usar autenticação, ACL por dispositivo e, quando viável, TLS.
