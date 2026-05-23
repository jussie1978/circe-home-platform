# ADR-001 — Escolha de FastAPI como Framework Backend

**Data:** 2026-05-24  
**Status:** ✅ Aceito  
**Decisor:** Jussie  
**Contexto:** CIRCE Home Platform — Definição de stack backend

---

## Contexto

O backend do CIRCE Home precisa:

1. Servir API REST para frontend (`GET`/`POST` devices, sensors, controls)
2. Manter conexão WebSocket para atualização real-time do dashboard
3. Atuar como cliente MQTT (subscrever tópicos dos devices)
4. Processar múltiplas requisições concorrentes (sensores publicando a cada 2s)
5. Validar schemas de dados rigorosamente (evitar bugs silenciosos no ESP32 → API)

Frameworks Python considerados:
- **Flask** (tradicional, síncrono por padrão)
- **FastAPI** (moderno, assíncrono nativo)
- **Django** (batteries-included, ORM pesado)

---

## Decisão

**FastAPI.**

---

## Justificativa

### 1. Async nativo (crítico para WebSocket + MQTT simultâneos)

```python
# FastAPI — async natural, sem extensões
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        # Não bloqueia outros clientes
```

Flask precisaria de `gevent` ou `eventlet` (dependência externa, complexidade extra).

### 2. Validação automática via Pydantic

```python
class SensorReading(BaseModel):
    temperature: float   # Validação: precisa ser número
    humidity: float
    timestamp: datetime  # Validação: precisa ser datetime válido

@app.post("/api/v1/sensors")
async def log_sensor(reading: SensorReading):
    # Se ESP32 enviar {"temperature": "vinte"} → erro 422 automático
    # Zero código de validação manual
    pass
```

### 3. OpenAPI/Swagger automático

FastAPI gera documentação interativa em `/docs` automaticamente.
Útil para testar endpoints durante desenvolvimento sem ferramentas externas.

### 4. Performance superior

| Framework | Requisições/segundo | Fonte |
|-----------|--------------------|-|
| FastAPI (Uvicorn) | ~60.000 | Techempower Round 21 |
| Flask (Gunicorn) | ~25.000 | Techempower Round 21 |

Para dashboard com 10+ sensores atualizando a cada 2s, performance importa.

### 5. Dependency Injection embutida

```python
# Injetar cliente MQTT em qualquer endpoint sem singleton global
async def get_mqtt_client():
    return mqtt_client

@app.post("/api/v1/controls/fans")
async def set_fans(speed: int, mqtt: MQTTClient = Depends(get_mqtt_client)):
    await mqtt.publish("alx/case/fans/set", str(speed))
```

---

## Consequências

### Positivas
- ✅ Codebase tipada (IDE autocomplete, menos bugs)
- ✅ WebSocket + MQTT rodam sem bloqueio mútuo
- ✅ Documentação API gerada automaticamente
- ✅ Preparado para escalar (100+ devices futuros)

### Negativas
- ⚠️ Curva de aprendizado em `async/await` (se não familiarizado)
- ⚠️ Debugging assíncrono mais complexo que síncrono

### Mitigações
- Começar com endpoints síncronos simples, migrar para async gradualmente
- Usar `pytest-asyncio` para testes assíncronos desde o início

---

## Alternativas Rejeitadas

**Flask:**
- Prós: maduro, simples, muitos exemplos
- Contras: async não-nativo, precisa `Flask-SocketIO` + `Flask-MQTT` (complexidade extra)
- Rejeitado porque: integrar async via extensões adiciona complexidade maior que o benefício da simplicidade

**Django:**
- Prós: batteries-included, admin panel, ORM avançado
- Contras: pesado demais para escopo atual; SQLite simples não precisa Django ORM
- Rejeitado porque: overkill — não precisamos de CMS, admin automático, ou multi-DB

---

**Referências:**
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Techempower Benchmarks](https://www.techempower.com/benchmarks/)
- [fastapi-mqtt Integration](https://github.com/sabuhish/fastapi-mqtt)
