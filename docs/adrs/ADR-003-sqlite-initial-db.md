# ADR-003 — SQLite como Database Inicial (Migração PostgreSQL Opcional)

**Data:** 2026-05-24  
**Status:** ✅ Aceito  
**Decisor:** Jussie  
**Contexto:** CIRCE Home Platform — Escolha de banco de dados

---

## Contexto

O backend precisa persistir:
1. Logs de sensores (temperatura, umidade, timestamp) — alta frequência (1 registro/2s)
2. Configurações do sistema (thresholds, preferências)
3. Histórico de comandos (auditoria)
4. Devices registrados

Escala esperada:
- **Release 1.0:** 1 device → ~43.200 leituras/dia
- **Release 4.0:** ~10 devices → ~432.000 leituras/dia

Opções avaliadas:
- **SQLite** (arquivo único, zero configuração)
- **PostgreSQL** (servidor dedicado, features avançadas)
- **MongoDB** (NoSQL, schema flexível)

---

## Decisão

**SQLite para Releases 1.0–3.0. Reavaliação baseada em métricas reais em Release 4.0.**

---

## Justificativa

### 1. SQLite é suficiente para a escala atual

| Métrica | Capacidade SQLite | Necessidade R1.0 | Margem |
|---------|-------------------|------------------|--------|
| Writes/segundo | ~50.000 | 0.5 (43k/dia ÷ 86.4k s) | 100.000x |
| Tamanho máximo DB | 281 TB | ~500 MB/ano | Ilimitado |
| Reads concorrentes | Ilimitado | 1 dashboard | — |

### 2. Zero configuração — foco em features

```python
# SQLite: engine criado em 1 linha, arquivo criado automaticamente
engine = create_engine('sqlite:///./circe_home.db')

# PostgreSQL: servidor instalado, config pg_hba.conf,
# usuário criado, database criado, Docker service configurado...
```

### 3. Portabilidade trivial

```bash
# Backup completo
cp circe_home.db circe_home_backup_$(date +%Y%m%d).db

# Migrar entre máquinas
scp circe_home.db rpi5:/home/circe/circe_home.db

# Restaurar
cp circe_home_backup.db circe_home.db
```

### 4. SQLAlchemy abstrai o banco — migração futura é 1 linha

```python
# Toda a codebase usa SQLAlchemy ORM — independente do banco

# Trocar de SQLite para PostgreSQL = mudar APENAS esta linha em config.py:
# DATABASE_URL = "sqlite:///./circe_home.db"
DATABASE_URL = "postgresql://user:pass@localhost/circe_home"

# Zero mudança em models, repositories, ou endpoints
```

### 5. Schema rígido previne dados corrompidos de firmware

```python
# Pydantic + SQLAlchemy = validação em dupla camada
class SensorReading(BaseModel):
    temperature: float   # ESP32 enviando "vinte" → erro 422 imediato
    timestamp: datetime  # ESP32 enviando timestamp malformado → rejeitado

# MongoDB aceitaria silenciosamente:
# db.logs.insert_one({"temperature": "vinte"})  ← bug descoberto 3 meses depois
```

---

## Schema Inicial (Release 1.0)

```sql
CREATE TABLE devices (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    type        TEXT    NOT NULL,   -- 'esp32', 'sensor', 'actuator'
    mqtt_topic  TEXT,
    active      INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sensor_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id   INTEGER NOT NULL,
    temperature REAL,
    humidity    REAL,
    timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Índices essenciais para queries de histórico
CREATE INDEX idx_sensor_logs_timestamp
    ON sensor_logs(timestamp);
CREATE INDEX idx_sensor_logs_device_timestamp
    ON sensor_logs(device_id, timestamp);

CREATE TABLE config (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Valores padrão
INSERT INTO config VALUES ('temp_threshold_high', '65.0', CURRENT_TIMESTAMP);
INSERT INTO config VALUES ('temp_threshold_low',  '55.0', CURRENT_TIMESTAMP);
INSERT INTO config VALUES ('fan_speed_max',        '100',  CURRENT_TIMESTAMP);
INSERT INTO config VALUES ('fan_speed_min',         '20',  CURRENT_TIMESTAMP);
INSERT INTO config VALUES ('fan_mode',          'auto',  CURRENT_TIMESTAMP);
```

---

## Estratégia de Migração para PostgreSQL (Quando Necessário)

### Quando considerar migrar

Qualquer um dos seguintes triggers:
- Queries de histórico demoran > 1s (mesmo com índices)
- Tabela `sensor_logs` ultrapassar 5 milhões de registros
- Necessidade de TimescaleDB (compressão/queries time-series avançadas)
- Writes concorrentes de mais de 5 devices simultâneos

### Como migrar (estimativa: 2–4 horas)

```bash
# 1. Instalar pgloader (automatiza migração SQLite → Postgres)
sudo apt install pgloader

# 2. Criar database no Postgres
createdb circe_home

# 3. Migrar schema e dados
pgloader sqlite:///circe_home.db postgresql://user:pass@localhost/circe_home

# 4. Atualizar .env
DATABASE_URL=postgresql://user:pass@localhost/circe_home

# 5. Rodar Alembic para validar
alembic upgrade head

# 6. Smoke test
pytest tests/test_api.py
```

---

## Consequências

### Positivas
- ✅ Zero overhead de configuração (foco em features, não DevOps)
- ✅ Backup/restore em segundos (arquivo único)
- ✅ Desenvolvimento offline sem dependência de servidor
- ✅ Migração garantida via SQLAlchemy + Alembic

### Negativas
- ⚠️ Write lock em escritas concorrentes (não relevante para R1.0–R3.0)
- ⚠️ Sem replicação nativa

### Mitigações
- **Write lock:** Monitorar com métricas reais; migrar se necessário
- **Sem replicação:** Cron de backup diário automatizado para pasta dedicada

---

## Alternativas Rejeitadas

**PostgreSQL imediato:**
- Prós: pronto para escala, features avançadas, replicação
- Contras: zero benefício adicional para 1 usuário + 1 device; overhead de configuração sem retorno
- Rejeitado porque: YAGNI (You Aren't Gonna Need It) para Release 1.0–3.0

**MongoDB:**
- Prós: schema flexível, fácil de começar
- Contras: schema flexível é desvantagem para IoT (firmware com bug salva dados inválidos silenciosamente); queries analíticas mais complexas que SQL
- Rejeitado porque: schema rígido via Pydantic é uma feature, não uma limitação

---

**Referências:**
- [SQLite When To Use](https://www.sqlite.org/whentouse.html)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [Alembic Migration Tool](https://alembic.sqlalchemy.org/)
- [pgloader SQLite → PostgreSQL](https://pgloader.io/)
