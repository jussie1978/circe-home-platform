# CIRCE Home Platform — Contrato de API

**Implementação analisada:** `backend/app/main.py`, versão declarada 0.3.0.

## Base local

- REST: `http://127.0.0.1:8001`
- WebSocket: `ws://127.0.0.1:8001/ws`
- OpenAPI interativa: `/docs`

As URLs estão fixas no frontend atual e devem virar configuração.

## REST

### `GET /health` e `GET /api/v1/status`

Retorna disponibilidade e estado agregado.

```json
{
  "status": "online",
  "project": "IRIS Hub Platform",
  "timestamp": "2026-07-22T00:00:00",
  "state": {
    "temperature": 42.0,
    "humidity": 62.5,
    "fan_speed": 60,
    "fan_mode": "auto",
    "roof_angle": 90,
    "fins_state": "open",
    "led_color": "#06B6D4",
    "led_mode": "breath",
    "iris_state": "idle",
    "face_detected": false,
    "face_x": 0.0,
    "face_y": 0.0,
    "voice_text": ""
  }
}
```

### `GET /api/v1/sensors/history?hours=24`

Retorna linhas de `SensorLog` posteriores ao corte temporal.

### `POST /api/v1/controls/fans`

```json
{"speed": 75}
```

Intervalo: 0–100. Publica `alx/case/fans/set`.

### `POST /api/v1/controls/fans/mode`

```json
{"mode": "auto"}
```

Valores: `auto`, `manual`, `silent`.

### `POST /api/v1/controls/servos`

```json
{"angle": 50}
```

Apesar do nome `angle`, o backend aceita 0–100 e trata como percentual de abertura.

### `POST /api/v1/controls/leds`

```json
{"color": "#ff00ff"}
```

O backend atual não valida o formato da cor.

### `POST /api/v1/controls/leds/mode`

```json
{"mode": "breath"}
```

Valores: `solid`, `breath`, `rainbow`.

## WebSocket `/ws`

### Estado enviado pelo servidor

```json
{
  "temperature": 42.0,
  "humidity": 62.5,
  "irisState": "idle",
  "fanSpeed": 60,
  "fanMode": "auto",
  "roofAngle": 90,
  "finsState": "open",
  "ledColor": "#06B6D4",
  "ledMode": "breath",
  "faceDetected": false,
  "faceX": 0.0,
  "faceY": 0.0,
  "voiceText": "",
  "tempHistory": [42.0]
}
```

### Comando enviado pelo cliente

```json
{"topic": "alx/case/fans/set", "value": "75"}
```

Tópicos aceitos:

- `alx/case/fans/set`
- `alx/case/fans/mode`
- `alx/case/servos/angle`
- `alx/case/leds/set`
- `alx/case/leds/mode`

## Problemas de contrato a resolver

- REST usa snake_case e WebSocket usa camelCase.
- erros de faixa retornam HTTP 200.
- não há schema versionado do WebSocket.
- o comando é identificado por tópico MQTT, acoplando frontend ao barramento interno.
- não há `commandId`, ack nem estado confirmado pelo dispositivo.
