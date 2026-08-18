# CIRCE Presence WebGPU Spike — Resultado final

**Decisão:** CLOSED — TECHNICAL GO / VISUAL NO-GO  
**Encerrado em:** 18/08/2026  
**Local:** `experiments/circe-presence-spike`  
**Branch:** `lab/interface-particle-presence-spike`  
**Baseline:** `a1b7a21`

## Objetivo e escopo

O experimento avaliou, de forma isolada, descartável e limitada, a viabilidade
de uma presença visual da Circe baseada em partículas computadas na GPU. O
vertical slice incluiu canvas em tela cheia, `WebGPURenderer`, TSL, 32.768
partículas, estados `idle` e `listening`, HUD de desempenho, fullscreen,
`prefers-reduced-motion` e descarte explícito de recursos.

Não fizeram parte do experimento núcleo volumétrico, bloom, refração, aberração
cromática, áudio, novos estados, integração React, comunicação com backend,
controles físicos ou alterações no produto existente.

## Referência técnica

A implementação foi orientada pelo exemplo oficial **Three.js WebGPU — Compute
Attractors Particles**:

`https://threejs.org/examples/webgpu_tsl_compute_attractors_particles.html`

Código-fonte correspondente à versão r184:

`https://github.com/mrdoob/three.js/blob/r184/examples/webgpu_tsl_compute_attractors_particles.html`

A organização dos buffers, o compute TSL e a simulação executada no renderer
foram adaptados para a dinâmica própria deste experimento. A atribuição ao
Three.js e à licença MIT permanece registrada no charter.

## Ambiente e métricas observadas

| Item | Resultado observado |
|---|---|
| Backend gráfico | WebGPU real no navegador-alvo |
| Partículas | 32.768 |
| Desempenho | 60 FPS |
| Frame time | 16,67 ms |
| Three.js | 0.184.0 |
| Vite | 8.2.0 |
| TypeScript | 5.9.3, modo estrito |
| Node.js na validação final | 22.15.0 |
| npm na validação final | 10.9.2 |

O modelo exato de GPU, o sistema operacional do hardware-alvo e a versão exata
do navegador não foram registrados pelo spike. As métricas acima correspondem
à observação manual informada no hardware-alvo; não constituem benchmark
automatizado ou comparativo entre dispositivos.

## Incrementos executados

### Incremento 1

Foi construída uma aplicação Vite independente com `WebGPURenderer` e TSL,
32.768 partículas computadas na GPU, fundo preto, estados `idle` e `listening`,
transição interpolada, HUD com backend/FPS/frame time, controles locais,
fullscreen, movimento reduzido e dispose explícito.

O vertical slice obteve go técnico. O `idle` foi considerado volumétrico, mas
genérico e com partículas inicialmente blocadas. O `listening` original recebeu
no-go visual por colapsar em aro branco saturado e quase bidimensional.

### Correção temporal

A revisão identificou que um timestep fixo executado uma vez por callback fazia
a velocidade da simulação depender da frequência do monitor e da carga de
renderização. A correção adotou um acumulador de tempo real com passo fixo de
1/60 s.

O delta aceito é limitado a quatro passos, ou aproximadamente 66,67 ms, e cada
frame executa no máximo quatro substeps. Backlog excedente é descartado para
evitar *spiral of death* após travamentos, troca de aba ou retomada da janela.
A correção passou por typecheck, build e uma revisão intermediária sem
findings.

A revisão de encerramento, porém, identificou uma limitação residual: o relógio
do alvo procedural é avançado uma vez por frame antes do loop de substeps. Em
frames com dois ou mais passos, todos os dispatches amostram o mesmo instante,
de modo que as trajetórias ainda podem variar conforme o agrupamento dos
substeps. Portanto, a independência completa da frequência de renderização não
foi comprovada para o movimento procedural.

### Incremento 1B

As partículas passaram a usar máscara circular e exposição reduzida, removendo
grande parte do aspecto quadrado e do branco estourado. O campo de `listening`
foi reformulado para buscar uma abertura tridimensional.

O resultado permaneceu em no-go: a formação continuou predominantemente
toroidal, com centro vazio e leitura de aro. O retorno ao `idle` também revelou
risco de deriva ou reconstrução incompleta.

### Incremento 1C

Cada partícula recebeu uma posição-base esférica imutável. Os alvos de `idle` e
`listening` passaram a ser calculados a partir dessa âncora e do estado
interpolado, com força elástica amortecida para retorno progressivo e sem
teletransporte.

A abordagem resolveu tecnicamente a deriva e tornou as transições reversíveis.
Entretanto, a ancoragem praticamente eliminou o movimento expressivo: `idle` e
`listening` ficaram pouco distintos, e a presença continuou sem a qualidade e a
identidade das referências.

## Matriz de decisão

| Critério | Resultado | Evidência ou conclusão |
|---|---|---|
| WebGPU real no navegador-alvo | GO | Backend exibido e observado como WebGPU |
| 32.768 partículas | GO | Contagem fixa da simulação e HUD |
| 60 FPS / 16,67 ms | GO | Observado no hardware-alvo |
| Integração física por fixed-step | GO COM RESSALVA | Acumulador de 1/60 s; revisão final encontrou relógio procedural ainda dependente do agrupamento dos substeps |
| Partículas sem aparência de blocos sólidos | GO | Máscara circular implementada e aprovada visualmente |
| Transições sem deriva acumulada | GO | Alvos ancorados em posições-base imutáveis |
| `idle` com identidade visual própria | NO-GO | Permaneceu nuvem ou esfera genérica de partículas |
| `listening` volumétrico e expressivo | NO-GO | Primeiro formou toro/aro; depois perdeu expressividade |
| Distinção clara entre estados | NO-GO | Estados finais ficaram visualmente pouco distintos |
| Fidelidade ao nível das referências | NO-GO | Resultado abaixo da qualidade visual pretendida |
| Continuação dentro do timebox | NO-GO | Novos ajustes violariam o limite de investimento |

O resultado agregado é **GO TÉCNICO / NO-GO VISUAL**.

O go técnico é a decisão de encerramento do experimento e preserva os resultados
observados no hardware-alvo. Ele não elimina os riscos residuais encontrados na
revisão final nem declara a simulação pronta para promoção ao produto.

## Aprendizados técnicos reutilizáveis

- `WebGPURenderer` e TSL sustentaram 32.768 partículas a 60 FPS no hardware-alvo.
- Métricas de FPS devem usar tempo real observado, não uma taxa presumida.
- Simulações por frame precisam de delta real ou acumulador fixed-step para não
  variar com a frequência do monitor.
- O relógio de qualquer alvo procedural também deve avançar dentro de cada
  substep; fixed-step apenas na integração não garante trajetórias idênticas.
- Limitar delta e substeps evita que pausas longas produzam backlog instável.
- Máscaras procedurais no sprite resolvem o aspecto quadrado sem textura ou
  pós-processamento adicional.
- Âncoras imutáveis por partícula eliminam deriva e tornam a reconstrução
  determinística, mas podem reduzir expressividade quando dominam o movimento.
- Uma abertura semelhante a íris não emerge apenas de força radial ou expansão
  lateral: esses campos tendem a formar toro, túnel ou parede circular.
- Métricas técnicas satisfatórias não substituem critérios explícitos de
  identidade, movimento e distinção de estados.

Esses aprendizados podem orientar pesquisas futuras, mas não autorizam a
reutilização automática desta implementação.

## Razões objetivas do no-go visual

1. `idle` não desenvolveu assinatura visual além de uma esfera genérica.
2. O `listening` inicial convergiu para toro ou aro com centro vazio.
3. A solução ancorada corrigiu deriva e reversibilidade, mas reduziu quase todo
   o movimento expressivo.
4. A diferença perceptiva entre `idle` e `listening` tornou-se insuficiente.
5. O conjunto não alcançou o nível das referências visuais adotadas.
6. Continuar ajustando parâmetros excederia o timebox e o investimento definido
   para o experimento.

## Decisão de encerramento e governança

O código permanece preservado como artefato experimental, mas não será
promovido ao frontend ou a qualquer outra parte do produto. Não há aprovação da
interface da Circe e nenhuma capacidade de produto é declarada concluída por
este resultado.

O R0.5 continua bloqueado pela fonte normativa: ainda falta ACK real emitido
pelo firmware e validado fisicamente em bancada. O spike não altera esse estado
e não representa conclusão total ou parcial do R0.5.

Por decisão explícita deste encerramento, não será criado ADR e não serão
atualizados SPEC, `PROJECT-STATUS`, changelog, backlog, roadmap, rastreabilidade
ou qualquer outra documentação oficial.

## Achados residuais da revisão final

- **P2 — relógio procedural fora dos substeps:** quando um frame executa mais
  de um substep, todos usam o mesmo valor de tempo procedural. Isso pode tornar
  a trajetória dependente da frequência ou da carga de renderização, apesar do
  acumulador fixed-step da integração.
- **P3 — cleanup após falha de inicialização:** se `renderer.init()` falhar,
  `setAnimationLoop(null)` e `renderer.dispose()` podem tentar inicializar o
  renderer novamente e gerar rejeições não tratadas no caminho de erro.

Os dois achados permanecem deliberadamente sem correção porque o experimento foi
encerrado e não estão autorizadas novas mudanças visuais ou funcionais. Eles
devem ser tratados como restrições caso qualquer aprendizado técnico seja
reavaliado futuramente.

## Hipótese futura, sem compromisso de execução

Uma pesquisa futura poderia ocorrer em um spike separado e *motion-first*,
baseado em dinâmica de atratores com campo de contenção. Essa hipótese deveria
começar com critérios de movimento e identidade antes do refinamento de forma,
sem reutilizar automaticamente o código, os parâmetros ou a arquitetura visual
desta implementação.
