# CIRCE — Template de Prompt de Tarefa para o Grok
**Uso:** Preencha este template e cole no início de cada sessão com o Grok.

---

## COMO USAR ESTE TEMPLATE

1. Escolha o componente a implementar (ver §CATÁLOGO abaixo)
2. Preencha as seções marcadas com `[ ]`
3. Anexe os arquivos de referência obrigatórios
4. Cole no Grok

---

## ─────────────────────────────────────────
## PROMPT DE TAREFA — COPIE A PARTIR DAQUI
## ─────────────────────────────────────────

```
# CIRCE Home Platform — Tarefa de Frontend

## Contexto do projeto
Você é o executante de frontend do CIRCE Home Platform.
Leia o arquivo GROK-BRIEFING-FRONTEND.md antes de qualquer coisa.
Não tome decisões arquiteturais — implemente exatamente o especificado.

## Arquivos de referência desta sessão
- GROK-BRIEFING-FRONTEND.md      ← regras gerais e contratos (obrigatório)
- iris-interface-viva-v7.html    ← referência visual (abrir no browser)
- [ SPEC-002-UI-UX.md ]          ← incluir se a tarefa envolver comportamento novo

## Tarefa desta sessão

**Componente:** [ NOME DO COMPONENTE ]
**Prioridade:** [ Alta / Média / Baixa ]
**Faz parte de:** Sprint R2.0

### O que implementar

[ Descreva aqui em 3–5 linhas o que o componente deve fazer.
  Seja objetivo: comportamento, dados que consome, ações que dispara. ]

### Especificação detalhada

[ Cole aqui o trecho relevante da SPEC-002 ou descreva os requisitos
  específicos desta tarefa. Exemplos:
  - Comportamento visual esperado
  - Props necessárias
  - Integração com WebSocket ou REST
  - Estados a tratar ]

### Dados / contrato

[ Se o componente consome dados, especifique quais campos do SystemState
  ou qual endpoint REST ele usa. Exemplo:

  WebSocket: temperature, humidity, tempHistory[]
  REST: GET /api/v1/sensors/temperature
]

### Restrições específicas desta tarefa

[ Adicione aqui qualquer restrição além das gerais do briefing. Exemplo:
  - Não usar animações de entrada (o orbe já está animado ao fundo)
  - O mock deve simular variação de temperatura entre 40–80°C
  - O componente deve funcionar sem o backend rodando (mock obrigatório) ]

### O que NÃO implementar nesta sessão

[ Liste explicitamente o que está fora do escopo desta tarefa, mesmo que
  pareça relacionado. Isso evita que o Grok "adivinho" features. Exemplo:
  - Não implementar o gráfico histórico (próxima sessão)
  - Não conectar ao WebSocket real (mock por enquanto)
  - Não criar o sistema de estado global (aguardando ADR-008 ] ]

### Formato de entrega esperado

Ao finalizar, entregue:
1. Arquivo(s) do componente (.tsx ou .jsx)
2. Arquivo de estilo se aplicável (.module.css)
3. Relatório no seguinte formato:

COMPONENTE: [nome]
ARQUIVOS: [lista]
DEPENDÊNCIAS NOVAS: nenhuma / [lista com justificativa]
DESVIOS DA SPEC: nenhum / [descrever]
MOCK INCLUÍDO: sim / não
OBSERVAÇÕES: [qualquer coisa relevante para revisão]
```

---

## CATÁLOGO DE COMPONENTES (R2.0)

Use como referência ao escolher a tarefa. Ordem sugerida de implementação:

| # | Componente | Descrição | Dependências |
|---|-----------|-----------|-------------|
| 1 | `OrbCanvas` | Canvas Three.js com o orbe 3D animado, sem dados reais | Nenhuma |
| 2 | `IrisCore` | Overlay HTML central (pupila + anéis CSS) | Nenhuma |
| 3 | `OrbWithIris` | Composição: OrbCanvas + IrisCore integrados | OrbCanvas, IrisCore |
| 4 | `StatusBar` | Barra inferior com dot, texto de estado e temperatura | SystemState parcial |
| 5 | `CardSensores` | Card superior esquerdo — temperatura, umidade, histórico | WebSocket + REST |
| 6 | `CardVentilacao` | Card superior direito — fans RPM, slider, modos | WebSocket + REST |
| 7 | `CardAletas` | Card inferior esquerdo — estado fins, botões open/close | WebSocket + REST |
| 8 | `CardIluminacao` | Card inferior direito — swatches de cor, modos | REST |
| 9 | `SystemStateProvider` | Context/Zustand: WebSocket consumer + estado global | Todos os cards |
| 10 | `Dashboard` | Composição final — todos os componentes integrados | Todos |

**Ordem recomendada:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

Cada componente deve ser revisado e aprovado antes de avançar para o próximo.

---

## EXEMPLOS DE PROMPTS PREENCHIDOS

### Exemplo 1 — OrbCanvas (primeiro componente)

```
## Tarefa desta sessão

**Componente:** OrbCanvas
**Prioridade:** Alta
**Faz parte de:** Sprint R2.0

### O que implementar
Componente React que renderiza o orbe 3D animado usando Three.js r128.
Deve ocupar 100% da viewport (fullscreen), ter fundo #02020a, e animar
continuamente sem depender de dados externos.

### Especificação detalhada
Ver SPEC-002 §2.1 e §2.2 (camadas do orbe) e §4.1 (rotação).
- Câmera em Z=6.2, FOV 55°
- 700 barras altas + 600 médias + 800 curtas + 1800 linhas de fuga
- Anel principal (raio 2.0u, esp. 0.018u) + anel glow (esp. 0.055u)
- Halo central (raio 1.81u) para garantir buraco limpo
- 600 partículas de fundo
- Rotação em Z + balanço em Y (Math.sin)

### Dados / contrato
Nenhum — este componente não consome dados externos.
A velocidade de rotação deve ser recebida como prop:
  rotSpeed: number  // default: 0.028

### O que NÃO implementar nesta sessão
- Spring physics (próxima sessão)
- Mudança de cor por temperatura (depois do SystemStateProvider)
- IrisCore overlay (componente separado)
```

### Exemplo 2 — CardSensores

```
## Tarefa desta sessão

**Componente:** CardSensores
**Prioridade:** Alta

### O que implementar
Card de sensores posicionado no quadrante superior esquerdo da tela.
Trigger: botão 40×40px. Card expandido mostra temperatura atual,
umidade atual e gráfico histórico de 24h.

### Especificação detalhada
Ver SPEC-002 §6.1.
- Temperatura: Space Mono 700 21px, cor termal (função thermalColor(temp))
- Umidade: Space Mono 700 21px, cor --teal
- Histórico: 24 barras verticais, cada uma com cor termal do valor
- Threshold visual: linha em 65°C e 75°C no gráfico

### Dados / contrato
WebSocket: { temperature, humidity, tempHistory[] }
REST: GET /api/v1/sensors/temperature (carregamento inicial)

Mock obrigatório:
const MOCK = { temperature: 42.3, humidity: 68.1, tempHistory: [38,40,42,...] }

### O que NÃO implementar nesta sessão
- Integração real com WebSocket (usar mock)
- Threshold configurável pelo usuário
```

---

*Template mantido por: Tech Lead (Jussie + Claude) — v1.0 — 07/06/2026*
