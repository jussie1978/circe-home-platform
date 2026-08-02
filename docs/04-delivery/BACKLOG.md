# Backlog priorizado

## P0 — Bloqueadores

- [ ] converter `backend/requirements.txt` para UTF-8 e validar instalação;
- [ ] unificar porta do backend;
- [x] criar Compose completo e health checks — execução local, smoke tests e
  persistência validados;
- [ ] remover armazenamento de chave permanente no navegador;
- [ ] restringir CORS e MQTT para ambiente adequado;
- [~] implementar ack e timeout de comandos — prova vertical concluída no
  backend para teto/servos; persistência, ACK real do firmware e demais
  controles físicos permanecem pendentes.
- [ ] autenticar e autorizar operações de memória antes de exposição externa;

## P1 — Fundação

- [x] integrar `MemoryService` e `ContextBuilder` no `ContextService` v0.1;
- [x] definir contrato neutro de provedor que consome `ModelContext`;
- [x] validar troca entre dois adaptadores sem perda de continuidade;
- [ ] implementar adaptador real de texto atrás do contrato neutro;
- [ ] implementar trilha imutável de criação, revisão e exclusão de memória;
- [ ] formalizar proveniência, retenção, exportação e backup da memória;
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
