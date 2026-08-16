# ADR-0007 — Identidade do CIRCE OS e adoção da SPEC Master

**Status:** Aceita

**Data:** 14/08/2026

**Decisor:** Jussiê, proprietário do produto

**Escopo:** produto, governança, nomenclatura, R1.0 e prioridade de evolução

**Documento normativo relacionado:** `docs/01-product/SPEC-MASTER.md`

---

## Contexto

O projeto nasceu como CIRCE Home Platform e avançou por uma bancada concreta: frontend espacial, backend FastAPI, MQTT, SQLite, ESP32-S3, mecanismos, memória independente de provedor e experimentos de voz e visão.

Essa base continua válida, mas a visão do produto evoluiu. O objetivo passou a ser um Home Companion local-first e híbrido, capaz de unir interação natural, memória controlada, percepção ambiental, automação residencial e dispositivos físicos sob políticas e contratos confiáveis.

Sem uma decisão central, surgiram riscos de:

- limitar o produto ao case e ao hardware da primeira bancada;
- tratar toda ideia futura como compromisso imediato;
- confundir CIRCE, IRIS, Circe Core e o significado de “OS”;
- iniciar novas frentes antes de fechar o loop físico confiável do R0.5;
- transferir a arquitetura central para plataformas externas de automação;
- deixar visão, ADRs, SPECs, roadmap e estado do projeto inconsistentes.

Também era necessário definir o papel de ideias importantes, porém ainda imaturas, como saúde assistiva, localização em tempo real, dispositivos físicos dedicados e uma eventual appliance própria.

## Decisão

### 1. Identidade do produto

O nome canônico do produto é **CIRCE OS**.

**Circe** é a identidade do Home Companion percebida pelo usuário. **Circe Core** designa o núcleo de contexto, memória, políticas, ferramentas e coordenação de IA.

O nome `IRIS`, ainda presente em partes do código e da documentação, passa a ser dívida de nomenclatura. Ele deve ser removido gradualmente ou receber definição restrita em ADR específica. Não deve ganhar novos significados ou interfaces enquanto permanecer ambíguo.

### 2. Significado de “OS”

No estágio atual, “OS” significa a camada de orquestração e experiência do ecossistema CIRCE: runtime, serviços, contratos, interfaces, memória, políticas e integrações.

O CIRCE OS não é atualmente um kernel, um sistema operacional generalista ou uma distribuição própria. Uma appliance ou imagem Linux dedicada poderá ser considerada futuramente se houver evidência de redução de custo operacional, instalação e suporte.

### 3. SPEC Master

`docs/01-product/SPEC-MASTER.md` torna-se o contrato central de produto, arquitetura de referência e evolução.

Ela não substitui:

- `PROJECT-STATUS.md`, que permanece o painel do estado operacional;
- ADRs, que registram decisões arquiteturais;
- SPECs de domínio, que detalham implementações;
- roadmap e backlog, que organizam a entrega.

Quando uma decisão afetar a SPEC Master, os documentos impactados devem ser atualizados no mesmo incremento.

### 4. Foco do R1.0

R1.0 será um piloto residencial de uma casa, operado pelo proprietário do produto e sua família.

R1.0 não inclui:

- operação comercial multi-tenant;
- suporte amplo a instalações de terceiros;
- produto médico;
- plataforma policial;
- construção de sistema operacional próprio;
- expansão indiscriminada de hardware e integrações.

O critério de saída do R1.0 está definido na SPEC Master e exige instalação, operação, recuperação, controle físico confirmado, interação com memória controlada, modo degradado, observabilidade e backup.

### 5. Papel do Home Assistant

Home Assistant e plataformas semelhantes podem ser integrados por adaptadores opcionais. Eles não são fundação obrigatória do CIRCE OS e não recebem automaticamente autoridade sobre:

- identidade da Circe;
- memória;
- políticas;
- autorização;
- auditoria central;
- confirmação de ações.

Uma integração real exigirá ADR fit-gap própria.

### 6. Saúde assistiva e localização

Saúde assistiva, sinais fisiológicos, localização em tempo real, coordenação de deslocamentos e comboio permanecem na visão como horizonte de incubação.

Essas capacidades não são compromissos anteriores ao R1.0. Sua entrada no roadmap depende de avaliação explícita de utilidade, risco, privacidade, legislação, segurança e custo de manutenção.

### 7. Prioridade de implementação

Nenhuma nova frente de Home Companion deve entrar em implementação antes do fechamento verificável do R0.5.

A prova vertical do backend para ACK e timeout de teto/servos já está integrada. O próximo incremento técnico é a emissão do ACK oficial pelo firmware e sua validação física. Depois permanecem:

- persistência, expiração durável e idempotência;
- reconciliação e auditoria de comandos;
- feedback `pending/confirmed/failed/timeout` na interface;
- extensão do contrato confiável aos demais controles físicos.

Pesquisa, documentação e registro de referências podem continuar, desde que não desviem a execução do R0.5.

## Consequências positivas

- a visão deixa de ficar presa ao hardware inicial;
- R1.0 ganha um limite verificável e economicamente realista;
- ideias futuras são preservadas sem virar promessa prematura;
- a prioridade do controle físico confiável fica protegida;
- o Core permanece independente de provedor e plataforma de automação;
- CIRCE passa a ter identidade e vocabulário canônicos;
- novos colaboradores e IAs recebem uma fonte central de contexto;
- decisões futuras podem ser avaliadas contra princípios estáveis.

## Consequências negativas e custos

- documentos existentes precisarão de sincronização;
- nomes `IRIS` no código e na interface gerarão migração gradual;
- algumas ideias atraentes permanecerão fora do roadmap por tempo indeterminado;
- a adoção futura de Home Assistant exigirá uma camada de adaptação;
- a SPEC Master adiciona uma obrigação de governança a cada mudança estrutural;
- a promessa comercial fica adiada até existir evidência residencial real.

Esses custos são aceitos porque reduzem retrabalho e risco de uma plataforma incoerente.

## Alternativas consideradas

### Manter CIRCE Home Platform como nome principal

Rejeitada porque descreve a origem do protótipo, mas limita a visão de Home Companion, interfaces, Core e dispositivos futuros.

### Tratar “OS” como sistema operacional próprio desde já

Rejeitada por não haver necessidade técnica, equipe, suporte ou custo-benefício comprovados.

### Tornar Home Assistant o núcleo da plataforma

Rejeitada porque transferiria parte relevante do modelo de dispositivos e automações para uma dependência externa e não resolveria identidade, memória, políticas ou coordenação de IA.

### Colocar saúde, localização e hardware dedicado no roadmap imediato

Rejeitada porque ampliaria risco e escopo antes do fechamento do controle confiável e da segurança operacional.

### Manter CIRCE e IRIS como nomes intercambiáveis

Rejeitada por aumentar ambiguidade em código, documentação, interface e comunicação do produto.

### Continuar sem SPEC Master

Rejeitada porque o volume de decisões e domínios já ultrapassou o que pode ser mantido coerentemente apenas por documentos isolados.

## Plano de integração

1. adicionar `docs/01-product/SPEC-MASTER.md`;
2. adicionar esta ADR em `docs/adrs/`;
3. incluir ambos em `docs/INDEX.md` e no índice de ADRs;
4. atualizar `PROJECT-STATUS.md` preservando o ACK oficial no firmware e a validação física como próximo incremento técnico do R0.5;
5. registrar a adoção no `CHANGELOG.md`;
6. ajustar `MASTER-PLAN.md`, `PRODUCT-SPEC.md` e `RELEASE-PLAN.md` para referenciar a SPEC Master;
7. preservar no `ROADMAP.md` a prioridade de ack e timeout;
8. mapear as capacidades novas em `TRACEABILITY.md`;
9. abrir PR exclusivamente documental;
10. após integração, registrar commit, PR e validações no painel do projeto.

## Migração de nomenclatura

A migração de `IRIS` não deve ser feita como substituição global cega.

Ordem recomendada:

1. impedir novas ocorrências ambíguas;
2. inventariar ocorrências em código, API, interface e documentação;
3. classificar cada ocorrência como identidade, componente histórico ou nome técnico;
4. definir compatibilidade de API e configuração;
5. migrar em incremento próprio com testes;
6. manter aliases temporários apenas quando necessários;
7. remover aliases após janela documentada.

## Rollback

Se a direção de produto mudar, uma nova ADR deve substituir esta decisão. O rollback não apaga esta ADR nem reclassifica silenciosamente a história.

É possível:

- retirar a SPEC Master como fonte normativa;
- restaurar outro nome canônico;
- alterar o escopo do R1.0;
- promover uma integração externa a componente obrigatório.

Cada alteração exige análise dos documentos, contratos e migrações já dependentes desta decisão.

## Critérios de conclusão

Esta ADR estará operacionalmente integrada quando:

- SPEC Master e ADR estiverem na `main`;
- índices e documentos de governança estiverem sincronizados;
- nenhuma seção vigente contradizer as decisões acima sem ressalva explícita;
- o próximo passo técnico continuar sendo o fechamento do R0.5;
- commit, PR e validações estiverem registrados em `PROJECT-STATUS.md` e `CHANGELOG.md`.
