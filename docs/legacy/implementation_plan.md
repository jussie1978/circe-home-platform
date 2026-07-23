# Plano de Implementação — Reestruturação da IRIS (Releases 3.0 & 4.0)

Este plano estabelece a reengenharia do assistente **IRIS** para entregar uma experiência conversacional de alta fidelidade e baixíssima latência (híbrida nuvem/local), integrada a uma interface 3D de qualidade fotorrealista e controle de hardware físico robótico.

---

## 1. Escopo das Modificações

O plano substitui o cronograma original de voz local (Whisper/Ollama/Piper) e detecção contínua por um design fotorrealista híbrido dividido em duas etapas:

*   **Fase 1 (Release 3.0 — Voz Híbrida e Orbe Fotorrealista Reativo):**
    *   Integração do microfone/alto-falante do Frontend com a API do **Gemini Live (WebSockets)**.
    *   Mapeamento de funções locais (*Function Calling*) via REST/WebSocket local do Frontend $\rightarrow$ FastAPI Backend $\rightarrow$ MQTT.
    *   Suporte a **GPT Realtime API** como mecanismo de backup estruturado.
    *   Upgrade visual do **Orbe 3D** para materiais físicos (PBR), iluminação volumétrica, pós-processamento cinematográfico e animação responsiva à frequência do áudio (FFT).
*   **Fase 2 (Release 4.0 — Câmeras e Interface Ambiente):**
    *   Criação do **Vision Service** (YOLOv8n rodando em CPU no Dev PC para presença sob demanda de zonas via câmera Tapo C206).
    *   Implementação do controle físico de servos (Pan/Tilt) na câmera **Yahboom PTZ** integrada ao [face_tracker.py](file:///c:/Users/NI%20PJC/.gemini/antigravity/scratch/circe-home-platform/scripts/face_tracker.py).
    *   Desenvolvimento da rota `/iris-only` responsiva e leve (sem WebGL complexo) para uso em tablets remotos (ex: cozinha).

---

## 2. User Review Required

> [!IMPORTANT]
> **Requisitos do Desenvolvedor (Credenciais):**
> Para a execução da Fase 1, será necessário criar chaves de API nos consoles de desenvolvedores (ambos configurados localmente em arquivos `.env` privados):
> *   `GEMINI_API_KEY` (Google AI Studio — Tier Gratuito disponível).
> *   `OPENAI_API_KEY` (OpenAI Platform — Requer saldo de recarga para uso do Realtime).

> [!WARNING]
> **Performance em Dispositivos Móveis:**
> O upgrade para materiais físicos e pós-processamento fotográfico (Bloom, Vignette, Depth of Field) no dashboard principal exige mais GPU do dispositivo cliente. O uso em tablets mais antigos será mitigado pelo desenvolvimento da rota leve `/iris-only`.

---

## 3. Detalhamento das Alterações no Código

### 3.1 Diretrizes e Regras

#### [MODIFY] [AGENTS.md](file:///c:/Users/NI%20PJC/.gemini/antigravity/scratch/circe-home-platform/.agents/AGENTS.md)
*   Flexibilizar a regra "100% Local" exclusivamente para a inteligência de voz conversacional e visão detalhada sob demanda, mantendo o controle físico de IoT (comandos de hardware e lógica do barramento) estritamente local e resiliente.

---

### 3.2 Componente: Frontend React

#### [NEW] [voiceService.ts](file:///c:/Users/NI%20PJC/.gemini/antigravity/scratch/circe-home-platform/frontend/src/services/voiceService.ts)
*   Criar um adaptador WebSocket nativo para a API de desenvolvedor do Gemini Live.
*   Implementar captação de microfone em chunks de áudio binários (PCM 16-bit, 16kHz ou 24kHz) e envio via WebSocket.
*   Adicionar player de áudio integrado (Web Audio API) consumindo chunks binários retornados.
*   Registrar a estrutura de *Function Calling* (`control_fans`, `control_leds`, `check_presence`, `check_temperature`).
*   Disparar requisições REST locais ao backend FastAPI ao receber eventos de execução do modelo.

#### [NEW] [gptRealtimeService.ts](file:///c:/Users/NI%20PJC/.gemini/antigravity/scratch/circe-home-platform/frontend/src/services/gptRealtimeService.ts)
*   Criar adaptador alternativo para a API Realtime da OpenAI com a mesma interface de métodos, permitindo a alternância transparente.

#### [MODIFY] [OrbCanvas.tsx](file:///c:/Users/NI%20PJC/.gemini/antigravity/scratch/circe-home-platform/frontend/src/components/OrbCanvas.tsx)
*   Importar `<Environment>` e `<DepthOfField>` do Drei/Postprocessing.
*   Alterar materiais do Orbe de `MeshBasicMaterial` para `MeshPhysicalMaterial` com atributos de `transmission: 0.9`, `thickness: 1.5`, `roughness: 0.1` e reflexos metálicos.
*   Implementar analisador de áudio (`AudioAnalyser` / Web Audio FFT) para receber a amplitude da voz da IRIS e aplicar deformação de ruído nos vértices das malhas geométricas 3D em tempo real.
*   Ajustar parâmetros de pós-processamento: adicionar profundidade de campo focada na distância do Orbe, leve aberração cromática e grão de filme cinematográfico.

#### [MODIFY] [App.tsx](file:///c:/Users/NI%20PJC/.gemini/antigravity/scratch/circe-home-platform/frontend/src/App.tsx)
*   Implementar roteamento ou visualização condicional para separar o painel principal da tela leve `/iris-only` (que renderiza apenas uma animação de áudio 2D leve em SVG/CSS para o tablet remoto).

---

### 3.3 Componente: Backend FastAPI & MQTT

#### [MODIFY] [main.py](file:///c:/Users/NI%20PJC/.gemini/antigravity/scratch/circe-home-platform/backend/app/main.py)
*   Criar endpoints REST para recebimento de chamadas de automação originadas do *Function Calling* do frontend.
*   Implementar lógica assíncrona de gatilho de presença: publica `"trigger"` em `alx/vision/{camera_id}/check` e aguarda por até 5.0 segundos no WebSocket/MQTT pela resposta do Vision Service para retornar o contexto ao frontend.

#### [MODIFY] [mqtt.py](file:///c:/Users/NI%20PJC/.gemini/antigravity/scratch/circe-home-platform/backend/app/mqtt.py)
*   Adicionar subscrição aos tópicos de visão e presença (`alx/vision/+/presence`, `alx/vision/+/status`).

#### [MODIFY] [models.py](file:///c:/Users/NI%20PJC/.gemini/antigravity/scratch/circe-home-platform/backend/app/models.py)
*   Adicionar tabela `presence_logs` para persistir dados consolidados de presença de zonas e contagem numérica de ocupação.

---

### 3.4 Componente: Serviços de Visão & Scripts

#### [NEW] [vision_service.py](file:///c:/Users/NI%20PJC/.gemini/antigravity/scratch/circe-home-platform/scripts/vision_service.py)
*   Desenvolver o Daemon de visão em Python.
*   Carregar o modelo YOLOv8n na CPU (`device='cpu'`) para eliminar alocação de VRAM e manter o serviço ativo com uso insignificante de recursos em repouso.
*   Conectar ao stream RTSP da câmera Tapo C206 sob demanda ao receber o gatilho MQTT, aplicar a máscara poligonal de zona, inferir detecção de classe `person`, enviar o payload formatado via MQTT e desconectar a câmera.

#### [MODIFY] [face_tracker.py](file:///c:/Users/NI%20PJC/.gemini/antigravity/scratch/circe-home-platform/scripts/face_tracker.py)
*   Adicionar módulo de controle serial (ex: `pyserial`) para enviar comandos angulares baseados em `faceX` e `faceY` para a placa controladora USB dos servomotores da câmera física Yahboom PTZ, fazendo-a mover-se fisicamente no setup.

---

## 4. Plano de Verificação

### 4.1 Testes de Integração de Voz (Fase 1)
1.  **Conexão WebSocket:** Validar que o microfone do navegador abre o canal WebSocket com a API do Gemini Live e fecha corretamente ao encerrar.
2.  **Function Calling:** Dizer *"IRIS, acenda os LEDs em vermelho"*, monitorar nos logs do FastAPI o recebimento da chamada de ferramenta `control_leds` e confirmar a alteração no barramento MQTT físico/simulado.
3.  **Fallback GPT:** Simular erro de autenticação/rede no Gemini e verificar se a interface chaveia automaticamente para o provedor da OpenAI Realtime sem quebrar a sessão do usuário.

### 4.2 Verificação de Performance e Gráficos (Fase 1)
1.  **Frame Rate (60 FPS):** Monitorar o contador de FPS no painel com o pós-processamento ativado no Dev PC, gerando que a taxa de frames não caia abaixo de 60.
2.  **Contenção de VRAM:** Verificar se a RTX 3060 mantém a alocação de memória abaixo de 11.5 GB durante execução do Ollama + Whisper + render do navegador com as novas malhas físicas.

### 4.3 Testes de Visão e Hardware (Fase 2)
1.  **Inferência na CPU:** Validar que o `vision_service.py` rodando na CPU executa a análise de imagem em < 100ms após o recebimento do frame RTSP.
2.  **Desconexão RTSP:** Certificar-se de que a conexão IP com a câmera Tapo fecha instantaneamente após o término do frame, prevenindo bloqueio do dispositivo.
3.  **Movimentação PTZ:** Validar se a câmera física Yahboom rotaciona suavemente sem atrasos perceptíveis ao acompanhar os landmarks faciais calculados pelo MediaPipe.
