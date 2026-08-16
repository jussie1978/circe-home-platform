# Plano mestre

> A visão e os limites canônicos do produto estão em
> [SPEC-MASTER.md](SPEC-MASTER.md). Este plano detalha a execução e não pode
> ampliar silenciosamente o escopo aprovado.

O CIRCE OS é uma plataforma local-first e híbrida de Home Companion que
unifica interação natural, memória controlada, percepção ambiental, automação
e dispositivos físicos sob políticas e controle confiável.

## Horizonte 1 — Fundação confiável

Tornar instalação, execução, testes e diagnóstico reproduzíveis. Consolidar contratos de API/MQTT e separar estado desejado do confirmado.

## Horizonte 2 — Controle físico completo

Integrar sensores, fans PWM, LEDs e mecanismos com acknowledgements, modo seguro e operação manual independente da IA.

## Horizonte 3 — Presença inteligente

Adicionar voz plugável, wake word opcional, ferramentas seguras, memória
controlada e visão computacional com consentimento. Introduzir orquestração
governada, começando por capacidades de leitura, briefing sob demanda e
aprovação humana.

## Horizonte 4 — Plataforma residencial

Expandir catálogo de dispositivos, automações, perfis, cenas, regras e implantação dedicada em hardware local.

## Métricas de sucesso

- tempo de setup em máquina limpa;
- taxa de comandos com ack confirmado;
- latência p95 de telemetria e comando;
- disponibilidade local sem voz em nuvem;
- cobertura dos fluxos críticos;
- custo por hora de conversação;
- incidentes de segurança ou segredos expostos.
- percentual de tarefas com fonte e resultado verificáveis;
- taxa de tarefas bloqueadas corretamente pela política;
- taxa de duplicidade evitada por idempotência;
- custo e latência por tarefa concluída, não por personagem/agente.
