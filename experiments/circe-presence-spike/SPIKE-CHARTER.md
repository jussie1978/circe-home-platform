# CIRCE Presence WebGPU Spike — Charter do Incremento 1

**Status:** CLOSED — TECHNICAL GO / VISUAL NO-GO

**Data:** 17/08/2026

**Encerrado em:** 18/08/2026

**Local:** `experiments/circe-presence-spike`

## Finalidade

Este spike é uma pesquisa visual isolada, descartável e sem vínculo automático
com o frontend oficial do CIRCE OS. Seu único objetivo neste incremento é
verificar um vertical slice mínimo de partículas computadas na GPU com
`WebGPURenderer` e TSL.

## Limites de governança

- O fechamento físico do R0.5 continua bloqueado pela fonte normativa do
  projeto e preserva sua prioridade.
- Nenhum resultado deste spike representa conclusão total ou parcial do R0.5.
- Nenhum código, contrato visual ou dependência deste diretório será promovido
  automaticamente ao produto.
- ADR, SPEC e alterações na documentação oficial somente serão considerados
  depois de um resultado `go` revisado e explicitamente aprovado.
- O spike não acessa backend, MQTT, firmware, controles físicos, segredos ou
  dados reais.

## Prazo e escopo

O timebox é um único ciclo de implementação e revisão do Incremento 1,
encerrado com a entrega do vertical slice mínimo. Qualquer continuação exige
nova autorização.

O escopo autorizado contém somente:

- aplicação Vite independente e tela cheia;
- detecção e exibição do backend gráfico usado pelo renderer;
- 32.768 partículas, um atrator central e fundo preto;
- estados visuais `idle` e `listening`, com transição interpolada;
- HUD de backend, FPS, frame time, partículas e estado;
- controles locais de estado e fullscreen;
- suporte básico a `prefers-reduced-motion`;
- descarte explícito de renderer, recursos e listeners.

Núcleo volumétrico, pós-processamento, áudio, estados de comando, novos perfis,
React, integração com backend e qualquer controle físico estão fora do escopo.

## Referência e atribuição

A organização dos buffers de posição/velocidade, o uso de `instancedArray` e o
compute TSL foram orientados pelo exemplo oficial **Three.js WebGPU — Compute
Attractors Particles**:

`https://threejs.org/examples/webgpu_tsl_compute_attractors_particles.html`

Código-fonte de referência, versão r184:

`https://github.com/mrdoob/three.js/blob/r184/examples/webgpu_tsl_compute_attractors_particles.html`

Three.js é distribuído sob a licença MIT. Este spike implementa uma cena e uma
dinâmica próprias, mantendo a referência técnica explícita.

## Resultado do Incremento 1

O Incremento 1 recebeu `go` técnico após execução no hardware-alvo com backend
WebGPU real, 32.768 partículas, 60 FPS e frame time observado de 16,67 ms.

A correção temporal por fixed-step accumulator de 1/60 s, delta acumulado
limitado e máximo de quatro substeps foi aprovada em nova revisão técnica sem
findings.

O resultado visual original de `listening` recebeu `no-go`: o campo colapsava
em um aro branco saturado, quase bidimensional, com perda de profundidade e
aparência de neon. O `idle` foi considerado volumétrico e promissor, embora as
partículas ainda apresentassem aspecto quadrado ou blocado.

## Incremento 1B — correção visual mínima

O objetivo do Incremento 1B é transformar `listening` em uma abertura frontal
tridimensional semelhante a uma íris de matéria viva, preservando continuidade
com `idle`, profundidade e volume.

Critérios de aceite visual:

- `idle` permanece claramente volumétrico;
- `listening` não forma aro bidimensional, torus ou circunferência perfeita;
- a abertura frontal permanece legível sem esvaziar completamente o centro;
- há matéria na frente, nas laterais e no eixo de profundidade;
- forma e movimento conservam assimetria orgânica discreta;
- partículas não parecem quadrados sólidos;
- nenhum estado apresenta branco estourado;
- a transição `idle` ↔ `listening` não apresenta salto ou colapso;
- o alvo permanece 60 FPS no hardware atual.

## Resultado do Incremento 1B

O Incremento 1B melhorou o formato circular e a exposição das partículas, mas
permaneceu em `no-go` visual porque `listening` continuou formando uma estrutura
toroidal, com centro vazio e perda da continuidade volumétrica com `idle`.

O teste de retorno a `idle` também indicou risco de deriva ou reconstrução
incompleta da esfera após alternâncias de estado. A dinâmica baseada somente na
posição corrente não oferecia uma referência estável para reversibilidade.

## Incremento 1C — formações ancoradas e reversíveis

O Incremento 1C busca tornar `idle` e `listening` formações tridimensionais,
estáveis e reversíveis. Cada partícula preserva uma posição-base esférica
imutável; o alvo instantâneo é derivado dessa âncora e do estado interpolado, e
uma força elástica amortecida conduz a partícula sem teletransporte.

Em `listening`, a transformação deve permanecer localizada principalmente no
hemisfério frontal, criando uma concavidade orgânica e assimétrica sem substituir
a esfera por um toro. A silhueta externa, o hemisfério traseiro, matéria interna
no centro e profundidade no eixo Z devem permanecer visíveis.

O critério específico de reversibilidade é repetir a sequência `idle` 10 s,
`listening` 10 s, `idle` 10 s, `listening` 10 s e `idle` 10 s. Cada retorno deve
recuperar progressivamente o volume esférico sem acumular deformação ou formar
aro.

## Encerramento

O experimento está formalmente encerrado como **GO TÉCNICO / NO-GO VISUAL**.
Foram aprovadas a viabilidade de WebGPU/TSL no navegador-alvo, a execução de
32.768 partículas a 60 FPS / 16,67 ms, a adoção do acumulador fixed-step para a
integração física, o formato circular das partículas e a reversibilidade
técnica das transições no cenário observado.

O resultado visual não foi aprovado. `idle` permaneceu uma nuvem esférica
genérica; as primeiras versões de `listening` formaram toro ou aro; e a solução
ancorada do Incremento 1C corrigiu a deriva ao custo de reduzir o movimento
expressivo e a distinção visual entre os estados. A experiência não atingiu o
nível das referências, e novos ajustes excederiam o limite de investimento
definido para este spike.

Nenhum código deste experimento será promovido automaticamente ao produto. O
R0.5 continua bloqueado pela ausência de ACK real emitido pelo firmware e
validado em bancada. Este encerramento não aprova nem conclui a interface da
Circe e não gera ADR, SPEC ou atualização da documentação oficial.

A revisão final de todas as alterações registrou dois riscos residuais: o
relógio do alvo procedural ainda é atualizado por frame antes dos substeps, o
que pode produzir trajetórias diferentes quando há múltiplos substeps; e o
cleanup após falha de inicialização do renderer pode provocar rejeições não
tratadas. Os achados permanecem abertos porque a decisão de encerramento proíbe
novas alterações funcionais.

O resultado detalhado está registrado em `SPIKE-RESULT.md`.
