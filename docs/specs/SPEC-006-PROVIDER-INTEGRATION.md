# SPEC-006 — Provider Integration v0.1

**Status:** Accepted

## Problema

O Core possui `ContextService`, `ModelContext` e o contrato `AIProvider`, mas a
resposta ainda não atravessa um adaptador textual real. A integração deve
comprovar que uma memória persistida pelo Core chega ao provedor sem conceder ao
adaptador acesso ao SQLite ou aos serviços de memória.

## Objetivo

Implementar a menor fatia textual `ContextService` → `AIProvider` com um
adaptador real da OpenAI Responses API, mantendo configuração e segredos
exclusivamente no backend.

## Escopo

- `OpenAITextProvider` implementando `AIProvider`;
- tradução interna de `ModelContext` para a Responses API;
- `TextCompletionService` para coordenar construção do contexto e resposta;
- configuração backend por `OPENAI_API_KEY` e `CIRCE_OPENAI_MODEL`;
- armazenamento remoto desabilitado na requisição com `store: false`;
- saída limitada a 256 tokens por chamada;
- timeout HTTP mínimo;
- erros neutros para configuração ausente, falha HTTP/rede e resposta sem texto;
- testes automatizados com `httpx.MockTransport`, sem chamadas pagas;
- demonstrador manual de uma única chamada real.

## Fora de escopo

- frontend ou novo endpoint público;
- voz, Realtime, WebRTC e streaming;
- embeddings, banco vetorial ou memória automática;
- function calling e execução de ferramentas;
- retry, seleção automática de provedor e fallback;
- métricas de custo e latência.

## Requisitos

1. O adaptador deve implementar `AIProvider.complete(ModelContext)`.
2. O adaptador não deve receber ou importar `MemoryService`, repositórios,
   sessões SQLAlchemy ou SQLite.
3. O modelo e a chave devem vir de variáveis de ambiente do backend.
4. O payload deve preservar personalidade, memória autorizada, histórico,
   ferramentas descritivas e mensagem atual do `ModelContext`.
5. Falhas externas não devem expor a chave de API.
6. Testes automatizados não podem acessar a API real.
7. Uma memória deve ser gravada, o banco reaberto e a memória recuperada antes
   da composição da requisição ao provedor.

## Critérios de aceite

- adaptador real implementado atrás do contrato neutro;
- configuração ausente e falha HTTP tratadas;
- suíte completa do backend passando sem rede;
- teste reabre o SQLite e prova que a memória recuperada influencia o payload e
  a resposta simulada;
- demonstrador manual disponível para uma chamada real;
- chamada real executada somente após autorização explícita de custo.

## Validação automatizada

Executar:

```powershell
cd C:\Projetos\circe-home-platform\backend
.\venv\Scripts\Activate.ps1
python -m pytest -q
```

Resultado atual: `41 passed`.

## Validação ao vivo

Em 26/07/2026, após autorização explícita de custo, o demonstrador foi executado
uma única vez com `gpt-5-nano`:

```powershell
$env:OPENAI_API_KEY="SUA_CHAVE"
$env:CIRCE_OPENAI_MODEL="MODELO_AUTORIZADO"
python -m scripts.demo_provider_memory
```

O script usa um SQLite temporário, grava uma preferência, fecha e reabre o banco
e imprime a memória recuperada ao lado da resposta do provedor. O diretório
temporário é removido automaticamente ao final.

Resultado observado:

- memória persistida: preferência por respostas diretas e objetivas;
- provedor: `openai`;
- resposta real: confirmou a mesma preferência em uma frase;
- uma única chamada válida alcançou a API;
- uma tentativa anterior por caminho direto falhou na importação de `app` antes
  de qualquer chamada externa.
