# Matriz de rastreabilidade

| Capacidade | Implementação atual | Teste | Próxima lacuna |
|---|---|---|---|
| CAP-001 telemetria | backend + frontend | parcial | contrato e reconexão |
| CAP-002 controles | REST/WS + MQTT | parcial | ack físico |
| CAP-003 barramento | Paho + Mosquitto | manual | auth e contrato |
| CAP-004 confirmação | inexistente | inexistente | R0.5 |
| CAP-005 voz | `VoiceProvider` + OpenAI WebRTC padrão + Gemini legado + contenção local do endpoint | lint/build frontend + testes mockados de SDP, acesso local e rate limit | validar áudio/cancelamento em navegador, autenticação antes de exposição em rede, ferramentas e métricas |
| CAP-007 visão | script MediaPipe | manual | serviço e privacidade |
| CAP-008 setup único | inexistente | inexistente | R0.4 |
| CAP-009 autenticação | inexistente | inexistente | R0.8 |
