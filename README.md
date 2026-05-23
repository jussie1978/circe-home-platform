# CIRCE Home Platform

> **Plataforma de automação residencial local-first com IA conversacional integrada**

![Status](https://img.shields.io/badge/status-development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![ESP32](https://img.shields.io/badge/ESP32-DevKit-green)
![Sprint](https://img.shields.io/badge/sprint-000-orange)

---

## 🌟 Visão Geral

**CIRCE Home** é uma plataforma completa de automação residencial construída com foco em:

- **🔒 Privacy-First**: 100% local, zero dependência de nuvens corporativas
- **🤖 IA Nativa**: IRIS — assistente de voz integrada (Whisper + Ollama + Piper TTS)
- **⚡ Real-Time**: Dashboard com atualização via WebSocket
- **🎨 Extensível**: Arquitetura modular baseada em MQTT
- **🏠 Case Alienware ALX**: Hub físico central com controle térmico inteligente

---

## 🤖 Conhecendo IRIS

**IRIS** *(Integrated Residential Intelligence System)* é a IA de voz do CIRCE Home.

Inspirada na deusa mensageira da mitologia grega — personificação do arco-íris, ponte entre mundos — IRIS conecta o usuário ao seu ambiente de forma natural, rápida e confiável.

**Comandos exemplo:**
```
"IRIS, qual a temperatura do case?"
"IRIS, ligue os fans no máximo"
"IRIS, mude os LEDs para azul"
"IRIS, ative modo cinema"
```

Identidade completa: [docs/IRIS-IDENTITY.md](docs/IRIS-IDENTITY.md)

---

## 🎯 Releases Planejadas

| Release | Objetivo | Status | Data Alvo |
|---------|----------|--------|-----------|
| **R1.0 Foundation** | Controle térmico autônomo + Dashboard básico | 🟡 Em progresso | 22 Jun 2026 |
| **R2.0 Control** | Controle ativo (PWM fans, RGB LEDs) | ⚪ Planejado | 27 Jul 2026 |
| **R3.0 Intelligence** | Integração IRIS (comandos de voz) | ⚪ Planejado | 07 Set 2026 |
| **R4.0 Expansion** | Automação residencial completa | ⚪ Planejado | 26 Out 2026 |

Roadmap detalhado: [docs/ROADMAP.md](docs/ROADMAP.md)

---

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────────────────┐
│                     USUÁRIO                          │
│         Browser / Mobile / Voz (IRIS)                │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              CIRCE Home Platform                     │
│  ┌──────────────────┐  ┌───────────────────────────┐ │
│  │  Frontend         │  │  Backend (FastAPI)        │ │
│  │  React + Vite     │◄─┤  REST API + WebSocket     │ │
│  │  TailwindCSS      │  │  MQTT Client              │ │
│  └──────────────────┘  │  SQLite (logs/config)     │ │
│                        └──────────────┬────────────┘ │
│                                       │              │
│  ┌────────────────────────────────────▼────────────┐ │
│  │         MQTT Broker (Mosquitto)                 │ │
│  │  alx/case/temperature | alx/case/fans/speed     │ │
│  │  alx/case/leds/color  | alx/status              │ │
│  └──────────────────┬──────────────────────────────┘ │
└─────────────────────┼────────────────────────────────┘
                      │
       ┌──────────────┼──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  ESP32  │  │ IRIS AI  │  │  RPi 5   │  │ Devices  │
  │  (Case) │  │  (Voz)   │  │  (Host)  │  │ Futuros  │
  └─────────┘  └──────────┘  └──────────┘  └──────────┘
```

Detalhes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Hardware** | ESP32 DevKit V1, Raspberry Pi 5, DHT22, WS2812B, Relés |
| **Firmware** | Arduino / PlatformIO (C++) |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy, asyncio |
| **Messaging** | MQTT (Mosquitto) |
| **Database** | SQLite → PostgreSQL (futuro) |
| **Frontend** | React 18, Vite, TailwindCSS, Recharts |
| **Real-time** | WebSocket (FastAPI native) |
| **IA** | Ollama, Whisper, Piper TTS |
| **Deploy** | Docker Compose |

---

## 🚀 Quick Start (Desenvolvimento)

```bash
# 1. Clonar repositório
git clone https://github.com/jussie1978/circe-home-platform.git
cd circe-home-platform

# 2. Setup ambiente
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh

# 3. Iniciar serviços
docker-compose up -d

# 4. Acessar dashboard
open http://localhost:3000
```

Guia completo: [docs/sprints/SPRINT-000-setup.md](docs/sprints/SPRINT-000-setup.md)

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [SPEC-001-PLATFORM.md](docs/SPEC-001-PLATFORM.md) | Especificação master (SDD) |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura detalhada |
| [ROADMAP.md](docs/ROADMAP.md) | Releases e cronograma |
| [IRIS-IDENTITY.md](docs/IRIS-IDENTITY.md) | Identidade e personalidade da IA |
| [ADR-001](docs/adrs/ADR-001-fastapi-choice.md) | Por que FastAPI |
| [ADR-002](docs/adrs/ADR-002-mqtt-architecture.md) | Por que MQTT |
| [ADR-003](docs/adrs/ADR-003-sqlite-initial-db.md) | Por que SQLite |
| [SPRINT-000](docs/sprints/SPRINT-000-setup.md) | Sprint atual |
| [COMPONENTS-LIST](hardware/docs/COMPONENTS-LIST.md) | Hardware e orçamento |

---

## 📈 Status Atual

**Sprint:** 000 — Setup & Especificação  
**Progresso geral:** 10%

- [x] Estrutura de diretórios
- [x] Documentação inicial (SPEC, ADRs, IRIS)
- [ ] Lista de compras finalizada
- [ ] Ambiente dev configurado
- [ ] Hello World ESP32 + MQTT

Acompanhe: [docs/sprints/SPRINT-000-setup.md](docs/sprints/SPRINT-000-setup.md)

---

## 🔗 Ecossistema CIRCE

| Projeto | Repositório | Descrição |
|---------|-------------|-----------|
| **CIRCE Intel Desk** | `circe-intel-desk` | Plataforma de inteligência policial |
| **CIRCE Home Platform** | `circe-home-platform` | Automação residencial + IRIS (este repo) |
| **LexisPro** | `lexis_pro` | Secretária digital jurídica |

---

## 👤 Autor

**Jussie** — Analista de Inteligência | Desenvolvedor  
GitHub: [@jussie1978](https://github.com/jussie1978)

---

> 🌈 *"IRIS: Sua ponte para o lar inteligente"*
