# Backlog priorizado

## P0 — Bloqueadores

- [ ] converter `backend/requirements.txt` para UTF-8 e validar instalação;
- [ ] unificar porta do backend;
- [ ] criar Compose completo e health checks;
- [x] remover armazenamento de chave permanente do fluxo de voz padrão no navegador;
- [x] restringir CORS e sessão de voz às origens/clientes locais do MVP;
- [ ] proteger MQTT para o ambiente adequado;
- [ ] substituir a contenção local do endpoint de voz por autenticação e limites compartilhados antes de exposição em rede;
- [ ] implementar ack e timeout de comandos.

## P1 — Fundação

- [ ] schemas Pydantic versionados;
- [ ] persistir comandos e estados;
- [ ] CI com testes backend e build frontend;
- [ ] logs estruturados com correlation/command ID;
- [ ] catálogo de dispositivos e capacidades.

## P2 — Voz

- [x] criar contrato `VoiceProvider` e adaptar a integração Gemini existente;
- [x] SPEC do OpenAI Realtime;
- [x] endpoint backend de negociação SDP sem segredo no navegador;
- [x] prova WebRTC isolada no código, pendente validação manual em navegador;
- [ ] ferramenta somente leitura;
- [ ] controles físicos com confirmação;
- [ ] painel de custo e latência.

## P3 — Expansão

- [ ] sensores, fans e LEDs no firmware;
- [ ] visão como serviço;
- [ ] perfis, cenas e automações;
- [ ] PWA e instalação residencial.
