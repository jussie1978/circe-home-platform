# NOTA DE DECISÃO — Swim Lane Frontend R2.0 em Paralelo

**Data:** 07/06/2026
**Sprint:** 000 (em andamento)
**Decisor:** Jussie
**Tipo:** Decisão de processo — não requer ADR completo

---

## Decisão

A swim lane de frontend (Sprint R2.0) é aberta formalmente em paralelo
ao Sprint 000 e ao Sprint R1.0, com as seguintes condições.

---

## Justificativa

1. **Sem dependência técnica no momento** — o primeiro componente a ser
   implementado (OrbCanvas) não consome dados do backend, não requer
   firmware rodando, e não bloqueia nem é bloqueado por nenhuma tarefa
   do Sprint 000 ou R1.0.

2. **Economia de recursos** — o frontend é delegado ao Grok (xAI),
   preservando tokens Claude para tarefas de backend, firmware e
   arquitetura, onde o contexto acumulado do projeto é indispensável.

3. **Controle mantido** — toda entrega do Grok passa por revisão
   obrigatória com Claude antes de merge. O Tech Lead (Jussie + Claude)
   permanece como autoridade arquitetural.

4. **SDD não violado** — a SPEC-002 e a ADR-006 já estão aprovadas.
   O frontend tem spec, tem ADR, tem protótipo de referência. Não há
   código sendo escrito sem especificação.

---

## Condições e Restrições

| Condição | Detalhe |
|----------|---------|
| Componentes sem dados reais | Todos os componentes usam mock até o SystemStateProvider ser implementado |
| Integração real apenas em R2.0 | A conexão WebSocket real só ocorre após R1.0 concluído |
| Nenhuma decisão arquitetural sem Claude | Qualquer nova dependência ou padrão passa por revisão aqui antes |
| ADR-008 pendente | A decisão @react-three/fiber vs Three.js vanilla é tomada no início formal do Sprint R2.0 |
| Merge só após revisão | Checklist GROK-REVIEW-CHECKLIST.md aplicado a cada entrega |

---

## Componentes liberados para esta swim lane

Apenas componentes **sem dependência de dados reais** estão liberados
enquanto o R1.0 não estiver concluído:

- ✅ `OrbCanvas` — orbe 3D animado, sem dados
- ✅ `IrisCore` — overlay HTML central, sem dados
- ✅ `OrbWithIris` — composição dos dois acima
- ⏸ Demais componentes — aguardam SystemStateProvider (pós R1.0)

---

## Documentos de referência para o Grok

| Documento | Localização |
|-----------|------------|
| Briefing completo | `docs/grok/GROK-BRIEFING-FRONTEND.md` |
| Template de task | `docs/grok/GROK-TASK-TEMPLATE.md` |
| Checklist de revisão | `docs/grok/GROK-REVIEW-CHECKLIST.md` |
| Protótipo visual | `docs/design/iris-interface-viva-v7.html` |
| Spec de interface | `docs/SPEC-002-UI-UX.md` |
| ADR interface | `docs/ADR-006-interface-viva.md` |

---

**Assinado:** Jussie (Tech Lead)
**Data:** 07/06/2026
