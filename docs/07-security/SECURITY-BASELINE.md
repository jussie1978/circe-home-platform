# Baseline de segurança

## Riscos atuais

- ausência de autenticação/autorização de usuário;
- MQTT anônimo e exposto à rede local;
- adaptador Gemini legado ainda aceita credencial quando integrado explicitamente, embora o fluxo padrão não armazene chaves no navegador;
- comandos sem expiração, idempotência ou ack;
- logs e retenção ainda não formalizados.

## Proteção temporária da voz no MVP local

O endpoint faturável `POST /api/v1/voice/session` aceita somente clientes loopback e as origens locais explícitas `http://127.0.0.1:3000` e `http://localhost:3000`. A criação de sessões também é limitada, em memória, a três tentativas por cliente a cada 60 segundos. O frontend não recebe token, segredo ou `OPENAI_API_KEY`.

Essas barreiras servem apenas para execução local em uma única máquina. Elas não autenticam usuários, não são adequadas para múltiplas instâncias e não tornam seguro expor o backend na LAN ou na Internet. Antes de qualquer exposição de rede, devem ser substituídas por autenticação e autorização de usuário, rate limit compartilhado e limites de sessão/custo.

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

Enquanto esses controles não existirem, a CIRCE deve permanecer em execução local confiável e não ser exposta na LAN ou diretamente à Internet.
