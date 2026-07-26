# Backlog priorizado

## P0 — Bloqueadores

- [ ] converter `backend/requirements.txt` para UTF-8 e validar instalação;
- [ ] unificar porta do backend;
- [ ] criar Compose completo e health checks;
- [ ] remover armazenamento de chave permanente no navegador;
- [ ] restringir CORS e MQTT para ambiente adequado;
- [ ] implementar ack e timeout de comandos.

## P1 — Fundação

- [x] integrar `MemoryService` e `ContextBuilder` no `ContextService` v0.1;
- [ ] definir contrato neutro de provedor que consome `ModelContext`;
- [ ] validar troca entre dois adaptadores sem perda de continuidade;
- [ ] schemas Pydantic versionados;
- [ ] persistir comandos e estados;
- [ ] CI com testes backend e build frontend;
- [ ] logs estruturados com correlation/command ID;
- [ ] catálogo de dispositivos e capacidades.

## P2 — Voz

- [ ] SPEC do OpenAI Realtime;
- [ ] endpoint de segredo efêmero;
- [ ] prova WebRTC isolada;
- [ ] ferramenta somente leitura;
- [ ] controles físicos com confirmação;
- [ ] painel de custo e latência.

## P3 — Expansão

- [ ] sensores, fans e LEDs no firmware;
- [ ] visão como serviço;
- [ ] perfis, cenas e automações;
- [ ] PWA e instalação residencial.
