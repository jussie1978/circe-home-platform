# CIRCE Home Platform — Backlog Priorizado

## P0 — Bloqueadores

- [ ] Converter `backend/requirements.txt` de UTF-16LE para UTF-8.
  - Aceite: `pip install -r requirements.txt` funciona em Linux e Windows.
- [ ] Definir a porta canônica do backend.
  - Aceite: código, scripts, README, frontend e Docker usam a mesma configuração.
- [ ] Criar ambiente reproduzível.
  - Aceite: setup em máquina limpa termina sem edição manual.
- [ ] Adicionar CI.
  - Aceite: pytest e `npm ci && npm run build` executam em cada mudança.
- [ ] Corrigir gestão de segredos da voz.
  - Aceite: chave permanente não fica no bundle nem em `localStorage`.
- [ ] Fechar MQTT anônimo fora de perfil `dev`.
  - Aceite: perfil produção exige usuário/senha e ACL.

## P1 — Confiabilidade do núcleo

- [ ] Implementar shutdown do MQTT no FastAPI.
- [ ] Externalizar host/porta MQTT, banco e CORS por configuração.
- [ ] Criar `CommandLog` e acknowledgements de dispositivo.
- [ ] Separar estado desejado e relatado.
- [ ] Validar formato hexadecimal de cor.
- [ ] Retornar HTTP 422/400 para controles fora do intervalo, em vez de 200 com erro no corpo.
- [ ] Proteger remoção de WebSocket desconectado com `discard`.
- [ ] Evitar gravação separada de temperatura e umidade como linhas incompletas quando chegam quase juntas.
- [ ] Adicionar índices/limites e política de retenção de telemetria.

## P1 — Testes

- [ ] Mockar MQTT nos testes para não depender de broker.
- [ ] Testar valores inválidos e limites.
- [ ] Testar reconexão WebSocket.
- [ ] Testar parsing MQTT inválido.
- [ ] Testar persistência e histórico.
- [ ] Criar testes do store e serviços de voz.
- [ ] Criar smoke test do firmware com PlatformIO.

## P2 — Frontend

- [ ] Extrair URL da API/WS para configuração.
- [ ] Dividir `App.tsx` em containers e hooks menores.
- [ ] Definir contrato tipado compartilhado para o estado WebSocket.
- [ ] Integrar o painel modular sem duplicar controles existentes.
- [ ] Criar tela de diagnóstico de conexão.
- [ ] Implementar acessibilidade por teclado e redução de movimento.
- [ ] Medir custo do OrbCanvas em GPUs integradas e tablets.

## P2 — Firmware

- [ ] Remover credenciais Wi-Fi do código-fonte e usar provisioning/config local.
- [ ] Implementar watchdog e estado seguro.
- [ ] Publicar disponibilidade LWT.
- [ ] Publicar posição/estado confirmado.
- [ ] Documentar calibração dos fins de curso.
- [ ] Adicionar testes elétricos antes de fans, relés e LEDs.

## P3 — Produto

- [ ] Reconciliar SPEC-001 com o que existe no firmware.
- [ ] Criar SPEC-002 de UI/UX ou remover referências antigas.
- [ ] Especificar privacidade da voz e visão.
- [ ] Definir métricas de sucesso do MVP.
- [ ] Validar a proposta de produto com protótipos e usuários antes de hardware comercial.
