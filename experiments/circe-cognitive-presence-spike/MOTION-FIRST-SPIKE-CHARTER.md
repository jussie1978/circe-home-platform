# CIRCE Cognitive Presence — Charter motion-first

**Status:** CLOSED — TECHNICAL NO-GO / VISUAL NO-GO

**Data:** 18/08/2026

**Local:** `experiments/circe-cognitive-presence-spike`

## Hipótese

Uma presença baseada primeiro em dinâmica — fluxo contínuo, atração,
contenção suave, atenção localizada e densidades distintas — pode comunicar a
identidade da Circe com mais clareza que uma forma geométrica escolhida antes do
movimento. Núcleo e campo devem permanecer reconhecíveis sem ancorar cada
partícula a uma posição-base rígida.

## Relação com o primeiro spike

O primeiro spike foi encerrado como **TECHNICAL GO / VISUAL NO-GO**. Ele
demonstrou a viabilidade de WebGPU, TSL e 32.768 partículas no hardware-alvo,
mas a evolução visual produziu esfera genérica, toro/aro e, depois, uma solução
ancorada estável porém pouco expressiva. Também deixou como aprendizado que o
relógio procedural precisa avançar dentro de cada substep.

Este segundo spike preserva apenas os aprendizados verificáveis. Não promove
nem copia automaticamente o código, os parâmetros ou a arquitetura visual
rejeitada.

## Abordagem motion-first

O Incremento 1 começa pela qualidade do idle e pela transformação de movimento
em listening. A silhueta emerge de um campo volumétrico assimétrico, com fluxo
procedural, atração central, circulação, contenção e matéria exploratória. Não
há mola individual para uma posição imutável. O tempo de simulação avança em
passos fixos dentro do loop de substeps, independentemente da taxa de render.

## Escopo

- aplicação Vite independente, sem React;
- TypeScript estrito, Three.js 0.184.0, Vite 8.2.0;
- `WebGPURenderer` e TSL diretamente;
- núcleo provisório perolado/âmbar, sem bloom;
- aproximadamente 32.768 partículas computadas na GPU;
- estados `idle` e `listening`;
- Pointer Events para resposta local por mouse ou toque;
- rede abstrata separada, com baixa densidade e conexões selecionadas;
- HUD discreto, fullscreen e `prefers-reduced-motion`;
- descarte explícito de renderer, buffers, materiais e listeners.

## Não escopo

- microfone, áudio, transcrição ou reação semântica;
- câmera ou rastreamento facial, ocular ou gestual;
- grafo real de conhecimento, rótulos ou clusters literais;
- backend, React, Circe Core ou frontend existente;
- bloom ou pós-processamento pesado;
- estados `pending`, `confirmed`, `failed` ou `timeout`;
- painel de parâmetros;
- qualquer comando ou integração física.

## Incrementos previstos

1. **Campo motion-first:** núcleo provisório, campo GPU, rede esparsa, idle,
   listening, ponteiro, HUD e acessibilidade.
2. **Correção visual única:** uma rodada orientada pela validação visual do
   proprietário, sem expansão funcional.
3. **Fechamento:** decisão GO/NO-GO e registro honesto das evidências e
   limitações, somente se autorizado após a avaliação visual.

## Orçamento

O orçamento autorizado é **uma implementação e uma rodada de correção visual**.
Mudanças adicionais exigem nova decisão explícita. A meta de desempenho é 60
FPS em 1080p na RTX 3060, a ser confirmada visualmente no hardware-alvo; build
local não constitui benchmark.

## Critérios objetivos de GO

- núcleo e campo são distinguíveis e a composição é deliberada parada;
- idle é vivo, calmo, assimétrico e legível;
- listening muda direção, densidade e conectividade sem depender de cor ou HUD;
- pointer deforma apenas uma região e o campo se recupera organicamente;
- não há formação dominante de esfera uniforme, toro, aro, túnel ou íris;
- o conjunto não lê como chuvisco, equalizador, screensaver ou demo WebGL;
- rede permanece esparsa e legível, sem all-pairs por frame;
- a presença continua legível sem bloom;
- WebGPU real, contagem e métricas são observáveis no HUD;
- alvo de 60 FPS em 1080p na RTX 3060 é observado no hardware-alvo;
- typecheck e build passam e o lifecycle não deixa listeners ou recursos ativos.

## Critérios objetivos de NO-GO

Qualquer falha persistente de identidade visual, distinção dos estados,
recomposição, legibilidade, WebGPU real ou desempenho-alvo após a rodada de
correção encerra o spike como NO-GO visual e/ou técnico conforme a evidência.

## Governança

Nenhum código deste experimento será promovido automaticamente. Nenhuma ADR,
SPEC ou documentação oficial será alterada antes de um GO revisado e aprovado.
O experimento não declara uma capacidade do CIRCE OS concluída.

O R0.5 físico continua bloqueado pela fonte normativa: ainda falta o ACK oficial
emitido pelo firmware e validado fisicamente em bancada. Este experimento não
altera prioridade, estado ou conclusão do R0.5.

## Resultado final

O segundo spike foi encerrado em 18/08/2026 como **TECHNICAL NO-GO / VISUAL
NO-GO**. A execução detectou WebGPU e apresentou 32.768 partículas, porém o
desempenho observado foi de aproximadamente 20 FPS / 50 ms, muito abaixo da
meta de 60 FPS. `npm run dev` não iniciou corretamente nesta máquina; a execução
direta de `vite.cmd` iniciou o servidor. Typecheck e build foram aprovados.

A avaliação visual concluiu que o idle ficou quase parado; o núcleo pareceu uma
esfera sólida provisória; o campo pareceu poeira ou campo estelar; a rede ficou
tênue e formada por linhas aleatórias; listening produziu uma cauda de cometa;
e a interação se limitou a deslocamentos em X/Y e a um feixe rígido. O resultado
ficou muito aquém do padrão necessário.

A rodada de correção visual não será utilizada. Corrigir o resultado exigiria
reimplementar núcleo, física, rede, interação e loop de renderização, deixando
de ser uma correção dentro do orçamento do charter.

A revisão final também encontrou dois achados P2: ausência de reinicialização
após restauração por back-forward cache e continuação possível da inicialização
assíncrona após `dispose`. Por decisão explícita de encerramento, ambos
permanecem sem correção.

Nenhum código será promovido, nenhuma ADR ou documentação oficial será alterada
e nenhuma capacidade de identidade visual é declarada concluída. O resultado
completo está registrado em `SPIKE-RESULT.md`.
