# ADR-0006 — Orquestração governada de capacidades

**Status:** Accepted

## Contexto

A CIRCE precisa coordenar tarefas de memória, casa, pesquisa e produção sem se
tornar dependente de um único provedor de IA. O Core já possui memória portátil,
contexto neutro e contrato de provedor, mas não possui um modelo seguro de
planejamento e execução de ferramentas.

Uma arquitetura baseada em múltiplos “agentes” independentes aumentaria custo,
latência, superfície de segurança e dificuldade de depuração antes de existirem
casos de uso que justifiquem essa complexidade.

## Decisão

Adotar um **runtime central de orquestração governada**, dentro do monólito
modular, com uma identidade única da CIRCE e capacidades especializadas
registradas no backend.

O fluxo normativo será:

```text
Intenção -> Plano -> Política -> Aprovação -> Execução -> Verificação -> Registro
```

- o modelo pode interpretar, planejar e propor capacidades;
- o Core mantém catálogo, schemas, risco, permissões e idempotência;
- o executor backend é o único componente autorizado a chamar ferramentas;
- memória, MQTT, credenciais e bancos não são entregues ao modelo;
- toda execução possui `correlation_id`, ator, origem, estado e resultado;
- ações de escrita e efeitos externos exigem política explícita;
- ações físicas obedecem adicionalmente a desired/reported state, ACK e timeout;
- a voz utiliza o mesmo runtime e não possui caminho privilegiado;
- “especialista” é um perfil versionado de instruções, ferramentas e política,
  não um microserviço nem necessariamente uma chamada separada de modelo.

## Níveis de risco

| Nível | Exemplo | Regra inicial |
|---|---|---|
| R0 | leitura de status local | execução permitida e auditada |
| R1 | geração de briefing ou rascunho | execução permitida; saída marcada como rascunho |
| R2 | alterar dado interno reversível | aprovação humana obrigatória |
| R3 | comunicação externa ou ação física | aprovação humana + verificação do resultado |
| R4 | ação irreversível ou de segurança | proibida até ADR específica |

## Consequências positivas

- preserva independência de provedor;
- evita duplicar segurança e ferramentas entre voz, texto e UI;
- permite começar com uma única execução de modelo;
- torna falhas e custos observáveis;
- mantém a expansão compatível com o monólito modular.

## Consequências negativas

- exige persistência adicional para runs e aprovações;
- aumenta o trabalho inicial antes de demonstrações mais cinematográficas;
- o runtime central pode crescer demais se os módulos internos não forem
  mantidos separados;
- agendamento confiável exigirá idempotência e recuperação após reinício.

## Alternativas rejeitadas

### Um agente ou microserviço por função

Rejeitado no estágio atual por ausência de necessidade de escala e pelo aumento
de complexidade operacional.

### Ferramentas executadas diretamente no frontend

Rejeitado por expor segredos, contornar política central e permitir divergência
entre texto, voz e controle físico.

### Provedor com acesso direto a MQTT ou memória

Rejeitado por quebrar isolamento, portabilidade e autoridade do Core.

### Autonomia irrestrita

Rejeitada porque o produto ainda não possui autenticação, autorização, trilha
imutável nem recuperação operacional suficientes.
