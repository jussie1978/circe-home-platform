# SPEC-001-PLATFORM — Especificação Técnica CIRCE Home Platform
**Revisão:** 1.0  
**Data:** 24 de maio de 2026  
**Autor:** Jussie  
**Metodologia:** Spec-Driven Development (SDD)  
**Status:** 🟢 Aprovado para execução

---

## 1. CONTEXTO E MOTIVAÇÃO

### 1.1 Visão do Produto

**CIRCE Home Platform** é uma plataforma de automação residencial integrada com IA conversacional (IRIS), concebida para operar 100% localmente, sem dependência de serviços de nuvem corporativos. O hub físico central é o case Alienware Area-51 ALX, equipado com firmware embarcado (ESP32) e controlado por um backend Python hospedado em Raspberry Pi 5.

### 1.2 Por que este projeto existe

1. **Privacidade absoluta** — eliminar dependência de Google Home, Alexa e Apple HomeKit
2. **Débito emocional zerado** — concluir projeto iniciado e não finalizado (Alienware v1)
3. **Infraestrutura IA** — criar base física para IRIS (assistente de voz local)
4. **Aprendizado aplicado** — IoT, sistemas distribuídos, IA embarcada e eletrônica

### 1.3 Lições do Projeto Anterior (Alienware v1 — Post-Mortem)

| Problema | Causa Raiz | Solução Aplicada |
|----------|------------|------------------|
| Nunca foi concluído | Tratado como hobby sem metodologia | SDD rigoroso (igual LexisPro/CIRCE Intel) |
| Escopo elástico | Features adicionadas sem reavaliação | Releases com escopo congelado |
| Nenhum milestone validado | Abordagem "big bang" | Milestones incrementais por sprint |
| Sem Definition of Done | Ausência de critérios formais | Critérios de aceitação por sprint |

### 1.4 Premissas Não-Negociáveis

- **Local-First:** Zero dados em nuvens externas
- **Incremental:** Cada release é completa e funcional por si mesma
- **SDD:** Nenhum código escrito sem spec aprovada
- **Swim Lanes:** Não compete diretamente com LexisPro/CIRCE Intel (gestão de portfólio)

---

## 2. OBJETIVOS E ESCOPO

### 2.1 Objetivos por Release

| Release | Objetivo Principal | Prazo |
|---------|--------------------|-------|
| **R1.0 Foundation** | Controle térmico autônomo + Dashboard básico | 22 Jun 2026 |
| **R2.0 Control** | Controle ativo (PWM fans + RGB LEDs) | 27 Jul 2026 |
| **R3.0 Intelligence** | Integração IRIS (voz) | 07 Set 2026 |
| **R4.0 Expansion** | Automação residencial completa | 26 Out 2026 |

### 2.2 Não-Objetivos (Explicitamente Fora do Escopo)

- ❌ App mobile nativo (web responsivo é suficiente)
- ❌ Controle via internet pública (apenas rede local)
- ❌ Marketplace de plugins
- ❌ Integração com Google Home / Alexa
- ❌ Multi-usuário com perfis distintos (Release 1.0-3.0)

---

## 3. ARQUITETURA TÉCNICA

### 3.1 Visão de Componentes

```
USUÁRIO (voz / browser / mobile)
         │
         ▼
┌─────────────────────────────────────────┐
│         CIRCE Home Platform             │
│                                         │
│  Frontend (React + WebSocket)           │
│         │                               │
│  Backend FastAPI                        │
│  ├─ REST API (/devices, /sensors, ...)  │
│  ├─ WebSocket Server (real-time)        │
│  ├─ MQTT Client (pub/sub)               │
│  └─ SQLite (logs + config)              │
│         │                               │
│  MQTT Broker (Mosquitto)                │
│  └─ tópicos: alx/case/*, alx/status    │
└──────────────────┬──────────────────────┘
                   │
       ┌───────────┼────────────┐
       ▼           ▼            ▼
   ESP32         IRIS AI     Devices
   (Case)        (RPi5)      Futuros
```

### 3.2 Tópicos MQTT (Contratos de Interface)

| Tópico | Direção | QoS | Payload | Descrição |
|--------|---------|-----|---------|-----------|
| `alx/case/temperature` | ESP32 → Broker | 0 | `"28.5"` | Leitura sensor (2s) |
| `alx/case/humidity` | ESP32 → Broker | 0 | `"62.3"` | Leitura umidade |
| `alx/case/fans/speed` | ESP32 → Broker | 0 | `"80"` | Velocidade atual (%) |
| `alx/case/fans/set` | Broker → ESP32 | 1 | `"100"` | Comando velocidade |
| `alx/case/leds/color` | ESP32 → Broker | 0 | `"#FF0000"` | Cor atual |
| `alx/case/leds/set` | Broker → ESP32 | 1 | `"#0000FF"` | Comando cor |
| `alx/status` | ESP32 → Broker | 1 | `"online"` | Heartbeat (retained) |

### 3.3 Endpoints REST (Contratos de API)

```
GET  /api/v1/status              → Status geral do sistema
GET  /api/v1/sensors/temperature → Leitura atual + histórico
GET  /api/v1/sensors/history     → Histórico (query: ?hours=24)
POST /api/v1/controls/fans       → { "speed": 80 }
POST /api/v1/controls/leds       → { "color": "#FF0000" }
GET  /api/v1/config              → Configurações atuais
PUT  /api/v1/config              → Atualizar thresholds
WebSocket /ws                    → Stream de eventos em tempo real
```

### 3.4 Schema de Banco de Dados (SQLite — R1.0)

```sql
-- Devices registrados
CREATE TABLE devices (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL,        -- 'esp32', 'sensor', 'actuator'
    mqtt_topic  TEXT,
    active      INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Log de leituras dos sensores
CREATE TABLE sensor_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id   INTEGER NOT NULL,
    temperature REAL,
    humidity    REAL,
    timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Índices de performance
CREATE INDEX idx_sensor_logs_timestamp
    ON sensor_logs(timestamp);
CREATE INDEX idx_sensor_logs_device_timestamp
    ON sensor_logs(device_id, timestamp);

-- Configurações do sistema
CREATE TABLE config (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Valores padrão
INSERT INTO config VALUES ('temp_threshold_high', '65.0', CURRENT_TIMESTAMP);
INSERT INTO config VALUES ('temp_threshold_low',  '55.0', CURRENT_TIMESTAMP);
INSERT INTO config VALUES ('fan_speed_max',       '100',  CURRENT_TIMESTAMP);
INSERT INTO config VALUES ('fan_speed_min',       '20',   CURRENT_TIMESTAMP);
```

---

## 4. DETALHAMENTO DAS RELEASES

### Release 1.0 — "Foundation"
**Prazo:** 22 junho 2026 | **Esforço:** ~35h

#### Hardware Entregue
- ESP32 instalado no case Alienware ALX
- Sensor DHT22 monitorando temperatura e umidade
- Relé controlando ON/OFF de 2 fans (12V)
- LED de status (verde = ok / vermelho = alerta)

#### Software Entregue
- Firmware ESP32: leitura DHT22 + publicação MQTT + subscribe comandos
- Lógica térmica: liga fans se temp > 65°C, desliga se < 55°C (hysteresis 10°C)
- Broker Mosquitto rodando no RPi5
- Backend FastAPI: `/api/v1/status`, `/api/v1/sensors/temperature`, `/api/v1/config`
- Frontend HTML+JS (1 página): temperatura atual, status fans, últimas 24h
- SQLite com tabelas `devices`, `sensor_logs`, `config`

#### Critérios de Aceitação
- [ ] Sistema funciona standalone 48h sem intervenção
- [ ] Dashboard atualiza temperatura a cada 2s via WebSocket
- [ ] Usuário consegue ler histórico de temperatura das últimas 24h
- [ ] Logs persistem após reboot do RPi5
- [ ] Sensor lê temp com precisão ±1°C vs termômetro externo

---

### Release 2.0 — "Control"
**Prazo:** 27 julho 2026 | **Esforço:** ~45h

#### Hardware Adicional
- PWM para fans (velocidade variável 0–100%, não só ON/OFF)
- Fita LED WS2812B 5m (addressable RGB)

#### Software Adicional
- `POST /api/v1/controls/fans` com velocidade (0–100%)
- `POST /api/v1/controls/leds` com cor hexadecimal
- Dashboard com sliders de velocidade e color picker
- Sistema de regras: JSON config para automações (ex: "temp > 60 → fans 80%")
- Persistência de configurações após reboot

#### Critérios de Aceitação
- [ ] Slider de fan no dashboard → resposta física < 1s
- [ ] Color picker → LED muda instantaneamente
- [ ] Regras executam corretamente após reboot
- [ ] LEDs mudam gradiente azul → vermelho conforme temperatura

---

### Release 3.0 — "Intelligence"
**Prazo:** 07 setembro 2026 | **Esforço:** ~60h

#### Hardware Adicional
- Microfone USB condensador (RPi5)
- Alto-falante USB ou saída 3.5mm

#### Software Adicional
- IRIS Sprint 0: Whisper (STT) + Ollama Llama 3.1 8B + Piper TTS
- Silero VAD (interrupção ativa)
- Parser de intenções: mapear transcrição → ação MQTT
- Feedback vocal confirmando ações

#### Critérios de Aceitação
- [ ] Latência comando de voz → execução < 2.5s
- [ ] Taxa de acerto de intenção > 90% em 20 testes
- [ ] Sistema funciona se voz falhar (fallback dashboard)
- [ ] Interrupção ativa (falar enquanto IRIS responde funciona)

---

### Release 4.0 — "Expansion"
**Prazo:** 26 outubro 2026 | **Esforço:** ~70h

#### Hardware Adicional
- Tomadas inteligentes WiFi (Tasmota/Shelly)
- Sensores de porta/janela
- Lâmpadas RGB WiFi (Tuya)

#### Software Adicional
- Dashboard multi-sala (Case, Sala, Quarto, etc)
- Cenas/cenários: "Modo Cinema", "Modo Ausente"
- Agendamentos (cron interno)
- IRIS controla todos os devices (não só o case)

#### Critérios de Aceitação
- [ ] Mínimo 5 devices integrados
- [ ] Cenas executam corretamente via voz e dashboard
- [ ] Agendamentos persistem após reboot

---

## 5. GESTÃO DE TEMPO (Swim Lanes)

O projeto é desenvolvido em paralelo com **LexisPro** e **CIRCE Intel Desk**, usando alternância de foco (nunca dois projetos em sprint simultâneo).

```
MAI S4 ─ JUN S1  │ LexisPro Sprint     │ Alienware Sprint 0 (setup)
JUN S2 ─ JUN S3  │ Alienware R1.0 HW   │ CIRCE Intel (manutenção)
JUN S4 ─ JUL S1  │ Alienware R1.0 SW   │ LexisPro (manutenção)
JUL S2 ─ JUL S3  │ LexisPro Sprint     │ Alienware R2.0 hardware
JUL S4 ─ AGO S1  │ CIRCE Intel Sprint  │ Alienware R2.0 software
AGO S2 ─ SET S1  │ Alienware R3.0      │ LexisPro (manutenção)
SET S2 ─ OUT S4  │ Alienware R4.0      │ CIRCE Intel Sprint
```

**Regras invioláveis:**
1. Apenas 1 projeto em foco total por semana
2. Projeto em manutenção: máximo 5h/semana (apenas bugs críticos)
3. Nenhuma feature adicionada fora da release corrente

---

## 6. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Escopo creep | 🔴 Alta | 🔴 Alto | SDD formal, congelamento de escopo por release |
| Hardware incompatível | 🟡 Média | 🟡 Médio | Validar datasheets antes de comprar |
| Tempo insuficiente | 🟡 Média | 🔴 Alto | Swim lanes, releases priorizadas |
| Burnout | 🟡 Média | 🔴 Alto | Máximo 15h/semana em projetos pessoais |
| Latência IRIS insatisfatória | 🟡 Média | 🟡 Médio | Testar com modelos menores (Llama 3.2 3B) |
| Fans originais incompatíveis | 🟢 Baixa | 🟡 Médio | Substituir por fans 120mm padrão |

---

## 7. ANTI-PATTERNS (O QUE NÃO FAZER)

Baseado no post-mortem do Alienware v1:

- ❌ **Nunca** adicionar feature fora da release corrente
- ❌ **Nunca** iniciar R2.0 sem critérios de R1.0 validados
- ❌ **Nunca** pular etapas de teste por "certeza que funciona"
- ❌ **Nunca** tratar este projeto como hobby sem relatório de sprint
- ❌ **Nunca** misturar sessões de desenvolvimento com LexisPro/CIRCE Intel no mesmo dia

---

## 8. HISTÓRICO DE REVISÕES

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | 24/05/2026 | Jussie | Criação inicial |

---

**Assinado:** Jussie (Product Owner / Tech Lead)  
**Data:** 24/05/2026  
**Próxima revisão:** Pós Sprint 000 — 31/05/2026
