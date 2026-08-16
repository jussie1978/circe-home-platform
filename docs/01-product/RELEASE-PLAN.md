# Plano de releases

| Release | Objetivo | Saída verificável |
|---|---|---|
| R0.4 | baseline reproduzível | setup único, health checks, testes básicos e docs coerentes |
| R0.5 | estado confiável | desired/reported state, ack, auditoria de comandos |
| R0.6 | hardware completo | sensores, PWM fans, LEDs e fail-safe validados |
| R0.7 | voz plugável | OpenAI Realtime funcional e provedor abstrato |
| R0.7.2 | orquestração governada | tarefas de leitura, briefing sob demanda, aprovação e auditoria persistente |
| R0.8 | segurança local | auth, MQTT protegido, segredos e perfis |
| R1.0 | MVP residencial | uma casa piloto instala, opera e recupera o CIRCE OS; controla bancada física com confirmação; usa texto e voz com memória controlada; mantém funções essenciais em modo degradado; inspeciona saúde, custos e falhas; restaura dados por processo documentado |

Datas devem ser definidas após estimativa do backlog, não por desejo. Releases são orientadas por critérios, não por calendário arbitrário.

R1.0 não é release comercial multi-tenant. A passagem para produto instalável
por terceiros depende de evidência de uso residencial real e decisão posterior.
