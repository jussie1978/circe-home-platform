# SPRINT 000 — Setup & Especificação

**Período:** 26–31 maio 2026  
**Objetivo:** Preparar toda a infraestrutura para início do desenvolvimento  
**Esforço estimado:** 7h  
**Status:** 🟡 Em progresso

---

## Resumo Executivo

Sprint de fundação do projeto. Nenhuma linha de código de produto é escrita aqui — apenas infraestrutura, documentação e validação de ambiente. O critério de sucesso é simples: ao final do Sprint 000, você deve conseguir abrir o repositório, ler a documentação e saber exatamente o que fazer no Sprint 001.

---

## Objetivos do Sprint

| # | Objetivo | Status |
|---|----------|--------|
| 1 | Repositório GitHub privado criado e estruturado | 🟡 |
| 2 | Documentação core completa (SPEC, ADRs, IRIS) | 🟡 |
| 3 | Lista de compras de hardware finalizada e validada | ⚪ |
| 4 | Pedidos realizados (com tracking) | ⚪ |
| 5 | Ambiente de desenvolvimento configurado | ⚪ |
| 6 | Hello World: ESP32 pisca LED + publica MQTT local | ⚪ |

---

## Tarefas Detalhadas

### Dia 1 — Segunda 26/05 (1.5h) — Repositório e Docs Core

```
[ ] T001  Criar repo GitHub: circe-home-platform (privado)
[ ] T002  Criar estrutura de pastas completa (ver README)
[ ] T003  Copiar e commitar README.md
[ ] T004  Copiar e commitar SPEC-001-PLATFORM.md
[ ] T005  Copiar e commitar IRIS-IDENTITY.md
[ ] T006  Copiar e commitar ADR-001, ADR-002, ADR-003
[ ] T007  Copiar e commitar SPRINT-000-setup.md (este arquivo)
[ ] T008  Criar .gitignore
[ ] T009  git push origin main
```

**Comandos:**
```bash
mkdir circe-home-platform && cd circe-home-platform
git init

# Criar estrutura
mkdir -p docs/{adrs,sprints}
mkdir -p hardware/{esp32,schematics,docs}
mkdir -p backend/app/{api,mqtt,models,schemas,database}
mkdir -p frontend/src/{components,hooks,styles}
mkdir -p iris-agent/{whisper,ollama,piper}
mkdir -p docker scripts knowledge

# Primeiro commit
git add .
git commit -m "chore: initial project structure"

# Conectar ao GitHub (via CLI ou interface web)
gh repo create circe-home-platform --private --source=. --remote=origin
git push -u origin main
```

**Entregável:** Repo online com estrutura completa e docs.

---

### Dia 2 — Terça 27/05 (1.5h) — Pesquisa de Hardware

```
[ ] T010  Pesquisar ESP32 DevKit V1 30 pinos (Eletrogate, Baú, ML)
[ ] T011  Pesquisar sensor DHT22 (confirmar 3.3V compatível)
[ ] T012  Pesquisar módulo relé 2 canais 5V optoacoplado
[ ] T013  Pesquisar fita LED WS2812B (deixar para R2.0, mas orçar)
[ ] T014  Confirmar que já tem: ferro de solda, multímetro, alicates
[ ] T015  Preencher COMPONENTS-LIST.md com preços e links reais
[ ] T016  Calcular orçamento total (meta: < R$ 250 para R1.0)
[ ] T017  Validar compatibilidade: todos os componentes aceitam 3.3V?
[ ] T018  Commit: "docs: hardware components list with prices"
```

**Checklist de validação (antes de comprar):**
```
[ ] DHT22 opera em 3.3V? (Sim — range 3.3V–6V)
[ ] Relé 5V pode ser acionado por GPIO 3.3V? (Sim se optoacoplado)
[ ] ESP32 DevKit V1 tem 30 pinos? (confirmar no anúncio)
[ ] Fonte 5V tem conector adequado? (micro-USB ou USB-C?)
[ ] Fans do case são 12V? (medir com multímetro)
[ ] Fans são 3-pin (ON/OFF) ou 4-pin (PWM)? (verificar no case)
```

**Entregável:** COMPONENTS-LIST.md completo com preços reais e links.

---

### Dia 3 — Quarta 28/05 (1h) — Realizar Pedidos

```
[ ] T019  Abrir carrinho Eletrogate com componentes selecionados
[ ] T020  Abrir carrinho Baú da Eletrônica (ou consolidar em 1 loja)
[ ] T021  Confirmar frete e prazo (meta: < 10 dias úteis)
[ ] T022  Finalizar compras
[ ] T023  Salvar números de pedido em COMPONENTS-LIST.md
[ ] T024  Anotar data estimada de entrega no calendário
[ ] T025  Commit: "chore: hardware components ordered - tracking added"
```

**Entregável:** Pedidos feitos, tracking documentado, data de entrega no calendário.

---

### Dia 4 — Quinta 29/05 (1h) — Ambiente Python + Backend Scaffold

```
[ ] T026  Verificar Python 3.11+: python --version
[ ] T027  Criar ambiente virtual: cd backend && python -m venv venv
[ ] T028  Ativar venv: source venv/bin/activate (Linux) ou venv\Scripts\activate (Win)
[ ] T029  Instalar dependências iniciais:
          pip install fastapi uvicorn sqlalchemy pydantic paho-mqtt pytest
[ ] T030  Criar requirements.txt: pip freeze > requirements.txt
[ ] T031  Criar backend/app/main.py com endpoint GET /health
[ ] T032  Testar: uvicorn app.main:app --reload
[ ] T033  Verificar http://localhost:8000/docs (Swagger auto-gerado)
[ ] T034  Commit: "feat: backend FastAPI scaffold with /health endpoint"
```

**Código mínimo (T031):**
```python
# backend/app/main.py
from fastapi import FastAPI
from datetime import datetime

app = FastAPI(
    title="CIRCE Home Platform API",
    description="Backend da plataforma de automação residencial",
    version="0.1.0"
)

@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "project": "CIRCE Home Platform",
        "timestamp": datetime.now().isoformat()
    }
```

**Entregável:** API rodando localmente com Swagger disponível em `/docs`.

---

### Dia 5 — Sexta 30/05 (1h) — Ambiente Node + Mosquitto

```
[ ] T035  Verificar Node.js 18+: node --version
[ ] T036  Instalar Mosquitto broker:
          Linux: sudo apt install mosquitto mosquitto-clients
          macOS: brew install mosquitto
          Windows: baixar installer em mosquitto.org
[ ] T037  Iniciar Mosquitto: mosquitto (ou mosquitto -v para verbose)
[ ] T038  Testar MQTT local:
          Terminal 1: mosquitto_sub -t "circe/test/#" -v
          Terminal 2: mosquitto_pub -t "circe/test/hello" -m "IRIS online"
[ ] T039  Verificar que mensagem aparece no Terminal 1
[ ] T040  Instalar Arduino IDE 2.x (arduino.cc/en/software)
[ ] T041  Adicionar board manager ESP32:
          Preferences → Additional Board URLs →
          https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
[ ] T042  Instalar board "esp32 by Espressif Systems"
[ ] T043  Instalar biblioteca PubSubClient via Library Manager
[ ] T044  Instalar biblioteca DHT sensor library (Adafruit)
[ ] T045  Commit: "chore: dev environment fully configured"
```

**Entregável:** Mosquitto rodando, mensagens sendo trocadas, Arduino IDE pronto.

---

### Fim de Semana — Sáb/Dom 31/05–01/06 (Opcional, 2h)

```
[ ] T046  Conectar ESP32 via USB, selecionar porta no Arduino IDE
[ ] T047  Fazer upload do sketch Blink (LED_BUILTIN pisca 1Hz)
[ ] T048  Confirmar que LED pisca → ESP32 funcionando
[ ] T049  Conectar ESP32 ao WiFi local (sketch WiFiScan)
[ ] T050  Confirmar que ESP32 aparece na rede
[ ] T051  Fazer ESP32 publicar MQTT "alx/test" → "hello":
```

**Código ESP32 Hello World MQTT (T051):**
```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid       = "SUA_REDE_WIFI";
const char* password   = "SUA_SENHA_WIFI";
const char* mqttServer = "192.168.X.X";  // IP do PC rodando Mosquitto
const int   mqttPort   = 1883;

WiFiClient   espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado: " + WiFi.localIP().toString());

  client.setServer(mqttServer, mqttPort);
}

void loop() {
  if (!client.connected()) {
    if (client.connect("ESP32_ALX")) {
      Serial.println("MQTT conectado!");
      client.publish("alx/status", "online");
    }
  }
  client.loop();

  // Publica a cada 5s
  static unsigned long lastMsg = 0;
  if (millis() - lastMsg > 5000) {
    lastMsg = millis();
    client.publish("alx/test", "IRIS online - ESP32 funcionando");
    Serial.println("Publicado MQTT");
  }
}
```

```
[ ] T052  Verificar mensagem no mosquitto_sub: mosquitto_sub -t "alx/#" -v
[ ] T053  Confirmar ciclo completo: ESP32 → WiFi → MQTT → PC
[ ] T054  Commit: "test: ESP32 hello world MQTT validated"
```

**Entregável:** Ciclo completo ESP32 → WiFi → MQTT → PC funcionando.

---

## Critérios de Aceitação do Sprint

### Must Have (Sprint incompleto sem estes)
- [ ] Repositório GitHub criado, estruturado e com docs commitadas
- [ ] Componentes encomendados com tracking registrado
- [ ] Backend FastAPI rodando localmente (`/health` retorna 200)
- [ ] Mosquitto instalado e testado localmente

### Should Have (Desejáveis)
- [ ] Arduino IDE configurado com board ESP32
- [ ] Hello World ESP32 + MQTT validado

### Nice to Have
- [ ] Diagrama de arquitetura visual (Excalidraw/draw.io)
- [ ] Esboço do dashboard (Figma ou papel fotografado)

---

## Riscos do Sprint

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Componentes fora de estoque | Média | Médio | Verificar 2 fornecedores antes de decidir |
| ESP32 com defeito de fábrica | Baixa | Médio | Comprar 2 unidades |
| Arduino IDE não reconhece porta | Média | Baixo | Instalar driver CP2102/CH340 |
| Frete atrasado (>10 dias) | Baixa | Médio | Iniciar código firmware no simulador Wokwi |

---

## Notas e Decisões

### 2026-05-24
- Nome da IA definido: **IRIS** (Integrated Residential Intelligence System)
- Stack backend confirmada: FastAPI (ADR-001)
- Messaging confirmado: MQTT Mosquitto (ADR-002)
- Database confirmado: SQLite inicial (ADR-003)
- Metodologia: SDD (igual LexisPro e CIRCE Intel Desk)

---

## Métricas do Sprint

| Métrica | Meta | Realizado |
|---------|------|-----------|
| Horas investidas | 7h | ___ h |
| Custo hardware | < R$ 250 | R$ ___ |
| Tasks concluídas | 54 | ___ / 54 |
| Bloqueadores encontrados | 0 | ___ |
| Commits realizados | ≥ 5 | ___ |

---

## Próximos Passos (Sprint 001 Preview)

Após Sprint 000 concluído, Sprint 001 inicia:

- Montar circuito físico (ESP32 + DHT22 + Relé + LEDs) na protoboard
- Escrever firmware de controle térmico completo
- Backend: modelos SQLAlchemy + endpoints `/sensors/temperature` e `/config`
- Frontend: página HTML com temperatura e status em tempo real

**Prazo Sprint 001:** 02–15 junho 2026 (2 semanas)

---

## Relatório de Sprint (Preencher ao Finalizar)

```markdown
## SPRINT 000 — Relatório Final

**Data conclusão:** ___/06/2026
**Horas reais:** ___h (estimado: 7h)
**Custo real hardware:** R$ ___ (orçado: R$ 250)

### O que foi entregue
- [ ] Repositório estruturado e documentado
- [ ] Componentes encomendados
- [ ] Ambiente dev configurado
- [ ] Hello World ESP32 + MQTT

### Decisões tomadas
- [Listar aqui decisões não documentadas nas ADRs]

### Bloqueadores encontrados
- [Listar problemas e como foram resolvidos]

### Lições aprendidas
- [O que funcionou bem / O que fazer diferente no Sprint 001]

### Status Sprint 001
- [ ] Componentes chegaram? Data: ___/___/2026
- [ ] Pronto para iniciar montagem física: SIM / NÃO
```

---

**Criado em:** 24/05/2026  
**Responsável:** Jussie  
**Próxima revisão:** 31/05/2026 (fim do sprint)
