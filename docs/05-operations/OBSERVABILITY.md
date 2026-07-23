# Observabilidade

## Métricas mínimas

- conectividade MQTT e WebSocket;
- latência de comando e ack;
- comandos expirados/falhos;
- telemetria por dispositivo;
- reconexões;
- latência, erros e custo de voz;
- uso de CPU/memória do host.

## Logs

Usar logs estruturados com `timestamp`, `level`, `service`, `device_id`, `command_id` e `correlation_id`. Nunca registrar chaves, tokens ou áudio bruto por padrão.

## Health

Separar `liveness` de `readiness`. Backend vivo sem broker não significa pronto para controlar dispositivos.
