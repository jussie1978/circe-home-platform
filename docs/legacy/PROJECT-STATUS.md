# CIRCE Home Platform — Estado Atual do Projeto

**Data da auditoria:** 22/07/2026
**Base analisada:** conteúdo do ZIP `circe-home-platform-main(1).zip`.

## 1. Resumo executivo

O repositório não está vazio nem em estágio meramente conceitual. Ele contém uma prova de conceito integrada com quatro blocos reais:

- frontend React/TypeScript com interface espacial, orbe 3D e painel de controle;
- backend FastAPI com REST, WebSocket, persistência SQLite e ponte MQTT;
- firmware ESP32-S3 para controle físico do mecanismo do case;
- serviços auxiliares de visão facial e simulação MQTT.

A documentação existente é valiosa, mas está fragmentada. O README afirma a existência de `docs/ROADMAP.md` e `docs/ARCHITECTURE.md`, porém esses arquivos não estavam no ZIP. Há também referências a documentos inexistentes, como `SPEC-002-UI-UX.md`, `ADR-006-interface-viva.md`, `ADR-008` e um protótipo HTML. Esta consolidação corrige os dois documentos centrais ausentes e registra as demais lacunas.

## 2. Maturidade por área

| Área | Estado observado | Nível | Evidência principal |
|---|---|---:|---|
| Visão de produto | definida | 3/5 | SPEC-001, IRIS-IDENTITY, brainstorming |
| Frontend | protótipo avançado | 3/5 | `App.tsx`, `OrbCanvas.tsx`, store e painel modular |
| Backend | MVP funcional | 3/5 | REST, WebSocket, MQTT, SQLite e testes de controle |
| Firmware | protótipo funcional | 2/5 | controle de servo, fins de curso, Wi-Fi e MQTT |
| Voz | integração experimental | 2/5 | Gemini Live no browser e adaptador GPT Realtime |
| Visão computacional | protótipo isolado | 2/5 | MediaPipe + MQTT em `face_tracker.py` |
| DevOps | incompleto | 1/5 | Compose sobe apenas Mosquitto; backend/frontend ficam fora |
| Segurança | ambiente de laboratório | 1/5 | CORS aberto, MQTT anônimo, chave de API no cliente |
| Testes | cobertura inicial | 1/5 | três testes de controles; sem CI e sem testes frontend/firmware |
| Documentação | parcialmente consolidada | 2/5 | bons documentos isolados, mas sem fonte única da verdade |

## 3. O que já está implementado

### Backend

- FastAPI v0.3.0 na porta 8001 quando executado diretamente.
- `GET /health` e `GET /api/v1/status`.
- histórico de sensores em SQLite.
- controles de fans, modo de fans, aletas, cor e modo de LEDs.
- WebSocket `/ws` para estado inicial, comandos e broadcast.
- cliente MQTT com compatibilidade Paho v1/v2.
- seed de configurações e dispositivo principal.

### Frontend

- React 18, Vite e TypeScript.
- React Three Fiber, Drei e pós-processamento para o orbe.
- Zustand para estado visual e operacional.
- interface de telemetria, ventilação, aletas e iluminação.
- reconexão WebSocket e fallback REST para comandos.
- serviço Gemini Live com captura/reprodução de áudio.
- adaptador separado para OpenAI Realtime, ainda não integrado como fallback automático.

### Firmware e hardware

- alvo ESP32-S3 via PlatformIO.
- Wi-Fi e MQTT.
- controle de servo contínuo do teto/aletas.
- homing por fins de curso.
- publicação de status e recebimento de comandos.
- lista de componentes e orientações elétricas iniciais.

### Visão e simulação

- face tracking com MediaPipe Face Mesh, suavização e publicação em `alx/vision/face`.
- simulador de temperatura, umidade, rosto e voz via MQTT.

## 4. Itens declarados, mas não comprovados no ZIP

- dashboard plenamente empacotado em Docker;
- Raspberry Pi 5 como host operacional;
- sensores DHT22 conectados ao firmware atual;
- controle PWM de fans e WS2812B no firmware atual;
- Piper, Whisper, Ollama e YOLOv8 integrados ao runtime atual;
- rota `/iris-only`;
- integração real com câmera PTZ física;
- autenticação, autorização e gestão segura de segredos;
- CI/CD;
- releases R1.0/R2.0 concluídas.

Esses itens devem ser tratados como planejados, experimentais ou descritos em documentação, não como funcionalidades entregues.

## 5. Inconsistências encontradas

1. O README aponta backend em 8000 no script de setup, mas `main.py` e o frontend usam 8001.
2. O README cita Tailwind como parte central; o repositório tem configuração Tailwind, porém a regra do agente exige CSS tradicional e a interface usa majoritariamente `index.css`.
3. O `docker-compose.yml` inicia apenas Mosquitto, apesar de a documentação sugerir orquestração completa.
4. MQTT aceita acesso anônimo em todas as interfaces da rede local.
5. CORS permite qualquer origem com credenciais.
6. A chave Gemini pode ser armazenada no `localStorage` do navegador.
7. O arquivo `backend/requirements.txt` está codificado em UTF-16LE, o que pode quebrar ferramentas e pipelines.
8. Não há encerramento explícito do cliente MQTT no evento de shutdown do FastAPI.
9. O estado principal é mantido em memória; reiniciar o backend perde estados de controle.
10. O repositório não contém os documentos centrais que o próprio README referenciava.

## 6. Resultado da validação neste ambiente

- **Testes backend:** a coleta não foi concluída porque `paho-mqtt` não estava instalado no ambiente de análise. Os testes existentes foram inspecionados e cobrem controles REST e WebSocket.
- **Build frontend:** não foi concluído porque as dependências Node não estavam instaladas (`node_modules` ausente). Os erros subsequentes são consequência direta dessa ausência, portanto não provam defeito do código.
- **Links internos:** foram detectados como ausentes `docs/ROADMAP.md` e `docs/ARCHITECTURE.md`; ambos foram adicionados nesta entrega.

## 7. Próxima decisão recomendada

Congelar novas funcionalidades por um ciclo curto de estabilização. O próximo marco deve ser **R0.4 — Baseline Reprodutível**, no qual qualquer máquina nova consegue clonar, instalar, testar e iniciar broker, backend e frontend com comandos documentados e resultados verificáveis.
