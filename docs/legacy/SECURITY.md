# CIRCE Home Platform — Segurança e Privacidade

## Classificação atual

**Ambiente de laboratório/PoC. Não expor diretamente à internet.**

## Riscos prioritários

| Risco | Evidência | Severidade | Controle recomendado |
|---|---|---:|---|
| MQTT aberto na LAN | `allow_anonymous true`, listener global | alta | autenticação, ACL e perfil dev/prod |
| CORS irrestrito | `allow_origins=["*"]` | alta | allowlist configurável |
| chave de IA no navegador | `localStorage`/env Vite | alta | token efêmero mediado pelo backend |
| comandos sem autenticação | endpoints REST/WS públicos | alta | sessão local, token e autorização |
| credenciais Wi-Fi no firmware | constantes no código | alta | provisioning/NVS e `.gitignore` |
| sem confirmação física | estado otimista no backend | média-alta | ack, timeout e reported state |
| sem rate limit | API e WS | média | limite por cliente/comando |
| dados de câmera/voz | ausência de política formal | média | consentimento, retenção mínima e indicadores |

## Limites de confiança

A IA conversacional nunca deve executar diretamente ações perigosas. O backend deve validar:

- capability permitida;
- faixa de valor;
- estado do dispositivo;
- necessidade de confirmação humana;
- origem e identidade da sessão.

## Perfil de segurança mínimo para R1.0

- aplicação restrita à LAN por padrão;
- autenticação local;
- TLS no proxy local quando houver credenciais;
- MQTT com usuário por dispositivo e ACL;
- segredos apenas no backend/secret store;
- logs de comando sem áudio bruto;
- botão/controle manual de emergência;
- failsafe local no ESP32;
- atualização de dependências automatizada.

## Privacidade de voz e visão

- câmera e microfone devem ter indicadores claros de atividade;
- processamento local deve ser preferido quando atende ao caso;
- transmissão à nuvem deve ser explícita e configurável;
- nenhum reconhecimento de identidade facial deve ser inferido do atual face tracking;
- gravação de áudio/vídeo deve permanecer desativada por padrão.
