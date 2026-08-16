# Matriz de rastreabilidade

## Requisitos mestres

| Requisito mestre | Implementação/evidência atual | Lacuna/release |
|---|---|---|
| INV-02 operação manual sem IA | REST/WS + frontend | validar modo degradado em R1.0 |
| INV-03 publicação não é execução | `command_id`, `desired_state` e prova vertical ACK/timeout no backend | ACK oficial do firmware, persistência e reconciliação no R0.5 |
| INV-06 provedor substituível | `AIProvider`, `ContextService` e adaptador textual | voz e seleção dinâmica posteriores |
| INV-07 memória controlada | domínio, persistência e CRUD | proprietário, auditoria, retenção e backup no R0.8 |
| INV-08 consentimento contextual | não consolidado | antes de presença identificada, saúde ou localização |
| R1.0 piloto residencial | não validado | após R0.5–R0.8 e bancada física |

## Capacidades legadas

| Capacidade | Implementação atual | Teste | Próxima lacuna |
|---|---|---|---|
| CAP-001 telemetria | backend + frontend | parcial | contrato e reconexão |
| CAP-002 controles | REST/WS + MQTT; teto/servos com comando oficial e compatibilidade escalar temporária | parcial; suíte focal com 19 testes | ACK real do firmware e demais controles |
| CAP-003 barramento | Paho + Mosquitto | manual | auth e contrato |
| CAP-004 confirmação | ACK e timeout efêmeros no backend para teto/servos | ACK válido, inválido/desconhecido e timeout; regressão backend com 57 testes | persistência, bancada e expansão além de servos |
| CAP-005 voz | Gemini/OpenAI experimentais | inexistente | SPEC-002 |
| CAP-007 visão | script MediaPipe | manual | serviço e privacidade |
| CAP-008 setup único | Compose para broker/backend/frontend | três serviços saudáveis, smoke tests e persistência SQLite validados | instalação e recuperação no hub residencial do R1.0 |
| CAP-009 autenticação | inexistente | inexistente | R0.8 |
| CAP-010 memória portátil | `MemoryService` + `ContextService` + `AIProvider` + `OpenAITextProvider` | testes automatizados, auditoria técnica e chamada real autorizada | integração controlada com interface, autorização e backup |
| CAP-011 orquestração governada | ADR-0006 e SPEC-007 | auditoria de viabilidade; implementação ausente | runtime, política, persistência e testes |
| CAP-012 briefing rastreável | SPEC-007 | implementação ausente | briefing sob demanda com fontes e quality gate |
| CAP-013 aprovação por risco | ADR-0006 e SPEC-007 | implementação ausente | autenticação, política e aprovação vinculada aos parâmetros |
