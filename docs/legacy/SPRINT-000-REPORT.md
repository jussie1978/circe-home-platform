# SPRINT 000 — Relatório Final

**Data conclusão:** 24/05/2026
**Horas reais:** ~6h (estimado: 7h)
**Custo real hardware:** R$ ~120 (orçado: R$ 68–120)
**Status:** ✅ Concluído (com exceção do Hello World ESP32 S3 — ver pendências)

---

## O que foi entregue

### Documentação
- [x] Repositório GitHub privado criado e estruturado
- [x] SPEC-001-PLATFORM v1.2 — realinhamento completo com hardware real
- [x] ADR-001 — FastAPI (sem alteração)
- [x] ADR-002 v1.1 — MQTT atualizado (tópicos fins, leds/ceiling, pc_state, fans/rpm)
- [x] ADR-003 — SQLite (sem alteração)
- [x] ADR-004 v1.0 — Arquitetura elétrica e coexistência com ROG Z390-F
- [x] ADR-005 v1.0 — Substituição daughterboard proprietária por ESP32 S3
- [x] IRIS-IDENTITY v2.0 — hardware correto, system prompt assistente pessoal completo
- [x] COMPONENTS-LIST v1.0 — inventário real + lista de compras enxuta
- [x] SPRINT-000-setup v1.1 — status real, tarefas obsoletas removidas

### Hardware
- [x] Inspeção física completa do case Alienware Area-51 ALX
- [x] Fans confirmados: 2x 4-pin PWM Dell DP/N 0R702R
- [x] Hardware instalado confirmado: servo MG996R 360° + 2x fins de curso + 2x fitas WS2812B 17 LEDs
- [x] Daughterboard original confirmada removida
- [x] Componentes R1.0 encomendados (DHT22 x2, kit resistores 600 peças, kit protoboard+jumpers, fan dummy 3-pin)

### Ambiente de desenvolvimento
- [x] Backend FastAPI rodando localmente (localhost:8000/docs)
- [x] Swagger gerado automaticamente confirmado no browser
- [x] requirements.txt criado

### Pendente (mover para Sprint 001)
- [ ] Mosquitto instalado e testado localmente
- [ ] Arduino IDE configurado com board ESP32 S3
- [ ] Hello World ESP32 S3 + MQTT validado
- [ ] git commit do backend scaffold

---

## Decisões técnicas tomadas

| Decisão | Justificativa | ADR |
|---------|---------------|-----|
| Fans 4-pin PWM — relé eliminado | Descoberta na inspeção física | ADR-004 |
| ESP32 alimentado por 5VSB | IRIS 24/7, Wake-on-Voice R4.0 | ADR-004 |
| ESP32 S3 em vez de DevKit V1 | Hardware superior já disponível | ADR-005 |
| Daughterboard substituída por ESP32 S3 | Proprietária incompatível, já removida | ADR-005 |
| Servo MG996R 360° + fim de curso | Rotação contínua + feedback de posição | ADR-005 |
| WS2812B teto em R1.0 (não R2.0) | Hardware já instalado fisicamente | SPEC v1.2 |
| Aletas do teto em R1.0 | Hardware já instalado fisicamente | SPEC v1.2 |
| IRIS como assistente pessoal completo | Visão ampliada (não só controlador) | IRIS-IDENTITY v2.0 |
| DS18B20 descartado para R1.0 | DHT22 cobre temperatura + umidade | COMPONENTS-LIST |

---

## Problemas encontrados e resoluções

| Problema | Resolução |
|----------|-----------|
| SPEC original incompleta (hardware real não documentado) | Realinhamento completo via inspeção física no Dia 2 |
| Código Python colado no PowerShell em vez de arquivo | Criado arquivo main.py via New-Item + VS Code |
| DHT22 indisponível na Eletrogate | Comprado no Baú da Eletrônica (disponível, R$ 22,82 via Pix) |
| Kit resistores sem valor 20kΩ exato | 22kΩ aprovado — diferença de 3.33V → 3.26V, dentro da margem segura |

---

## Estado atual do código

```
circe-home-platform/
├── backend/
│   ├── app/
│   │   └── main.py          ← FastAPI scaffold com /health
│   ├── venv/                ← Ambiente virtual Python 3.12
│   └── requirements.txt     ← fastapi, uvicorn, sqlalchemy, pydantic, paho-mqtt, pytest
├── docs/
│   ├── SPEC-001-PLATFORM.md (v1.2)
│   ├── IRIS-IDENTITY.md (v2.0)
│   ├── COMPONENTS-LIST.md
│   ├── adrs/
│   │   ├── ADR-001-fastapi-choice.md
│   │   ├── ADR-002-mqtt-architecture.md (v1.1)
│   │   ├── ADR-003-sqlite-initial-db.md
│   │   ├── ADR-004-electrical-architecture.md
│   │   └── ADR-005-daughterboard-replacement.md
│   └── sprints/
│       └── SPRINT-000-setup.md (v1.1)
└── .gitignore
```

**Commit pendente:**
```bash
git add backend/
git commit -m "feat: backend FastAPI scaffold with /health endpoint"
git push
```

---

## Lições aprendidas

- Inspeção física do hardware antes de documentar evita retrabalho — a SPEC original tinha hardware errado
- Hardware já instalado (servo, fins de curso, ARGB) deve entrar em R1.0, não em releases futuras
- Não colar código Python no PowerShell — sempre criar arquivo pelo editor

---

## Status Sprint 001

- [ ] Componentes chegaram? Data estimada: ~03–06/06/2026
- [ ] Pronto para iniciar montagem física: aguardando componentes
- [ ] Mosquitto e Arduino IDE: pode configurar antes dos componentes chegarem
