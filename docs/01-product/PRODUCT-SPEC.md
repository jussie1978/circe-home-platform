# Especificação de produto

## Personas primárias

- proprietário/operador da residência;
- mantenedor técnico;
- desenvolvedor de novos módulos.

## Capacidades

| ID | Capacidade | Estado |
|---|---|---|
| CAP-001 | visualizar telemetria em tempo real | parcial |
| CAP-002 | controlar fans, LEDs e aletas | parcial |
| CAP-003 | operar dispositivos via MQTT | parcial |
| CAP-004 | confirmar estado físico | ausente |
| CAP-005 | conversar por voz com interrupção | experimental |
| CAP-006 | executar ferramentas com autorização | experimental |
| CAP-007 | rastrear presença/rosto localmente | protótipo |
| CAP-008 | instalar stack por comando único | ausente |
| CAP-009 | autenticar operadores | ausente |
| CAP-010 | preservar memória ao trocar o provedor de IA | parcial |

## Requisitos transversais

- ações físicas críticas exigem validação e trilha de auditoria;
- falha da IA não pode impedir controles locais básicos;
- provedores externos devem ser substituíveis;
- toda integração deve possuir health check e timeout;
- dados sensíveis devem ter retenção explícita.
