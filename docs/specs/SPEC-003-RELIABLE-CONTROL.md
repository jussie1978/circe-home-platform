# SPEC-003 — Controle confiável

**Status:** Draft

## Incremento R0.5 — teto/servos

Esta prova vertical restringe o contrato confiável a
`POST /api/v1/controls/servos`. A identificação existente `alx/case` é mapeada
sem criar outro padrão para `site=alx`, `device=case` e `capability=servos`.

- comando: `circe/alx/case/command/servos`;
- ACK: `circe/alx/case/ack/{command_id}`;
- ator da rota REST: `user`;
- envelope: `command_id`, `requested_at`, `actor`, `value` e `expires_at`;
- ACK válido: JSON com o mesmo `command_id` do tópico e
  `reported_state` idêntico ao estado solicitado;
- ciclo mínimo: `pending` para `acknowledged` após ACK válido, ou `failed`
  quando `expires_at` for alcançado;
- estado físico confirmado só muda após ACK válido;
- registro de comandos é efêmero neste incremento;
- `alx/case/servos/angle` continua recebendo o valor escalar temporariamente
  para compatibilidade com o firmware atual.

Fans, LEDs, frontend, firmware, homing, persistência do histórico e
idempotência ficam fora deste incremento.

## Fluxo

Usuário solicita → backend valida e registra → MQTT publica → dispositivo executa → dispositivo envia ack/report → backend reconcilia → frontend confirma.

## Critérios de aceite

- todo comando tem UUID e expiração;
- duplicatas são idempotentes;
- timeout visível;
- nenhum ack significa estado confirmado;
- histórico registra ator, parâmetros, resultado e duração;
- testes cobrem sucesso, falha, duplicata e dispositivo offline.
