# SPEC-003-VISION — Módulo de Percepção Visual (Presença)
**Revisão:** 1.0
**Data:** 18 de julho de 2026
**Autor:** Jussie
**Metodologia:** Spec-Driven Development (SDD)
**Status:** 🟢 Aprovado
**Release:** R4.0 — Expansion
**Origem:** Documento externo (`gemini-code-1784380620882.md`), reescrito para conformidade com ADR-001/ADR-002 e stack local-first do CIRCE

---

## 1. CONTEXTO E MOTIVAÇÃO

### 1.1 Objetivo

Dar à IRIS a capacidade de responder "tem alguém na sala?" com base em inferência visual, sem depender de nuvem, sem competir por VRAM com o pipeline de voz (Whisper/Ollama), e sem processar biometria facial antes de existir uma política de privacidade formal.

### 1.2 Por que existe

O documento de origem propunha reconhecimento facial contínuo via Home Assistant + Gemini API — incompatível com a Premissa Não-Negociável de local-first (SPEC-001 §1.5) e com a arquitetura de barramento já decidida (ADR-002). Esta SPEC reaproveita o pipeline técnico (YOLOv8 + zone masking) descartando o que não serve ao CIRCE.

### 1.3 Decisões de Escopo (confirmadas com o desenvolvedor em 18/07/2026)

| Decisão | Escolha | Justificativa |
|---|---|---|
| Alocação de inferência | RTX 3060 12GB (dev PC), compartilhada com Ollama+Whisper | Sem hardware adicional; evita contenção usando modelo leve + inferência sob demanda |
| Modo de operação | Sob demanda (evento) | Elimina disputa de VRAM contínua com IRIS |
| Escopo de reconhecimento | Apenas presença (contagem + zona) — sem identificação facial | Evita requisitos de biometria/privacidade antes de política formal |
| Câmera | IP RTSP a adquirir | Desacopla do firmware ESP32 S3 (pinagem já fechada — ADR-005) |
| Gatilho | Comando de voz da IRIS | Zero hardware novo, zero GPIO adicional |

### 1.4 Não-Objetivos (Explicitamente Fora do Escopo desta SPEC)

- ❌ Identificação facial / biometria (quem é a pessoa)
- ❌ Inferência contínua 24/7 em qualquer câmera
- ❌ Head pose / atenção (Eye Gaze, Pitch/Yaw/Roll) — reavaliar em release futura
- ❌ Integração com Home Assistant
- ❌ Uso de Gemini ou qualquer API de nuvem
- ❌ Gatilho por sensor PIR (sem hardware no inventário)
- ❌ Gravação/armazenamento de vídeo ou frames além do necessário para inferência do instante

---

## 2. PRÉ-REQUISITOS DE HARDWARE

| Componente | Especificação mínima | Status |
|---|---|---|
| Câmera IP | RTSP, ONVIF, resolução ≥ 1080p, iluminador IR active | 🛒 Comprar (pré-requisito de release) |
| GPU de inferência | RTX 3060 12GB (dev PC existente) | ✅ Disponível |
| Rede | Câmera na mesma LAN do dev PC e RPi5 | ✅ Disponível |

**Nota de contenção de VRAM:** Ollama (LLM) + Whisper (STT) já ocupam a RTX 3060 durante interações de voz. A inferência de visão só pode rodar **sob demanda e de forma serializada** com o pipeline de voz — nunca simultaneamente sem teste de carga prévio. Ver §5 (Riscos).

---

## 3. ARQUITETURA TÉCNICA

### 3.1 Visão de Componentes

```
USUÁRIO (comando de voz: "IRIS, tem alguém na sala?")
         │
         ▼
   IRIS (parser de intenção, R3.0)
         │  aciona sob demanda
         ▼
┌─────────────────────────────────────────┐
│    Vision Service (microserviço Python) │
│    (roda no dev PC — RTX 3060)          │
│                                         │
│  1. Conecta RTSP (OpenCV + FFmpeg)      │
│  2. Captura frame único (ou janela      │
│     curta de N frames)                  │
│  3. Zone masking (áreas irrelevantes)   │
│  4. YOLOv8n → detecção 'person'         │
│  5. Descarta frame após inferência      │
└──────────────────┬──────────────────────┘
                   │ publish (MQTT)
                   ▼
         Mosquitto Broker
                   │
                   ▼
       Backend FastAPI → injeta contexto
       na resposta da IRIS
```

### 3.2 Fluxo Sob Demanda (Contrato de Comportamento)

1. IRIS recebe comando de voz mapeado para intenção `check_presence(zona)`
2. Backend publica comando no tópico de acionamento (§3.3)
3. Vision Service conecta ao RTSP, captura frame, roda YOLOv8n, desconecta
4. Vision Service publica `Evento de Contexto` (§3.4) e encerra — **não mantém stream aberto**
5. Backend injeta o resultado no contexto de prompt da IRIS para a resposta falada
6. Timeout de 5s: se não houver resposta do Vision Service, IRIS informa indisponibilidade

Este fluxo é deliberadamente diferente do pipeline contínuo do documento de origem — não há Inference Pass 2 (MediaPipe/head pose) nesta release, e o stream RTSP não permanece aberto entre consultas.

### 3.3 Tópicos MQTT (seguindo convenção da ADR-002: `{plataforma}/{dispositivo}/{subsistema}/{métrica_ou_comando}`)

| Tópico | Direção | QoS | Payload | Descrição |
|---|---|---|---|---|
| `alx/vision/{camera_id}/check` | Backend → Vision Service | 1 | `"trigger"` | Comando: capturar e inferir agora |
| `alx/vision/{camera_id}/presence` | Vision Service → Broker | 1 | JSON (§3.4) | Evento de Contexto (resultado) |
| `alx/vision/{camera_id}/status` | Vision Service → Broker | 1 | `"online"`,`"offline"`,`"busy"` | Heartbeat / disponibilidade (retained) |

Namespace `alx/vision/*` isolado de `alx/case/*` — subsistema desacoplado do ESP32 S3, coerente com a Premissa de Desacoplamento (SPEC-001 §1.5).

### 3.4 Estrutura de Payload (Evento de Contexto — reescrito do documento de origem)

```json
{
  "camera_id": "cam_sala_01",
  "timestamp": "2026-10-20T18:45:00Z",
  "event_type": "presence_check",
  "person_count": 1,
  "zone": "sala"
}
```

Removidos do payload original: `attention_focus` e `distance_estimate_meters` (dependiam do MediaPipe/Pass 2, fora de escopo desta release).

### 3.5 Stack Tecnológica

| Camada | Biblioteca | Papel |
|---|---|---|
| Ingestão RTSP | `OpenCV` (cv2) + FFmpeg | Conectar e capturar frame sob demanda |
| Inferência | `YOLOv8n` (Ultralytics) | Detecção de classe `person` — variante nano por restrição de VROM compartilhada |
| Comunicação | `Paho-MQTT` | Publish do Evento de Contexto no broker existente |
| Zone masking | OpenCV (máscara poligonal) | Ignorar áreas irrelevantes (janelas, TVs) |

**Descartado do documento de origem:** MediaPipe (Pass 2, fora de escopo), Requests/AIOHTTP para "injeção via REST no LLM" (o backend FastAPI já existente cumpre esse papel via MQTT — não se cria canal paralelo), Home Assistant, Gemini API.

---

## 4. CRITÉRIOS DE ACEITAÇÃO

- [ ] Vision Service conecta ao RTSP e captura frame em < 2s
- [ ] Inferência YOLOv8n retorna resultado em < 1s (RTX 3060, modelo nano)
- [ ] Stream RTSP fecha corretamente após cada consulta (sem conexão pendurada)
- [ ] Comando de voz "IRIS, tem alguém na [zona]?" retorna resposta falada correta
- [ ] Zone masking elimina falsos positivos de área de teste conhecida (ex: janela com movimento de árvore)
- [ ] Vision Service não interfere na latência de resposta de voz da IRIS quando executado em sequência (não simultâneo)
- [ ] Nenhum frame é persistido em disco após a inferência
- [ ] Timeout de 5s funciona corretamente se câmera estiver offline

---

## 5. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Contenção de VRAM com Ollama/Whisper | 🟡 Média | 🔴 Alto | Serialização obrigatória (nunca simultâneo); medir uso real antes de liberar release |
| Latência de conexão RTSP sob demanda (cold start) | 🟡 Média | 🟡 Médio | Testar tempo de conexão na bancada antes de comprometer critério de aceitação |
| Câmera escolhida sem suporte ONVIF/RTSP estável | 🟢 Baixa | 🟡 Médio | Validar modelo específico antes da compra |
| Escopo creep para reconhecimento facial | 🔴 Alta | 🔴 Alto | Não-Objetivo explícito (§1.4); exige nova SPEC + ADR de privacidade |

---

## 6. DÉBITOS TÉCNICOS E ITENS PARA SPEC FUTURA

- Política de privacidade e retenção de dados visuais — pré-requisito bloqueante para qualquer identificação facial futura (nova ADR obrigatória)
- Head pose / atenção (MediaPipe, Pass 2) — avaliar em release posterior a R4.0
- Modo contínuo — só reavaliar se houver upgrade de GPU dedicada à visão (RTX 4080 ou acelerador dedicado tipo Coral/Hailo)

---

## 7. HISTÓRICO DE REVISÕES

| Versão | Data | Autor | Mudanças |
|---|---|---|---|
| 1.0 | 18/07/2026 | Jussie | Criação inicial a partir de documento externo (Gemini/Antigravity), reescrito para conformidade com ADR-001, ADR-002 e premissas local-first do SPEC-001 |

---

**Assinado:** Jussie (Product Owner / Tech Lead)
**Data:** 18/07/2026
**Próxima revisão:** Antes do início do sprint de R4.0
