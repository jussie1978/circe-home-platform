# ADR-0005 — Memória independente do provedor de IA

**Status:** Accepted

## Contexto

A CIRCE deve manter identidade, preferências e continuidade mesmo quando o usuário troca o modelo ou o provedor de IA. Se a memória oficial depender de OpenAI, Gemini, Anthropic, modelos locais ou de um serviço de embeddings específico, o sistema perde portabilidade e transfere ao fornecedor o controle sobre a experiência do usuário.

A memória também não pode ser confundida com o histórico bruto de conversas. O Core precisa controlar retenção, origem, confiança, relevância, atualização e exclusão dos registros persistentes.

## Opções consideradas

1. Usar a memória nativa de cada provedor de IA.
2. Persistir apenas o histórico bruto de conversas.
3. Manter a memória no CIRCE Core e tratar modelos, embeddings e índices como componentes substituíveis.

## Decisão

Adotar memória persistente independente do provedor, pertencente ao CIRCE Core.

- O Core é a fonte oficial de verdade para memórias, preferências e identidade persistente.
- Provedores de IA recebem somente o contexto necessário para a interação atual.
- A personalidade da CIRCE pertence ao Core, não ao modelo utilizado.
- O registro textual e estruturado é permanente; embeddings e índices vetoriais são derivados e regeneráveis.
- A troca de provedor não deve apagar nem alterar memórias existentes.
- O Context Builder seleciona e monta o contexto enviado ao provedor.
- O MVP persiste apenas memórias explícitas aprovadas e eventos operacionais necessários.
- Inferência automática de hábitos, consolidação avançada e memória emocional ficam fora do MVP.

## Consequências

### Positivas

- liberdade para trocar fornecedores sem perder continuidade;
- possibilidade de operação local ou híbrida;
- maior controle de privacidade, auditoria e retenção;
- testes independentes do modelo de IA;
- redução de lock-in em APIs de embeddings e memória.

### Negativas

- o Core passa a ser responsável por seleção, atualização e exclusão de memórias;
- será necessário definir contratos de memória e construção de contexto;
- índices vetoriais precisarão de versionamento e eventual reindexação;
- respostas podem variar entre modelos mesmo com o mesmo contexto.

## Plano de migração/rollback

1. Introduzir contratos `MemoryProvider` e `ContextBuilder` sem alterar o fluxo atual de voz.
2. Implementar persistência inicial em armazenamento controlado pelo backend.
3. Persistir somente preferências explicitamente aprovadas.
4. Validar a troca entre dois provedores usando o mesmo conjunto de memórias.
5. Manter o recurso desativável por configuração durante a estabilização.

Rollback: desativar a injeção de memória no Context Builder sem remover os registros persistidos.
