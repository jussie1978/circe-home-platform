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

## Regra de consistência

O frontend nunca deve considerar uma publicação MQTT como prova de execução. O estado só muda para **confirmed** após ack/report do dispositivo ou para **failed/timeout** quando não houver confirmação.

## Evolução do banco

SQLite continua adequado ao MVP de instância única. PostgreSQL só deve ser introduzido quando concorrência, retenção ou consultas justificarem a migração.
