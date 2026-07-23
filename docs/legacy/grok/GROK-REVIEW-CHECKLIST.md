# CIRCE — Checklist de Revisão de Entregas do Grok
**Uso:** Cole este checklist aqui no Claude junto com o código entregue pelo Grok.

---

## Como usar

1. Grok entrega um componente
2. Você abre esta sessão com Claude e diz:
   > "Revisão de entrega do Grok — [nome do componente]"
3. Cola o código
4. Claude percorre o checklist e reporta aprovado / ajuste necessário / bloqueio

---

## Checklist de Revisão

### 🏗️ Arquitetura

- [ ] Usa apenas bibliotecas da stack aprovada (React, Three.js r128, Framer Motion, Zustand/Context)
- [ ] Não adicionou dependências novas sem justificativa
- [ ] Não usa `localStorage` ou `sessionStorage`
- [ ] Não usa Socket.io (deve usar WebSocket nativo)
- [ ] Não usa `axios` (deve usar `fetch`)
- [ ] Não criou arquivos de backend

### 🎨 Visual

- [ ] Paleta de cores respeitada (ver §5 do briefing)
- [ ] Fundo usa `--void: #02020a`
- [ ] Fontes corretas: Rajdhani (labels) + Space Mono (números)
- [ ] Letter-spacing conforme spec
- [ ] Orbe usa dimensões corretas (raio anel 2.0u, câmera Z=6.2, FOV 55°)

### ⚙️ Comportamento

- [ ] Spring physics com amortecimento 0.84 e spring 0.05
- [ ] Raios de influência corretos (tall: 2.2u, med/short: 1.5u)
- [ ] Rotação principal em Z, balanço em Y com Math.sin
- [ ] Rebuild de cores a cada 1s quando temperatura muda > 5°C
- [ ] Estado IRIS reflete corretamente no visual (idle/ouvindo/falando)

### 🔌 Integração

- [ ] Contrato do WebSocket respeitado (interface SystemState exata)
- [ ] Endpoints REST corretos (URLs e payloads conforme §6.2)
- [ ] Mock incluído para teste standalone
- [ ] Nenhum dado hardcoded que deveria vir do WebSocket

### 📦 Entrega

- [ ] Componente tem props tipadas (TypeScript)
- [ ] Nenhuma feature fora do escopo da tarefa implementada
- [ ] Protótipo `iris-interface-viva-v7.html` não foi modificado
- [ ] Grok reportou desvios da spec (ou confirmou que não há)

---

## Resultado da revisão

Ao final, Claude emite um dos três resultados:

### ✅ APROVADO
Pode fazer merge. Nenhum item crítico pendente.

### ⚠️ APROVADO COM AJUSTES
Merge pode ser feito mas os itens abaixo precisam de correção
na próxima sessão (não bloqueiam integração):
- [lista de itens]

### 🔴 BLOQUEADO
Não fazer merge. Os seguintes problemas precisam ser corrigidos
antes de integrar:
- [lista de itens com descrição do problema]

---

## Template de prompt para iniciar revisão

```
Revisão de entrega do Grok — [NOME DO COMPONENTE]

Checklist de revisão: [cole o checklist acima ou referencie este arquivo]

Código entregue:
[cole o código aqui]

Relatório do Grok:
COMPONENTE: ...
ARQUIVOS: ...
DEPENDÊNCIAS NOVAS: ...
DESVIOS DA SPEC: ...
MOCK INCLUÍDO: ...
```

---

*Mantido por: Tech Lead (Jussie + Claude) — v1.0 — 07/06/2026*
