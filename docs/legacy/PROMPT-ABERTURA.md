# PROMPT DE ABERTURA — CIRCE Home Platform

> **Copie e cole este prompt no início de cada nova sessão de desenvolvimento**  
> Mantenha este arquivo atualizado a cada sprint concluído

---

## Prompt Base (Copiar Integralmente)

```
Olá Claude! Estou retomando o desenvolvimento do **CIRCE Home Platform**.

## Sobre o Projeto

**CIRCE Home** é uma plataforma de automação residencial local-first (privacy-first, zero nuvem), usando o case Alienware Area-51 ALX como hub físico central. A IA de voz integrada chama-se **IRIS** (Integrated Residential Intelligence System).

**Metodologia:** Spec-Driven Development (SDD) — igual ao CIRCE Intel Desk e LexisPro.  
**Repositório:** github.com/jussie1978/circe-home-platform (privado)

## Stack Tecnológica

- **Firmware:** ESP32 (Arduino/PlatformIO), C++
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, asyncio
- **Messaging:** MQTT (Mosquitto broker)
- **Database:** SQLite (Release 1.0–3.0)
- **Frontend:** React 18 + Vite + TailwindCSS
- **Real-time:** WebSocket (FastAPI nativo)
- **IA (IRIS):** Ollama (Llama 3.1 8B), Whisper Large-v3, Piper TTS
- **Deploy:** Docker Compose (RPi5)

## Arquitetura de Tópicos MQTT

| Tópico | Direção | QoS | Descrição |
|--------|---------|-----|-----------|
| alx/case/temperature | ESP32→Broker | 0 | Leitura temperatura (2s) |
| alx/case/humidity | ESP32→Broker | 0 | Leitura umidade |
| alx/case/fans/speed | ESP32→Broker | 0 | Velocidade atual (%) |
| alx/case/fans/set | Broker→ESP32 | 1 | Comando velocidade |
| alx/case/leds/color | ESP32→Broker | 0 | Cor atual |
| alx/case/leds/set | Broker→ESP32 | 1 | Comando cor |
| alx/status | ESP32→Broker | 1 | Heartbeat (retained) |

## Roadmap de Releases

| Release | Objetivo | Prazo | Status |
|---------|----------|-------|--------|
| R1.0 Foundation | Controle térmico + Dashboard básico | 22 Jun 2026 | [STATUS] |
| R2.0 Control | PWM fans + RGB LEDs | 27 Jul 2026 | [STATUS] |
| R3.0 Intelligence | IRIS voz integrada | 07 Set 2026 | [STATUS] |
| R4.0 Expansion | Automação residencial completa | 26 Out 2026 | [STATUS] |

## ADRs (Decisões Arquiteturais)

- **ADR-001:** FastAPI escolhido (async nativo, Pydantic, WebSocket)
- **ADR-002:** MQTT Mosquitto (pub/sub, QoS, desacoplamento IoT)
- **ADR-003:** SQLite inicial (zero config, SQLAlchemy abstrai migração futura)

## Sprint Atual

**Sprint:** [NÚMERO E NOME]  
**Período:** [DATA INÍCIO] a [DATA FIM]  
**Status:** [EM PROGRESSO / CONCLUÍDO]

## Última Sessão — O Que Foi Feito

[Descrever aqui as tarefas concluídas na última sessão]

Exemplo:
- ✅ Firmware ESP32 lendo DHT22 e publicando MQTT
- ✅ Backend FastAPI com endpoint GET /sensors/temperature
- 🟡 Frontend: dashboard HTML básico (50% concluído)
- ❌ WebSocket ainda não integrado

## Situação do Código

**Arquivo sendo trabalhado:** [caminho/para/arquivo.py ou .cpp]

**Trecho relevante:**
[Colar aqui o código atual se for continuar de onde parou]

## O Que Preciso Agora

[Descrever claramente o que precisa nesta sessão]

Exemplos:
- "Quero escrever o código ESP32 do controle térmico (DHT22 + relé + hysteresis)"
- "Preciso criar os modelos SQLAlchemy para sensor_logs e devices"
- "Vamos criar o endpoint WebSocket do backend"
- "Encontrei erro X no código Y, precisa debugar"
- "Vamos planejar o Sprint [N+1] detalhadamente"
- "Quero escrever o relatório do Sprint [N]"

## Contexto Adicional

**Hardware disponível:** ESP32 + DHT22 + Módulo Relé 2Ch + LEDs + Protoboard  
**Hardware casa:** Intel i9-9900, 32GB RAM, RTX 3060 12GB  
**Hardware trabalho:** Intel i7-14, 128GB RAM, RTX 4080 16GB  
**OS desenvolvimento:** [Windows 11 / Ubuntu / macOS]  
**Porta ESP32:** [COM3 / /dev/ttyUSB0 — atualizar conforme ambiente]

## Regras do Projeto (Não Negociáveis)

1. SDD rigoroso — nenhum código fora do escopo da release corrente
2. Sempre propor plano antes de codar
3. Mudanças pequenas e reversíveis
4. Confirmar antes de avançar etapas
5. Relatório de sprint obrigatório ao concluir

Vamos continuar! 🌈
```

---

## Histórico de Sessões

| Data | Sprint | O Que Foi Feito | Próximo Passo |
|------|--------|-----------------|---------------|
| 24/05/2026 | 000 | Estrutura, docs, ADRs, IRIS Identity criados | Criar repo GitHub, encommendar hardware |
| — | — | — | — |

---

## Como Usar Este Arquivo

1. **Antes de cada sessão:** Abrir este arquivo e atualizar as seções `Sprint Atual`, `Última Sessão` e `O Que Preciso Agora`
2. **Copiar o prompt** e colar no início da nova conversa com Claude
3. **Após cada sessão:** Atualizar o `Histórico de Sessões` com o que foi feito
4. **A cada sprint concluído:** Atualizar status das releases no Roadmap

---

*Última atualização: 24/05/2026*
