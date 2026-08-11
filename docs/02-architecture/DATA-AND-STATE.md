# Dados e estado

## Modelo atual

SQLite armazena dispositivos, logs de sensores e configurações. O estado operacional principal permanece em memória no backend.

## Modelo recomendado

- `Device`: identidade, tipo, capacidades e versão;
- `Command`: solicitação, ator, parâmetros, timestamp e status;
- `DesiredState`: último estado solicitado;
- `ReportedState`: último estado confirmado pelo dispositivo;
- `Telemetry`: amostras de sensores;
- `AuditEvent`: mudança relevante e resultado.
- `TaskRun`: intenção, plano, ator, origem, estado e resultado da tarefa;
- `ToolRun`: capacidade versionada, entrada, idempotência, duração e resultado;
- `ApprovalRequest`: ação exata, risco, decisão, aprovador e expiração;
- `ArtifactRef`: referência a briefing, relatório ou outro resultado durável.

## Regra de consistência

O frontend nunca deve considerar uma publicação MQTT como prova de execução. O estado só muda para **confirmed** após ack/report do dispositivo ou para **failed/timeout** quando não houver confirmação.

## Evolução do banco

SQLite continua adequado ao MVP de instância única. PostgreSQL só deve ser introduzido quando concorrência, retenção ou consultas justificarem a migração.

O runtime de orquestração deve persistir cada transição antes de produzir o
efeito seguinte. Reiniciar o backend não pode transformar uma tarefa
`awaiting_approval` em autorizada nem repetir uma execução já concluída.
