# CIRCE Home Platform — Frontend Briefing para Grok
**Versão:** 1.0 | **Data:** 07/06/2026 | **Autor:** Jussie (Tech Lead)

---

## 1. QUEM SOU EU (GROK) NESTE PROJETO

Você é o **executante de frontend** do CIRCE Home Platform.

Sua responsabilidade é implementar componentes React/Three.js de acordo com as
especificações fornecidas. Você **não toma decisões arquiteturais** — essas decisões
já foram tomadas e estão documentadas em ADRs. Qualquer desvio ou dúvida deve
ser reportada ao Tech Lead antes de implementar.

**Fluxo de trabalho:**
```
Tech Lead (Jussie + Claude)
  → define tarefa e entrega spec
  → Grok implementa o componente
  → Jussie revisa com Claude
  → aprovado → merge no repo
```

---

## 2. O PROJETO

**CIRCE Home Platform** é uma plataforma de automação residencial local-first
com IA de voz integrada (**IRIS** — Integrated Residential Intelligence System).

O hardware é um PC customizado em um case Alienware Area-51 ALX, controlado
por um ESP32 S3. O software roda localmente, sem dependência de nuvem.

**Stack completa:**
- Backend: FastAPI + SQLite + MQTT
- Microcontrolador: ESP32 S3
- IA: Ollama (LLM) + Whisper (STT) + Piper (TTS)
- Frontend: **React + Three.js** ← sua área de atuação

---

## 3. A INTERFACE — "INTERFACE VIVA"

O dashboard não é um painel estático. É um **organismo visual 3D** que responde
ao estado do sistema em tempo real. O conceito central:

> O usuário lê o estado do sistema pela dinâmica visual — cor, velocidade e
> ritmo —, não por números isolados.

### 3.1 Referência visual

O arquivo `docs/design/iris-interface-viva-v7.html` é o **protótipo funcional**
de referência (90% do visual final). Antes de implementar qualquer componente,
abra e estude este arquivo. Ele é a fonte de verdade visual — não invente nada
que não esteja nele ou na spec.

### 3.2 Estrutura da tela

```
┌──────────────────────────────────────────────────────┐
│  CIRCE                               [PC: ON]        │
│                                                      │
│  [🌡 Sensores]                    [⟳ Ventilação]    │
│                                                      │
│              ╭─────────────────╮                     │
│             ╱  barras + linhas  ╲                    │
│            │   ╭─────────────╮   │                   │
│            │  │  IRIS CORE   │  │                    │
│            │   ╰─────────────╯   │                   │
│             ╲  barras + linhas  ╱                    │
│              ╰─────────────────╯                     │
│                                                      │
│  [⬡ Aletas]                       [◈ Iluminação]    │
│                                                      │
│         • IRIS ONLINE          42.3°C                │
└──────────────────────────────────────────────────────┘
```

---

## 4. STACK TÉCNICA APROVADA (NÃO ALTERAR)

| Camada | Tecnologia | Notas |
|--------|-----------|-------|
| Framework | React 18 | Functional components + hooks |
| 3D Engine | Three.js r128 | Versão fixada — não usar r129+ |
| Wrapper 3D | @react-three/fiber | Ou Three.js vanilla — ADR-008 pendente |
| Animações UI | Framer Motion | Apenas para cards e transições 2D |
| Estado global | Zustand ou Context API | Definir no início do sprint R2.0 |
| Real-time | WebSocket nativo | FastAPI `/ws` — sem Socket.io |
| Fontes | Rajdhani + Space Mono | Google Fonts |

### ⛔ Proibido sem autorização prévia:
- Adicionar bibliotecas não listadas acima
- Usar `localStorage` ou `sessionStorage`
- Usar Socket.io (o backend usa WebSocket nativo)
- Usar CSS frameworks (Tailwind, Bootstrap) — CSS puro ou CSS modules
- Usar `axios` — `fetch` nativo é suficiente
- Mudar a paleta de cores sem aprovação

---

## 5. PALETA DE CORES (IMUTÁVEL)

```css
--void:    #02020a;  /* fundo — use em body e canvas background */
--teal:    #06B6D4;  /* cor primária IRIS — idle */
--purple:  #7C3AED;  /* IRIS ouvindo */
--amber:   #F59E0B;  /* atenção / aquecendo */
--orange:  #EA580C;  /* alerta */
--red:     #DC2626;  /* crítico */
--green:   #10B981;  /* confirmação */
--white:   #F8FAFC;  /* IRIS falando */
```

**Mapeamento térmico** (temperatura → cor → comportamento do orbe):

| Faixa | Cor | Hex | Velocidade orbe |
|-------|-----|-----|----------------|
| < 50°C | Azul | #1D4ED8 | 0.015 rad/frame |
| 50–60°C | Teal | #06B6D4 | 0.028 |
| 60–68°C | Âmbar | #F59E0B | 0.05 |
| 68–75°C | Laranja | #EA580C | rápido |
| > 75°C | Vermelho | #DC2626 | 0.085 + pulso |

---

## 6. CONTRATO DE DADOS (BACKEND → FRONTEND)

### 6.1 WebSocket — payload a cada 2 segundos

```typescript
// FastAPI → React via WebSocket /ws
interface SystemState {
  temperature: number;       // °C — ex: 42.3
  humidity: number;          // % — ex: 68.1
  tempHistory: number[];     // últimas 24 leituras
  fan1Speed: number;         // 0–100%
  fan1Rpm: number;           // RPM — ex: 1200
  fan2Speed: number;
  fan2Rpm: number;
  fanMode: 'auto' | 'manual' | 'silent';
  finsState: 'open' | 'closed' | 'moving' | 'error';
  ledColor: string;          // hex — ex: "#06B6D4"
  pcState: 'on' | 'off';
  irisState: 'idle' | 'listening' | 'speaking';
}
```

### 6.2 REST endpoints (ações do usuário)

```
GET  /api/v1/sensors/temperature
     → { value: number, humidity: number, history: number[] }

POST /api/v1/controls/fans
     body: { speed: number }  // 0–100

POST /api/v1/controls/fins
     body: { command: "open" | "close" }

POST /api/v1/controls/leds/ceiling
     body: { color: "#RRGGBB" }
  ou body: { effect: "thermal" | "rainbow" | "off" }
```

---

## 7. O ORBE 3D — ESPECIFICAÇÃO TÉCNICA

### 7.1 Câmera

```javascript
camera.position.z = 6.2;
camera.fov = 55;
```

### 7.2 Camadas de geometria

| Camada | Quantidade | Tipo Three.js | Dimensão |
|--------|-----------|---------------|----------|
| Barras altas | 700 | BoxGeometry | 0.8–4.0u altura |
| Barras médias | 600 | BoxGeometry | 0.15–1.0u |
| Barras curtas | 800 | BoxGeometry | 0.02–0.2u |
| Linhas de fuga | 1800 | THREE.Line | alcance 1.4–5.5× raio |
| Anel principal | 1 | TorusGeometry | raio 2.0u, espessura 0.018u |
| Anel glow | 1 | TorusGeometry | raio 2.0u, espessura 0.055u |
| Halo central | 1 | CircleGeometry | raio 1.81u |
| Partículas | 600 | THREE.Points | size 0.012 |

### 7.3 Animação por frame

```javascript
// Rotação principal (eixo Z)
orbGroup.rotation.z += rotSpeed * deltaTime;

// Balanço em Y (perspectiva 3D)
orbGroup.rotation.y = Math.sin(elapsed * 0.11) * 0.14;

// Raios com parallax
rayGroup.rotation.z = orbGroup.rotation.z * 0.3;
```

### 7.4 Spring physics (mouse/touch)

```javascript
// Para cada barra no raio de influência:
// tall: raio=2.2u, força_max=0.12
// med/short: raio=1.5u, força_max=0.07

// Por frame:
vel *= 0.84;                         // amortecimento
pos += vel;                          // aplica velocidade
pos += (anchor - pos) * 0.05;       // spring de retorno
```

---

## 8. ESTADOS DA IRIS (pupila central)

| Estado | Símbolo | Cor dominante | Comportamento orbe |
|--------|---------|--------------|-------------------|
| IDLE | "IRIS" (texto) | Arco-íris por ângulo | Velocidade por temperatura |
| OUVINDO | "◉" | Roxo #7C3AED | 0.025 rad/frame, lento |
| FALANDO | "◈" | Branco iridescente | 0.025 + pulso scale |

**Pulso IRIS falando:**
```javascript
orbGroup.scale.setScalar(1 + 0.06 * Math.sin(elapsed * 9));
```

---

## 9. CARDS DE CONTROLE

Cada card tem um trigger (botão 40×40px) posicionado no quadrante da tela.

**Animação de abertura:**
```css
/* scale(.88) → scale(1) em 280ms */
animation-timing-function: cubic-bezier(.34, 1.56, .64, 1);
```

**Estilo do card:**
```css
width: 255px;
backdrop-filter: blur(32px);
border-top: 1px solid linear-gradient(teal → transparent);
```

**O orbe 3D continua animado ao fundo enquanto o card está aberto.**

---

## 10. STATUS BAR

```
Posição: bottom center, fixed
Formato: [dot] [STATUS TEXT]    [TEMP°C]

Textos:
  IDLE normal     → "IRIS ONLINE"
  Aquecendo       → "AQUECENDO"
  Alerta térmico  → "ALERTA TÉRMICO"
  IRIS ouvindo    → "IRIS OUVINDO"
  IRIS falando    → "IRIS FALANDO"
```

Dot e temperatura usam a cor térmica atual. O dot pulsa em 2.2s.

---

## 11. TIPOGRAFIA

| Uso | Fonte | Peso | Tamanho | Letter-spacing |
|-----|-------|------|---------|---------------|
| Labels de card | Rajdhani | 600 | 8px | 3.5px |
| Valores numéricos | Space Mono | 700 | 21px | — |
| Botões | Rajdhani | 600 | 8px | 2px |
| Status bar | Rajdhani | 400 | 8px | 3px |
| Logo CIRCE | Rajdhani | 600 | 9px | 5px |

---

## 12. REGRAS DE ENTREGA

### O que você deve entregar

Para cada tarefa recebida, entregue:

1. **Componente(s) React** — arquivo(s) `.tsx` ou `.jsx`
2. **Estilo** — CSS module ou styled dentro do componente (sem arquivo global)
3. **Props tipadas** em TypeScript (quando aplicável)
4. **Modo simulado** — se o componente depende de dados reais do backend,
   inclua um mock do WebSocket/REST para visualização standalone:
   ```typescript
   const MOCK_STATE: SystemState = { temperature: 42, humidity: 68, ... }
   ```

### O que você NÃO deve fazer

- ❌ Criar ou modificar arquivos de backend (FastAPI, SQLite, MQTT)
- ❌ Alterar a paleta de cores sem aprovação
- ❌ Adicionar dependências ao `package.json` sem listar e justificar
- ❌ Implementar features que não estejam na tarefa atual
- ❌ Criar arquitetura de estado global (aguardar ADR-008)
- ❌ Modificar o protótipo `iris-interface-viva-v7.html` (arquivo congelado)

### Formato de entrega

Ao finalizar um componente, informe:
```
COMPONENTE: NomeDoComponente
ARQUIVOS: src/components/X.tsx, src/styles/X.module.css
DEPENDÊNCIAS NOVAS: nenhuma / [lista se houver]
DESVIOS DA SPEC: nenhum / [descrever se houver]
MOCK INCLUÍDO: sim/não
```

---

## 13. CRITÉRIOS DE ACEITAÇÃO (R2.0)

Estes são os critérios que a revisão vai validar:

- [ ] Orbe 3D visível e animado ao abrir o dashboard
- [ ] Barras respondem ao mouse com spring physics
- [ ] Cor do orbe muda conforme temperatura
- [ ] Estado IRIS (idle/ouvindo/falando) muda o visual corretamente
- [ ] Cards abrem/fecham com animação fluida
- [ ] Card Sensores exibe temperatura e umidade reais (WebSocket)
- [ ] Card Ventilação exibe RPM e speed, slider funcional
- [ ] Card Aletas exibe estado, botões enviam comandos
- [ ] Card Iluminação muda cor das fitas WS2812B
- [ ] Status bar reflete estado real
- [ ] Performance ≥ 45fps em Chrome desktop
- [ ] Sem tela preta em Safari iOS

---

## 14. BACKLOG DE POLISH (fora do escopo atual — não implementar)

Estas features existem mas são para releases futuras. Se quiser sugerir
algo nesta lista, registre como observação mas **não implemente**:

- Bloom real (UnrealBloomPass) → R2.1
- Gradiente nas barras → R2.1
- Trail nas linhas de fuga → R2.1
- Cursor 3D → R3.0
- Fallback Canvas 2D para GPU fraca → R3.0

---

## 15. ARQUIVOS DE REFERÊNCIA

Solicite ao Tech Lead antes de cada sessão:

| Arquivo | Para que serve |
|---------|---------------|
| `docs/design/iris-interface-viva-v7.html` | **Obrigatório** — referência visual de 90% do visual final |
| `docs/SPEC-002-UI-UX.md` | Especificação completa de comportamento |
| `docs/ADR-006-interface-viva.md` | Decisões arquiteturais já tomadas |

---

*Este briefing é mantido pelo Tech Lead (Jussie + Claude).*
*Versão 1.0 — 07/06/2026*
