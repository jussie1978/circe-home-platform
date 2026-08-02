# Roadmap

Legenda:

- `[x]` concluído;
- `[~]` parcialmente concluído;
- `[ ]` pendente.

## R0.4 — Baseline reproduzível

- [x] corrigir codificação de dependências;
- [x] Compose para broker/backend/frontend — três serviços iniciados e
  comunicação validada em Docker;
- [x] `.env.example` e setup validados;
- [x] health checks e logs coerentes — três serviços `Healthy`, smoke tests
  aprovados e logs sem erros críticos;
- [x] CI básica para backend e frontend — jobs Backend e Frontend aprovados na
  execução CI #2 e integrados à `main` pelo PR #8, merge commit `7782609`, em
  29/07/2026.

**Marco R0.4 concluído e integrado à `main` pelo PR #10, merge commit
`fb2d4ef`.**

## R0.5 — Controle confiável

- [x] command IDs — UUID integrado aos cinco endpoints REST e validado por testes;
- [x] desired/reported state — `desired_state` incluído na resposta REST e
  `reported_state` reservado para confirmação física real;
- [~] ack e timeout — prova vertical do backend concluída para teto/servos:
  comando `pending` em `circe/alx/case/command/servos`, ACK correlacionado em
  `circe/alx/case/ack/{command_id}` e timeout determinístico para `failed`;
  registro ainda efêmero e ACK real do firmware ainda pendente;
- [x] auditoria do incremento de teto/servos — suíte focal com `19 passed`,
  regressão completa com `57 passed`, compilação e `git diff --check`
  aprovados; corrida entre REST, MQTT e timeout corrigida;
- [ ] catálogo de dispositivos.

Compatibilidade temporária mantida em `alx/case/servos/angle`. Fans, LEDs,
frontend, firmware e homing não foram alterados neste incremento. A R0.5 como
um todo permanece parcial, e o registro de comandos ainda é efêmero.

Prova vertical publicada no commit
`5b807aea0804f8fa1376ae003a2f50ecaa41998d`, no PR #14 ainda aberto como draft.

## R0.6 — Hardware completo

- [~] sensores e atuadores reais;
- [ ] fail-safe;
- [~] testes de bancada;
- [~] documentação elétrica atualizada.

## R0.7 — Voz plugável

- [~] OpenAI Realtime via WebRTC;
- [~] provedor abstrato — contrato e adaptador textual real validados; streaming
  permanece pendente;
- [ ] ferramenta de leitura;
- [ ] comandos controlados e métricas de custo/latência.

## R0.7.1 — Memória portátil do Core

- [x] contrato de repositório de memória;
- [x] contrato `ContextBuilder`;
- [x] modelo neutro e composição determinística de contexto;
- [x] integração entre recuperação de memória e `ContextBuilder`;
- [x] persistência de preferências explícitas;
- [x] recuperação entre sessões e reinício do backend;
- [x] exclusão de memória;
- [x] auditoria técnica do subsistema de memória;
- [x] teste de troca entre dois provedores simulados sem perda de continuidade;
- [x] API REST explícita de memória;
- [x] testes de domínio, persistência, reinício e integração da API.

Não inclui inferência automática de hábitos, memória emocional, RAG amplo ou agentes autônomos.

**Marco do Core concluído em 26/07/2026.**

## Provider Integration v0.1

- [x] adaptador real implementando `AIProvider`;
- [x] configuração somente por variáveis de ambiente do backend;
- [x] tratamento mínimo de configuração ausente e falha externa;
- [x] testes automatizados sem rede ou custo;
- [x] memória persistida recuperada após reabertura e incluída no payload;
- [x] resposta real influenciada pela memória, validada em uma única chamada
  autorizada ao `gpt-5-nano` em 26/07/2026.

**Incremento integrado à `main` pelo PR #6, merge commit `e4863d9`, em
26/07/2026.**

### Próximo marco

Concluir a revisão humana do PR draft #14 sem ampliar o escopo da prova vertical
de teto/servos. Depois da integração, implementar separadamente a emissão do
ACK oficial no firmware do teto/servos e validá-la em bancada. Fans, LEDs e
homing permanecem pendentes para incrementos posteriores.

## R0.8 — Segurança e operação

- [ ] autenticação;
- [ ] autorização por proprietário nas operações de memória;
- [ ] trilha imutável de criação, revisão e exclusão de memória;
- [ ] política de retenção, exportação e backup;
- [ ] MQTT protegido;
- [ ] segredos;
- [ ] backup e observabilidade.

## R1.0 — MVP residencial

Release candidata somente após execução contínua, recuperação de falhas e validação ponta a ponta.
