# Estado atual do projeto

**Baseline analisada:** ZIP fornecido em 22/07/2026.
**Classificação:** protótipo integrado; ainda não é uma release operacional reproduzível.

## Resumo executivo

A CIRCE possui quatro blocos concretos: frontend React com interface espacial; backend FastAPI com REST/WebSocket/MQTT/SQLite; firmware ESP32-S3 para mecanismo do case; e serviços experimentais de voz e visão. O principal gargalo não é ausência de código, mas falta de estabilização, segurança e confirmação ponta a ponta.

## Maturidade

| Área | Estado | Nível |
|---|---|---:|
| Produto | visão definida, escopo amplo | 3/5 |
| Frontend | protótipo avançado | 3/5 |
| Backend | MVP funcional | 3/5 |
| Firmware | controle mecânico parcial | 2/5 |
| Voz | experimental, sem baseline confiável | 1/5 |
| Visão | protótipo isolado | 2/5 |
| DevOps | broker apenas no Compose | 1/5 |
| Segurança | laboratório | 1/5 |
| Testes | cobertura inicial | 1/5 |

## Implementado e comprovado no repositório

- FastAPI, endpoints REST, WebSocket, SQLite e MQTT;
- React/Vite/TypeScript, orbe 3D, store Zustand e controles;
- adaptadores experimentais Gemini Live e OpenAI Realtime;
- firmware ESP32-S3 com Wi-Fi, MQTT, servo e fins de curso;
- face tracking MediaPipe e simulador MQTT.

## Ainda não comprovado

- stack completa iniciada por um único comando;
- autenticação, autorização e gestão segura de segredos;
- confirmação física/acknowledgement de comandos;
- DHT22, PWM de fans e WS2812B no firmware atual;
- voz confiável em produção;
- CI/CD e release reproduzível.

## Prioridade imediata

Construir a baseline **R0.4 — Reprodutível e Observável**, antes de ampliar funcionalidades. O critério é: uma máquina limpa deve conseguir instalar, iniciar, testar e diagnosticar a plataforma sem conhecimento tácito do autor.
