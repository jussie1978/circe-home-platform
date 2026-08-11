# Plano de execução

## Sequência recomendada

1. **Sanear o repositório:** dependências, portas, caches e variáveis.
2. **Reproduzir:** subir toda a stack e registrar comandos exatos.
3. **Testar:** smoke tests e CI.
4. **Confiabilizar o estado:** ack, desired/reported e auditoria.
5. **Integrar hardware:** um dispositivo por vez.
6. **Integrar voz:** isolada, depois leitura, finalmente ação.
7. **Endurecer:** autenticação, rede, segredos e backup.
8. **Orquestrar:** catálogo, tarefas persistentes e capacidades de leitura.
9. **Automatizar:** scheduler e efeitos externos somente após idempotência,
   autorização e recuperação de falhas.

## Regra de foco

Não iniciar mais de um marco de risco alto simultaneamente. Voz e hardware devem ter baselines independentes antes da integração.

Orquestração v0.1 pode ser preparada em documentação, mas sua implementação não
substitui a emissão de ACK real do firmware definida como próximo passo exato.
Nenhum especialista novo entra sem caso de uso, ferramenta e teste mensurável.
