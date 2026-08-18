# CIRCE Cognitive Presence Spike — Resultado final

**Decisão:** CLOSED — TECHNICAL NO-GO / VISUAL NO-GO

**Encerrado em:** 18/08/2026

**Local:** `experiments/circe-cognitive-presence-spike`

**Branch:** `lab/interface-cognitive-presence-spike`

**Baseline:** `a1b7a21`

## Objetivo e hipótese

O segundo spike investigou se uma presença visual construída primeiro pela
dinâmica — fluxo contínuo, atração, contenção suave, atenção localizada e
densidades distintas — poderia expressar a Circe com mais identidade que uma
forma geométrica previamente definida. Núcleo e campo deveriam permanecer
reconhecíveis sem posição-base rígida por partícula.

O experimento foi isolado e descartável. Não teve autorização para alterar o
frontend oficial, backend, firmware, Circe Core ou controle físico.

## Arquitetura implementada

- aplicação Vite independente, sem React ou R3F;
- TypeScript estrito;
- Three.js 0.184.0 e Vite 8.2.0;
- `WebGPURenderer` e TSL diretamente;
- núcleo provisório composto por três volumes, sem bloom;
- 32.768 partículas atualizadas por compute GPU;
- distribuição inicial assimétrica em coortes próximas, circulantes e
  exploratórias;
- fluxo procedural, atração central, contenção suave e fixed-step de 1/60 s;
- rede abstrata separada com 128 nós e 88 conexões selecionadas sem all-pairs
  por frame;
- estados `idle` e `listening`;
- Pointer Events, HUD, fullscreen e `prefers-reduced-motion`;
- descarte explícito de materiais, geometrias, buffers, renderer e listeners,
  com limitações de lifecycle registradas na revisão final.

## Ambiente e execução observada

| Item | Evidência |
|---|---|
| Sistema | Microsoft Windows NT 10.0.26200.0 |
| Node.js | 24.14.1 |
| npm | 11.11.0 |
| Three.js | 0.184.0 |
| Vite | 8.2.0 |
| Backend gráfico | WebGPU detectado |
| Partículas | 32.768 |
| Rede | 128 nós / 88 conexões |
| Desempenho observado | aproximadamente 20 FPS / 50 ms |

`npm run dev` não iniciou corretamente nesta máquina. A execução direta de
`vite.cmd` iniciou o servidor e permitiu a avaliação visual. O desempenho é uma
observação do HUD durante essa execução, não um benchmark automatizado.

Typecheck e build de produção foram aprovados. A execução visual, entretanto,
não atingiu a meta técnica de 60 FPS.

## Avaliação visual do usuário

- o `idle` pareceu quase parado;
- o núcleo se assemelhou a uma esfera sólida provisória;
- o campo se assemelhou a poeira ou campo estelar;
- a rede ficou tênue e composta por linhas percebidas como aleatórias;
- o `listening` se assemelhou a uma cauda de cometa;
- a interação ficou limitada a deslocamentos em X/Y e a um feixe rígido;
- o resultado foi considerado muito aquém do padrão necessário.

Esses resultados não validam a intenção registrada em
`PRESENCE-VISUAL-BRIEF.md` e não concluem a identidade visual da Circe.

## Matriz de decisão

| Critério do charter | Resultado | Evidência ou conclusão |
|---|---|---|
| Núcleo e campo distinguíveis | PARCIAL | Eram distinguíveis, mas o núcleo leu como esfera sólida provisória e o campo como poeira |
| Composição deliberada parada | NO-GO | Idle quase parado e campo com leitura de campo estelar |
| Idle vivo, calmo, assimétrico e legível | NO-GO | Movimento insuficiente para comunicar atividade interna contínua |
| Listening distinto por direção, densidade e conectividade | NO-GO | Distinção principal percebida como cauda de cometa |
| Pointer local com recuperação orgânica | NO-GO | Interação limitada a X/Y e feixe rígido |
| Sem esfera uniforme, toro, aro, túnel ou íris dominante | GO COM RESSALVA | Não houve toro/aro dominante, mas o núcleo permaneceu esférico e provisório |
| Não parecer chuvisco, equalizador, screensaver ou demo WebGL | NO-GO | Campo percebido como poeira/campo estelar |
| Rede esparsa, legível e sem all-pairs por frame | PARCIAL | Implementação esparsa e sem all-pairs, mas visualmente tênue e aleatória |
| Legibilidade sem bloom | PARCIAL | Elementos eram visíveis, mas não atingiram a presença e hierarquia desejadas |
| WebGPU real e métricas observáveis no HUD | GO | WebGPU detectado; contagem, FPS e frame time exibidos |
| 60 FPS em 1080p no hardware-alvo | NO-GO | Aproximadamente 20 FPS / 50 ms observados |
| Typecheck e build aprovados | GO | Ambos concluídos com sucesso |
| Lifecycle sem listeners ou recursos ativos | NO-GO | Dois achados P2 permaneceram na revisão final |
| Resultado agregado | NO-GO | Falhas técnicas e visuais exigiriam reimplementação estrutural |

## Rodada de correção não utilizada

O orçamento previa uma implementação e uma rodada de correção visual. A rodada
não será utilizada porque os problemas não são ajustes locais de direção de
arte ou parâmetros. Seria necessário reimplementar núcleo, física, rede,
interação e loop de renderização. Isso constitui outra abordagem, não uma
correção compatível com o charter.

## Achados P2 da revisão final

### 1. Restauração por back-forward cache

O handler de `pagehide` descarta renderer, buffers e listeners mesmo quando o
navegador preserva a página no back-forward cache. Ao retornar pelo histórico,
a mesma instância do módulo pode ser restaurada já descartada, deixando o
experimento congelado.

### 2. Inicialização assíncrona após dispose

Se `dispose()` ocorrer enquanto `renderer.init()` ou o compute inicial estiver
pendente, a continuação assíncrona não verifica o estado descartado. Ela pode
alocar recursos ou instalar o animation loop depois do cleanup, deixando um
renderer sem descarte efetivo.

Por decisão explícita de encerramento, os dois achados permanecem sem correção.
O código não deve ser reutilizado como lifecycle de referência.

## Decisão e governança

O experimento está formalmente encerrado como **CLOSED — TECHNICAL NO-GO /
VISUAL NO-GO**. Nenhum código, dependência, configuração ou contrato visual será
promovido ao produto.

Não será criada ADR e não serão alterados SPEC, `PROJECT-STATUS`, changelog,
backlog, roadmap, rastreabilidade ou qualquer outra documentação oficial. O
brief visual permanece apenas como intenção conceitual aprovada, ainda não
validada por implementação.

O R0.5 físico continua bloqueado pela fonte normativa: ainda falta o ACK oficial
emitido pelo firmware e validado fisicamente em bancada. Este spike não altera
seu estado, prioridade ou conclusão.

## Aprendizado estratégico

A estratégia de fornecer uma especificação textual e gerar diretamente um
renderer não atingiu o padrão de direção de arte exigido para a presença da
Circe. A implementação satisfez parte da estrutura técnica, mas não converteu a
intenção em movimento, materialidade, hierarquia e interação com qualidade
suficiente.

## Próximo passo conceitual

Avaliar uma estratégia diferente de produção visual, com processo e ferramentas
adequados à direção de arte e à validação iterativa. Este encerramento não
autoriza nem inicia automaticamente um terceiro spike de partículas.
