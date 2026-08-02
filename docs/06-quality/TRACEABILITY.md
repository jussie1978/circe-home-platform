# Matriz de rastreabilidade

| Capacidade | Implementação atual | Teste | Próxima lacuna |
|---|---|---|---|
| CAP-001 telemetria | backend + frontend | parcial | contrato e reconexão |
| CAP-002 controles | REST/WS + MQTT; teto/servos com comando oficial e compatibilidade escalar temporária | parcial; suíte focal com 19 testes | ACK real do firmware e demais controles |
| CAP-003 barramento | Paho + Mosquitto | manual | auth e contrato |
| CAP-004 confirmação | ACK e timeout efêmeros no backend para teto/servos | ACK válido, inválido/desconhecido e timeout; regressão backend com 57 testes | persistência, bancada e expansão além de servos |
| CAP-005 voz | Gemini/OpenAI experimentais | inexistente | SPEC-002 |
| CAP-007 visão | script MediaPipe | manual | serviço e privacidade |
| CAP-008 setup único | Compose para broker/backend/frontend | três serviços saudáveis, smoke tests e persistência SQLite validados | publicação do R0.4 |
| CAP-009 autenticação | inexistente | inexistente | R0.8 |
| CAP-010 memória portátil | `MemoryService` + `ContextService` + `AIProvider` + `OpenAITextProvider` | 41 testes backend + auditoria técnica | chamada real autorizada e resposta no frontend |
