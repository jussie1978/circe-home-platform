# Roadmap

Legenda:

- `[x]` concluído;
- `[~]` parcialmente concluído;
- `[ ]` pendente.

## R0.4 — Baseline reproduzível

- [x] corrigir codificação de dependências;
- [ ] Compose para broker/backend/frontend;
- [~] `.env.example` e setup validado;
- [~] health checks e logs coerentes;
- [x] CI básica para backend e frontend — jobs Backend e Frontend aprovados na
  execução CI #2 e integrados à `main` pelo PR #8, merge commit `7782609`, em
  29/07/2026.

## R0.5 — Controle confiável

- [ ] command IDs;
- [ ] desired/reported state;
- [ ] ack e timeout;
- [ ] auditoria;
- [ ] catálogo de dispositivos.

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

Completar o Compose para broker, backend e frontend e validar a inicialização da
stack por um único comando, sem expandir voz ou streaming.

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
