# CIRCE Home Platform — Roadmap Técnico

**Atualizado em:** 22/07/2026
**Critério:** fases baseadas no estado real do repositório, não apenas nas datas antigas.

## Estado geral

| Marco | Resultado esperado | Estado |
|---|---|---|
| R0.3 — Protótipo integrado | UI + API + MQTT + firmware experimental | parcialmente entregue |
| R0.4 — Baseline reprodutível | instalação, testes e execução confiáveis | próximo |
| R0.5 — Loop físico fechado | comando, ack e telemetria reais | planejado |
| R0.6 — Voz segura e estável | função de voz com segredos protegidos | planejado |
| R0.7 — Visão e presença | tracking integrado sem conflito | planejado |
| R1.0 — Foundation | MVP doméstico local operável | planejado |

## R0.4 — Baseline reprodutível

**Objetivo:** qualquer desenvolvedor deve conseguir iniciar o projeto e validar o núcleo.

- normalizar `requirements.txt` para UTF-8;
- criar `.env.example` para backend e frontend;
- unificar porta backend em 8001 ou escolher nova porta via configuração;
- adicionar backend e frontend ao Docker Compose, ou declarar Compose parcial;
- criar comandos `make setup`, `make test`, `make dev` ou equivalentes;
- adicionar evento de shutdown MQTT;
- instalar dependências em CI e executar pytest + build frontend;
- corrigir todos os links documentais quebrados;
- publicar matriz de compatibilidade Windows/Linux/Raspberry Pi.

**Saída obrigatória:** pipeline verde em máquina limpa.

## R0.5 — Loop físico fechado

**Objetivo:** diferenciar estado desejado de estado confirmado.

- definir tópicos `command`, `reported` e `availability`;
- firmware publicar acknowledgements e posição observada;
- backend registrar CommandLog com correlação e resultado;
- implementar timeout e status `pending/confirmed/failed`;
- adicionar sensores reais de temperatura/umidade;
- implementar fans/LEDs apenas após spec elétrica e testes de bancada;
- criar failsafe local independente do backend.

**Saída obrigatória:** teste ponta a ponta reproduzível com hardware.

## R0.6 — Voz segura e estável

**Objetivo:** conversação fluida sem expor segredos nem comprometer controle local.

- retirar chave de API persistida em `localStorage` para uso de produção;
- criar sessão efêmera/token broker no backend;
- formalizar interface `VoiceProvider`;
- integrar fallback Gemini/OpenAI por configuração, não por código duplicado;
- validar schemas de function calling;
- adicionar confirmação para ações perigosas;
- registrar métricas de latência sem armazenar áudio por padrão.

## R0.7 — Visão e presença

- empacotar dependências do face tracker;
- definir taxa máxima e QoS MQTT;
- separar detecção de presença de identidade facial;
- integrar PTZ por módulo próprio, com limites mecânicos;
- implementar modo privado e indicador visual de câmera ativa;
- criar rota remota leve apenas após autenticação local.

## R1.0 — Foundation

Critérios de aceite:

- controle básico funciona sem nuvem;
- dashboard reconecta e mostra estado confirmado;
- histórico persiste sem bloquear a API;
- hardware entra em modo seguro se perder broker/backend;
- instalação documentada e automatizada;
- segurança mínima aplicada na LAN;
- testes automatizados cobrem os fluxos essenciais;
- documentação reflete o release publicado.

## Depois do R1.0

- R1.1: PWA/tablet e experiência multiambiente;
- R1.2: automações locais e cenas;
- R1.3: observabilidade e backup;
- R2.0: expansão de atuadores e iluminação;
- R3.0: inteligência multimodal madura;
- R4.0: produto/kit comercial, somente após validação de segurança e confiabilidade.
