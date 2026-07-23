# ADR-002 — MQTT como Barramento de Comunicação IoT

**Data:** 2026-05-24  
**Status:** ✅ Aceito  
**Decisor:** Jussie  
**Contexto:** CIRCE Home Platform — Arquitetura de comunicação entre devices e backend

---

## Contexto

Devices (ESP32, futuros sensores Zigbee/WiFi) precisam comunicar com o backend de forma confiável.

Requisitos:
- Suportar 10+ devices simultâneos no futuro
- Tolerar desconexões WiFi temporárias sem perda de comandos críticos
- Garantia de entrega (QoS) para comandos de controle
- Desacoplamento (adicionar novo device sem modificar código do backend)

Opções avaliadas:
1. **HTTP REST direto** (devices fazem POST para backend)
2. **MQTT pub/sub** (broker intermediário Mosquitto)
3. **WebSocket direto** (conexão persistente device ↔ backend)

---

## Decisão

**MQTT com broker Mosquitto.**

---

## Justificativa

### 1. Pub/Sub desacopla devices do backend

```
❌ HTTP direto:
ESP32 → POST /api/temperature → Backend
(ESP32 precisa conhecer IP/endpoint do backend)
(Backend precisa estar online ou ESP32 perde leitura)

✅ MQTT:
ESP32 → publish("alx/case/temperature", "28.5") → Broker
Backend ← subscribe("alx/case/#") ← Broker
(ESP32 não conhece o backend)
(Broker faz buffer se backend reiniciar)
```

### 2. QoS garante entrega de comandos críticos

```cpp
// Telemetria de temperatura — QoS 0 (ok perder leitura ocasional)
client.publish("alx/case/temperature", "28.5", false, 0);

// Comando de controle — QoS 1 (ACK obrigatório, garantir entrega)
client.publish("alx/case/fans/set", "100", false, 1);
```

### 3. Retained messages para estado persistente

```cpp
// ESP32 publica status com flag retained
client.publish("alx/status", "online", true, 1);
// Qualquer novo subscriber recebe o último valor imediatamente
// (Dashboard sabe estado sem esperar próxima publicação)
```

### 4. Wildcards simplificam subscrições

```python
# Backend recebe todos os sensores do case com 1 linha
client.subscribe("alx/case/#")
# Recebe: alx/case/temperature, alx/case/humidity, alx/case/fans/speed...

# Vs HTTP: precisaria criar 1 endpoint por sensor
@app.post("/api/temperature")
@app.post("/api/humidity")
# ...
```

### 5. Padrão IoT consolidado

ESP32 tem bibliotecas maduras e bem documentadas:
- `PubSubClient` (Arduino) — simples, estável
- `AsyncMqttClient` (ESP-IDF) — assíncrono, para cenários avançados

---

## Arquitetura de Tópicos

### Convenção de Nomenclatura

```
{plataforma}/{dispositivo}/{métrica_ou_comando}[/ação]

Exemplos:
alx/case/temperature      → ESP32 publica leitura (QoS 0)
alx/case/humidity         → ESP32 publica leitura (QoS 0)
alx/case/fans/speed       → ESP32 publica velocidade atual (QoS 0)
alx/case/fans/set         → Backend publica comando (QoS 1)
alx/case/leds/color       → ESP32 publica cor atual (QoS 0)
alx/case/leds/set         → Backend publica comando (QoS 1)
alx/status                → ESP32 heartbeat (retained, QoS 1)
```

### Fluxo Típico de Controle

```
1. ESP32 boot:
   publish("alx/status", "online", retained=true, qos=1)
   subscribe("alx/case/fans/set", qos=1)
   subscribe("alx/case/leds/set", qos=1)

2. Loop 2s — ESP32 lê sensor:
   publish("alx/case/temperature", "28.5", qos=0)

3. Backend detecta temp > 65°C:
   publish("alx/case/fans/set", "100", qos=1)

4. ESP32 recebe comando, executa PWM:
   publish("alx/case/fans/speed", "100", qos=0)  ← confirma execução

5. Backend recebe confirmação, atualiza dashboard via WebSocket
```

---

## Configuração Mosquitto (Mínimo Viável)

```conf
# mosquitto.conf — Release 1.0

# Bind apenas na rede local (segurança básica)
listener 1883 0.0.0.0

# Log para debug no desenvolvimento
log_dest stdout
log_type all

# Sem autenticação (adicionar em R2.0)
allow_anonymous true

# Persistência de retained messages
persistence true
persistence_location /mosquitto/data/
```

### Segurança (Release 2.0+)
- [ ] Autenticação username/password (`password_file`)
- [ ] TLS/SSL (certificado auto-assinado para rede local)
- [ ] ACL por tópico (ESP32 só publica `alx/case/*`)

---

## Consequências

### Positivas
- ✅ Adicionar device novo = configurar tópicos (zero mudança no backend)
- ✅ Tolerância a falhas (broker faz buffer em reconexões)
- ✅ Monitoramento fácil com MQTT Explorer (GUI) ou `mosquitto_sub` (CLI)
- ✅ Escalável (Mosquitto suporta milhares de clients)

### Negativas
- ⚠️ Componente adicional (broker precisa rodar)
- ⚠️ Debugging inicial requer ferramenta MQTT client

### Mitigações
- **Broker adicional:** 1 serviço no `docker-compose.yml` (zero overhead operacional)
- **Debugging:** MQTT Explorer (GUI gratuita) para inspecionar tópicos visualmente

---

## Alternativas Rejeitadas

**HTTP REST direto:**
- Prós: simples, sem broker
- Contras: ESP32 acoplado ao backend; sem QoS; sem tolerância a desconexão
- Rejeitado porque: não escala, ESP32 precisa de retry lógica complexa

**WebSocket direto:**
- Prós: full-duplex, real-time
- Contras: gerenciar reconexões; sem padrão IoT; bibliotecas ESP32 menos maduras que MQTT
- Rejeitado porque: MQTT já é WebSocket otimizado para IoT com QoS nativo

---

**Referências:**
- [MQTT Specification v5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
- [Eclipse Mosquitto](https://mosquitto.org/)
- [PubSubClient ESP32](https://github.com/knolleary/pubsubclient)
- [MQTT Explorer (GUI)](https://mqtt-explorer.com/)
