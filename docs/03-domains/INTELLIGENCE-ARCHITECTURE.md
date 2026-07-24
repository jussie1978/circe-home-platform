# Arquitetura de inteligência

## Princípio

A IA interpreta intenção e coordena ferramentas; ela não é a autoridade final sobre dispositivos físicos.

O modelo de IA é substituível. Personalidade, políticas, memória persistente e construção de contexto pertencem ao CIRCE Core.

## Camadas

1. **Percepção:** áudio, telemetria e visão.
2. **Interpretação:** intenção, entidades e contexto.
3. **Política:** autorização, risco e confirmação.
4. **Execução:** ferramentas determinísticas no backend.
5. **Memória:** preferências e histórico com retenção explícita.
6. **Context Builder:** seleção do contexto autorizado para cada interação.
7. **Provider Adapter:** tradução do contexto e ferramentas para o provedor escolhido.
8. **Explicação:** resposta ao usuário e trilha de auditoria.

## Memória

A arquitetura detalhada está em [MEMORY-ARCHITECTURE.md](MEMORY-ARCHITECTURE.md) e na [ADR-0005](../adrs/ADR-0005-PROVIDER-INDEPENDENT-MEMORY.md).

O MVP começa sem memória longa automática. Persistir apenas preferências explicitamente aprovadas e eventos operacionais necessários. RAG, inferência de hábitos e agentes entram somente após casos de uso mensuráveis.

## Proibição arquitetural

O modelo não publica diretamente em MQTT, não acessa credenciais de dispositivos e não consulta diretamente o armazenamento de memória.
