# Baseline de segurança

## Riscos atuais

- CORS aberto;
- MQTT anônimo e exposto à rede local;
- possível chave de provedor no `localStorage`;
- ausência de autenticação/autorização;
- comandos sem expiração, idempotência ou ack;
- logs e retenção ainda não formalizados.

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

## Regra

Enquanto esses controles não existirem, a CIRCE deve permanecer em laboratório/rede confiável e não ser exposta diretamente à internet.
