# Baseline de segurança

## Riscos atuais

- CORS aberto;
- MQTT anônimo e exposto à rede local;
- possível chave de provedor no `localStorage`;
- ausência de autenticação/autorização;
- comandos sem expiração, idempotência ou ack;
- logs e retenção ainda não formalizados.
- execução experimental de ferramentas de voz no frontend;
- ausência de política central de risco, aprovação e idempotência para tarefas
  propostas por IA;
- resposta simulada de presença sem marcação estruturada de simulação.

## Controles mínimos

- segredos apenas no backend/secret store;
- tokens efêmeros para browser;
- allowlist de origens;
- usuário/senha ou certificados MQTT;
- rede IoT segmentada;
- RBAC simples;
- confirmação para ações de maior impacto;
- trilha de auditoria;
- threat model antes de exposição externa.
- catálogo backend de capacidades com schema, versão e nível de risco;
- aprovação vinculada à capacidade e ao hash exato dos parâmetros;
- voz, texto e automações passando pelo mesmo `PolicyEngine`;
- resultados simulados marcados e impedidos de sustentar ações reais;
- segredos e executores ausentes do frontend.

## Regra

Enquanto esses controles não existirem, a CIRCE deve permanecer em laboratório/rede confiável e não ser exposta diretamente à internet.

Enquanto autenticação e autorização não existirem, orquestração fica limitada a
leitura local e geração de rascunhos. Comunicação externa, escrita persistente
autônoma e controles físicos propostos por IA permanecem bloqueados.
