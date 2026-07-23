# Arquitetura de inteligência

## Princípio

A IA interpreta intenção e coordena ferramentas; ela não é a autoridade final sobre dispositivos físicos.

## Camadas

1. **Percepção:** áudio, telemetria e visão.
2. **Interpretação:** intenção, entidades e contexto.
3. **Política:** autorização, risco e confirmação.
4. **Execução:** ferramentas determinísticas no backend.
5. **Memória:** preferências e histórico com retenção explícita.
6. **Explicação:** resposta ao usuário e trilha de auditoria.

## Memória

Começar sem memória longa automática. Persistir apenas preferências explicitamente aprovadas e eventos operacionais necessários. RAG e agentes só entram após casos de uso mensuráveis.

## Proibição arquitetural

O modelo não publica diretamente em MQTT nem acessa credenciais de dispositivos.
