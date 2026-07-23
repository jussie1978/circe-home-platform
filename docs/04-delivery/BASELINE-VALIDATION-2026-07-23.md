# Validação da baseline — 23/07/2026

## Resultado

Validação parcial aprovada para consolidar o repositório como baseline de trabalho.
Esta entrega não encerra a SPEC-001: inicialização completa em máquina limpa,
Compose integral e CI continuam pendentes.

## Evidências

| Verificação | Resultado |
| --- | --- |
| Instalação Python a partir de `backend/requirements.txt` | Aprovada |
| Testes do backend (`pytest -q`) | 3 aprovados |
| Build do frontend (`npm run build`) | Aprovado |
| Lint do frontend (`npm run lint`) | Aprovado |

## Correções aplicadas

- normalização de `backend/requirements.txt` de UTF-16 para UTF-8;
- inclusão da configuração e das dependências ausentes do ESLint;
- preservação temporária de débitos legados de tipagem para evitar refatoração
  fora do escopo da baseline.

## Pendências não bloqueantes

- dividir o bundle principal do frontend, atualmente acima de 500 kB;
- atualizar usos depreciados de SQLAlchemy, FastAPI e `datetime.utcnow`;
- reduzir gradualmente usos legados de `any` e exceções de lint;
- concluir os demais critérios de aceite da SPEC-001.
