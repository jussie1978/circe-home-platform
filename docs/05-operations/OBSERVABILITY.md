# Observabilidade

## Métricas mínimas

- conectividade MQTT e WebSocket;
- latência de comando e ack;
- comandos expirados/falhos;
- telemetria por dispositivo;
- reconexões;
- latência, erros e custo de voz;
- uso de CPU/memória do host.
- tarefas criadas, concluídas, falhas, canceladas e bloqueadas por política;
- duração de `TaskRun` e `ToolRun`;
- aprovações solicitadas, aprovadas, rejeitadas e expiradas;
- chamadas por provedor/modelo, tokens e custo estimado por tarefa;
- retries e duplicidades evitadas por idempotência;
- resultados reais, indisponíveis e simulados usados em briefings.

## Logs

Usar logs estruturados com `timestamp`, `level`, `service`, `device_id`, `command_id` e `correlation_id`. Nunca registrar chaves, tokens ou áudio bruto por padrão.

Runs de orquestração também registram `task_run_id`, `tool_run_id`,
`capability`, `capability_version`, `actor`, `risk_level` e `approval_id` quando
aplicável. Conteúdo integral de memória, prompts e resultados sensíveis não deve
ser incluído por padrão.

## Health

Separar `liveness` de `readiness`. Backend vivo sem broker não significa pronto para controlar dispositivos.
