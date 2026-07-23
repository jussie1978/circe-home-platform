# CIRCE Home Platform — Design System & Visual Specification
**Versão:** 3.0 (Release "IRIS Live & Neon-Glass")  
**Propósito:** Especificação visual, de interface (UI) e espacial da plataforma CIRCE, com foco na identidade de ficção científica (sci-fi), console CRT e orbe fotorrealista. Ideal para alimentação de ferramentas de design e modelagem IA (Stitch, Unreal, Figma).

---

## 1. Princípios de Design & Diretiva Visual

O sistema visual do CIRCE (sob a égide da IA central **IRIS**) baseia-se em três pilares fundamentais:
*   **Ficção Científica Utilitária (Retro-Futurismo):** Remete a terminais de controle industriais refinados, com elementos CRT, grades de leitura de dados mono-espaçadas e contraste extremo.
*   **Vidro Acrílico Fotorrealista (Glassmorphism 3.0):** Elementos em 3D e cards usam propriedades de refração física, reflexo especular de estúdio e camadas de verniz brilhante (*clearcoat*), simulando peças físicas e tangíveis.
*   **Neons Sólidos & Saturação HDR:** Cores neon vibrantes que brilham de forma concentrada através de filtros de pós-processamento, evitando lavagem de cor (sem sobreposição aditiva que cause saturação branca).

---

## 2. Tipografia (Typography System)

A tipografia do projeto é dividida estritamente em duas famílias de fontes que equilibram legibilidade moderna com estética de terminal cibernético.

### 2.1. Fonte de Dados e Sistema: `JetBrains Mono`
*   **Uso principal:** Telemetria, leituras numéricas, labels de status, logs do console, comandos de voz em texto, coordenadas de satélites e todo texto de cunho técnico/diagnóstico.
*   **Atributos de estilo:** Monospace, excelente espaçamento de caracteres para números, altura x generosa e legibilidade extrema em fontes pequenas (8px a 11px).
*   **Pesos (Weights):**
    *   `Regular (400)`: Texto corrido de telemetria, logs de sistema.
    *   `Bold (700)`: Títulos de diagnóstico (ex: `IRIS_MONITOR`), comandos executados e valores dinâmicos ativos (ex: `42°C`).

### 2.2. Fonte de Interface e Acesso: `Mono Sans` (ou fallback moderno `Inter` / `Outfit`)
*   **Uso principal:** Cabeçalhos de cards de controle, menus de configurações, descrições informativas, textos explicativos gerais e elementos interativos do painel lateral.
*   **Atributos de estilo:** Sem serifa, limpa, visual geométrico contemporâneo com curvas suavizadas para contrastar com a rigidez do monospace.
*   **Pesos (Weights):**
    *   `Light (300)` / `Regular (400)`: Textos secundários nos cards, descrições dos controles.
    *   `Medium (500)` / `SemiBold (600)`: Subtítulos e botões interativos.
    *   `Bold (700)`: Nomes dos painéis (ex: `VENTILAÇÃO`, `ALETAS`, `ILUMINAÇÃO`).

---

## 3. Paleta de Cores & Zonas de Iluminação (Color Palette)

O sistema trabalha com um espectro de cores altamente saturado baseado no mapeamento HSL linear ao redor do Orbe, intercalando cores dinâmicas e estáticas dependendo do estado do sistema.

### 3.1. Cores de Estado da IRIS (IRIS Core States)
| Estado | Cor Hex | Representação HSL | Descrição Visual |
| :--- | :--- | :--- | :--- |
| **Online (Idle)** | `#06B6D4` | `HSL(190, 95%, 45%)` | Cyan Elétrico padrão. Sensação de prontidão e estabilidade. |
| **Ouvindo (Listening)** | `#7C3AED` | `HSL(260, 95%, 50%)` | Roxo Profundo pulsante. Indica foco e recepção do microfone. |
| **Falando (Speaking)** | `#00f3ff` | `HSL(185, 95%, 50%)` | Azul Ciano Ultra-Saturado. Alto brilho indicando atividade verbal. |
| **Crítico (Thermal Alert)**| `#EF4444` | `HSL(0, 100%, 50%)` | Vermelho Sangue Crítico. Temperatura > 75°C ou falha no sistema. |

### 3.2. Tons de Fundo e Estrutura (Core Surfaces)
*   **Deep Void (Backdrop):** `#02020a` (Preto absoluto azulado. Absorve a luz e cria alto contraste para os neons).
*   **Vortex Base (Radial Center):** `#070414` a `#030207` (Prepara o gradiente de fundo que circunda o orbe).
*   **Glass Panel Overlay:** `rgba(2, 2, 10, 0.85)` (Cards com alta opacidade para bloquear elementos 3D traseiros, combinado com `backdrop-filter: blur(16px)`).
*   **Bordas Técnicas:** `rgba(255, 255, 255, 0.08)` (Delicadas linhas de grade cinzentas).
*   **Bordas Ativas (Foco):** `rgba(6, 182, 212, 0.3)` (Linha brilhante cyan neon).

---

## 4. Layout Espacial e Interface 2.0 (Spatial UI Grid)

A navegação centralizada baseia-se em um sistema de cliques em quadrantes invisíveis que envolvem a área tridimensional central, garantindo controle fluido e imersivo.

```
+---------------------------------------+
|  Top-Left (Telemetry & DHT22)         |  Top-Right (ALX PWM Fans)             |
|                                       |                                       |
|                  +---------------+    |                                       |
|                  | CENTRAL ORB   |    |                                       |
|                  |   (320px)     |    |                                       |
|                  | Click: Voice  |    |                                       |
|                  | Drag: Rotate  |    |                                       |
|                  +---------------+    |                                       |
|                                       |                                       |
|  Bottom-Left (Servos/Fins Angle)     |  Bottom-Right (WS2812B LEDs)          |
+---------------------------------------+
```

### 4.1. Quadrantes de Interação
*   **Top-Left (Superior Esquerdo):** Telemetria. Abre painel de temperatura, umidade, e histórico térmico (Sensor DHT22).
*   **Top-Right (Superior Direito):** Ventilação. Abre controle de velocidade de ventoinhas PWM (Gabinete Alienware ALX).
*   **Bottom-Left (Inferior Esquerdo):** Aletas. Abre controle de servo-motores e abertura mecânica do case.
*   **Bottom-Right (Inferior Direito):** Iluminação. Abre os controles de cores, padrões e efeitos dos LEDs RGB WS2812B.
*   **Central Orb (Círculo Central de 320px):**
    *   *Click:* Toca a assistente de voz IRIS se nenhum painel estiver aberto. Se algum painel estiver aberto, fecha-o (Botão Home).
    *   *Drag:* Rotaciona levemente o Orbe no espaço tridimensional com efeito amortecido de mola (*spring-return*).

---

## 5. Especificações do Orbe 3D (Three.js Engine Specs)

Para recriar a fidelidade visual ultra-realista de Unreal Engine no navegador, o Orbe 3D central usa as seguintes diretivas físicas.

### 5.1. Geometria das Barras de Frequência (Instanced Bars)
*   **Três categorias de instâncias:** *Tall* (altas, 700 unidades), *Medium* (médias, 600 unidades), e *Short* (baixas, 800 unidades).
*   **Material Físico (`MeshPhysicalMaterial`):**
    *   `vertexColors = true` (Cor de gradiente baseada nos vértices para criar sombra intrínseca da base ao topo).
    *   `blending = THREE.NormalBlending` (Evita clareamento/lavagem de cor por soma, preserva a solidez física das barras).
    *   `opacity = 0.96` (Quase opaco, dando peso ao objeto).
    *   `metalness = 0.04` (Valores baixos evitam que o objeto se torne metálico cromado, mantendo a emissão de difusão de cores vivas).
    *   `roughness = 0.12` e `clearcoat = 1.0` (Efeito de acabamento laqueado brilhante).
    *   `transmission = 0.15` e `thickness = 0.5` (Cria uma refração vítrea sutil nas bordas das barras).
    *   `depthWrite = true` (Garante a correta sobreposição 3D).

### 5.2. Configuração de Luzes e Estúdio
*   `ambientLight`: Intensidade `0.25` (Luz de preenchimento fraca para não estourar os tons pretos).
*   `directionalLight`: Posição `[5, 10, 5]`, Intensidade `1.8`, Cor `#ffffff` (Luz do sol/chave criando reflexos no topo das barras).
*   `pointLight 1 (Ciano)`: Posição `[-6, -6, 3]`, Intensidade `2.5`.
*   `pointLight 2 (Roxo)`: Posição `[6, 6, 3]`, Intensidade `2.5`.
*   `Environment`: HDRI `"night"` (Cria reflexos complexos de luz noturna e luz de estúdio refletindo nas laterais do Orbe laqueado).

### 5.3. Pós-Processamento Cinemático (Post-Processing Compositor)
Para fazer o brilho neon das barras saltar aos olhos sem desfocar o objeto principal:
*   **Bloom (Glow):**
    *   `intensity = 1.6 * glowIntensity` (Brilho intenso e focado).
    *   `luminanceThreshold = 0.7` e `luminanceSmoothing = 0.6` (Limita o brilho apenas aos topos das barras mais iluminados por HDR).
    *   `mipmapBlur = true`.
*   **Chromatic Aberration (Prisma de Lente):**
    *   `offset = Vector2(0.0006, 0.0006)` (Distorção espectral sutil nas bordas periféricas da tela).
*   **Noise (Ruído Film Grain):**
    *   `opacity = 0.006` (Evita artefatos de gradiente, deixando a renderização lisa e limpa).
*   **Vignette (Vinheta de Lente):**
    *   `offset = 0.45` e `darkness = 0.6` (Bordas escuras suaves direcionando o olhar ao centro).

---

## 6. Tokens CSS e Variáveis de Estilo (Design Tokens)

Os estilos globais e as propriedades dos painéis de vidro (glassmorphism) são representados pelas seguintes classes base em CSS Vanilla:

```css
:root {
  /* Cores de Identidade */
  --iris-phosphor: #06b6d4;      /* Ciano clássico terminal */
  --iris-phosphor-dim: #08667a;  /* Ciano de leitura secundária */
  --iris-border: rgba(6, 182, 212, 0.2); /* Borda brilhante sutil */
  --iris-dark-bg: rgba(2, 2, 10, 0.85); /* Fundo dos painéis de vidro */
  
  /* Fontes Padrão */
  --font-mono: 'JetBrains Mono', 'Courier New', Courier, monospace;
  --font-sans: 'Mono Sans', 'Inter', -apple-system, sans-serif;
}

/* Painéis Estilo Vidro Acrílico Premium */
.glass-panel {
  background: var(--iris-dark-bg);
  border: 1px solid var(--iris-border);
  backdrop-filter: blur(16px) saturate(120%);
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.6), 
              0 0 10px rgba(6, 182, 212, 0.05);
}

/* Detalhe Estilo Scanner CRT */
.crt-effect::after {
  content: " ";
  display: block;
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
              linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 3px, 6px 100%;
  pointer-events: none;
  z-index: 99;
}
```
