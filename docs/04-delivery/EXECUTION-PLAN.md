# Plano de execução

## Sequência recomendada

1. **Sanear o repositório:** dependências, portas, caches e variáveis.
2. **Reproduzir:** subir toda a stack e registrar comandos exatos.
3. **Testar:** smoke tests e CI.
4. **Confiabilizar o estado:** ack, desired/reported e auditoria.
5. **Integrar hardware:** um dispositivo por vez.
6. **Integrar voz:** isolada, depois leitura, finalmente ação.
7. **Endurecer:** autenticação, rede, segredos e backup.

## Regra de foco

Não iniciar mais de um marco de risco alto simultaneamente. Voz e hardware devem ter baselines independentes antes da integração.
