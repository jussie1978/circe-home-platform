# SPRINT 000 — Relatório Final
**Data de conclusão:** 24/06/2026
**Duração real:** ~32 dias (24/05 a 24/06/2026) — estimado: 7 dias
**Custo real hardware:** ~R$ 120 (orçado: R$ 68–120)
**Status:** ✅ CONCLUÍDO

---

## O que foi entregue

### Documentação (100%)
- [x] SPEC-001-PLATFORM v1.2 — realinhamento completo com hardware real
- [x] ADR-001 a ADR-008 — todas as decisões arquiteturais formalizadas
- [x] IRIS-IDENTITY v2.0 — assistente pessoal completo
- [x] COMPONENTS-LIST — inventário e compras
- [x] SPEC-002-UI-UX — Interface Viva
- [x] DECISAO-SWIMLANE-FRONTEND — fluxo Grok/Claude
- [x] Kit de governança Grok (briefing, template, checklist)
- [x] QUADRO-ORGANIZACAO.md — documento vivo de status

### Hardware
- [x] Inspeção física completa do case Alienware ALX
- [x] Componentes R1.0 encomendados e **recebidos**: DHT22 x2, kit 600 resistores, kit protoboard+jumpers, fan dummy 3-pin
- [x] Daughterboard original confirmada removida — ESP32 S3 como controlador único

### Ambiente de desenvolvimento (100% validado)
- [x] Backend FastAPI rodando localmente (`/health` funcional)
- [x] Mosquitto instalado, configurado para rede (não só localhost) e testado
- [x] Firewall do Windows liberado para porta MQTT
- [x] Arduino IDE configurado com ESP32 S3 + bibliotecas necessárias
- [x] Configuração de board corrigida e documentada (Flash 8MB, PSRAM OPI, USB CDC Enabled)
- [x] **Hello World ESP32 S3 + MQTT validado end-to-end**

---

## Decisões técnicas tomadas (sessão de fechamento)

| Decisão | Justificativa |
|---------|---------------|
| `delay(2000)` obrigatório após `Serial.begin()` em todo firmware do projeto | USB-CDC nativo do ESP32 S3 precisa de tempo de estabilização — sem isso, mensagens iniciais se perdem |
| Configuração fixa de board (Flash 8MB, PSRAM OPI, USB CDC Enabled) | Única configuração que corresponde ao hardware real da placa (8MB PSRAM físico confirmado no log do esptool) |
| Mosquitto com `listener 1883 0.0.0.0` | Configuração padrão só aceita localhost — ESP32 é um dispositivo externo na rede e precisa de acesso explícito |
| Regra de firewall dedicada para porta 1883 | Previne bloqueio silencioso de conexões MQTT de dispositivos IoT na rede local |

---

## Problemas encontrados e como foram resolvidos

Esta foi a sessão mais longa de troubleshooting do projeto até agora. Quatro problemas reais e independentes se acumularam:

### 1. Serial Monitor completamente vazio
**Sintoma:** Upload bem-sucedido, LED piscando (firmware rodando), mas nenhuma linha aparecia no Serial Monitor, mesmo lendo a porta diretamente via PowerShell (fora do Arduino IDE).
**Diagnóstico:** Testamos um sketch mínimo (`Serial.println` em loop simples) — funcionou imediatamente. Isso isolou o problema ao código original.
**Causa raiz:** Faltava um delay de estabilização entre `Serial.begin()` e o primeiro `Serial.print()`. A USB-CDC nativa do ESP32 S3 (diferente de placas com chip CP2102/CH340 externo) precisa de ~2 segundos para o host reconhecer a interface serial.
**Resolução:** Adicionado `delay(2000)` logo após `Serial.begin(115200)`.

### 2. Upload falhando com "porta ocupada"
**Sintoma:** `Could not open COM7, the port is busy or doesn't exist`, mesmo com Serial Monitor fechado.
**Causa raiz:** A porta COM atribuída pelo Windows mudava ao reconectar o cabo USB em uma entrada diferente, mas o Arduino IDE continuava configurado para a porta antiga.
**Resolução:** Confirmar e reselecionar a porta em Tools → Port a cada reconexão física do cabo.

### 3. Configuração de board incorreta
**Sintoma:** Suspeita inicial de travamento no boot (acabou não sendo a causa principal, mas configuração estava mesmo errada).
**Causa raiz:** Flash Size configurado como 4MB quando o chip real tem 8MB (confirmado no log do esptool: `Embedded PSRAM 8MB`); PSRAM configurado como Disabled quando a placa tem PSRAM física.
**Resolução:** Flash Size → 8MB (64Mb), PSRAM → OPI PSRAM, USB CDC On Boot → Enabled.

### 4. MQTT falhando com rc=-2
**Sintoma:** WiFi conectava normalmente, mas a conexão MQTT falhava repetidamente com código -2 (`MQTT_CONNECT_FAILED`).
**Causa raiz:** Mosquitto, por padrão, inicia em "local only mode" — só aceita conexões da própria máquina (127.0.0.1). O ESP32, sendo um dispositivo externo na rede, era rejeitado na camada TCP antes mesmo de tentar o handshake MQTT.
**Resolução:** Criado `mosquitto.conf` com `listener 1883 0.0.0.0` e `allow_anonymous true`; serviço reiniciado; regra de firewall adicionada para a porta 1883.

---

## Estado atual do código

```
circe-home-platform/
├── backend/
│   ├── app/main.py              ← FastAPI com /health (já existia)
│   ├── venv/
│   └── requirements.txt
├── firmware/
│   └── circe_hello_world/
│       └── circe_hello_world.ino   ← NOVO — validado, pendente commit
├── frontend/
│   └── src/components/OrbCanvas.tsx  (lane paralela, R2.0)
└── docs/
    ├── (toda a documentação core, ver QUADRO-ORGANIZACAO.md)
    └── SPRINT-000-REPORT.md     ← este arquivo
```

**Commits pendentes que Jussie precisa fazer:**
```bash
# 1. Sketch do Hello World
mkdir -p firmware/circe_hello_world
cp circe_hello_world.ino firmware/circe_hello_world/
git add firmware/
git commit -m "feat: ESP32 S3 hello world MQTT validated end-to-end"

# 2. Relatório e quadro atualizados
cp SPRINT-000-REPORT.md docs/
cp QUADRO-ORGANIZACAO.md docs/   # ou onde estiver mantido no seu repo
git add docs/SPRINT-000-REPORT.md docs/QUADRO-ORGANIZACAO.md
git commit -m "docs: close Sprint 000 — lessons learned and final report"
git push
```

---

## Métricas finais

| Métrica | Estimado | Real |
|---------|----------|------|
| Duração | 7 dias | ~32 dias |
| Custo hardware | R$ 68–120 | ~R$ 120 |
| Bugs/bloqueadores encontrados | 0 (estimativa otimista) | 4 (todos resolvidos) |
| Commits relacionados ao sprint | ≥ 5 | a confirmar no repositório |

**Nota sobre o desvio de prazo:** a duração real foi significativamente maior que a estimativa original. Isso não indica falha de execução — dois fatores justificam o desvio: (1) o realinhamento completo de hardware no Dia 2, que descobriu componentes não documentados e exigiu reescrita de SPEC + 2 ADRs novas; (2) a sessão de troubleshooting de ambiente no fechamento, que revelou 4 problemas reais de configuração que precisavam ser resolvidos uma única vez. Ambos geraram conhecimento reutilizável documentado nas lições aprendidas — não foi tempo perdido, foi descoberta de informação que a SPEC original não tinha.

---

## Pendências e débitos técnicos identificados

| Item | Prioridade | Nota |
|------|-----------|------|
| Commit do sketch Hello World | Alta | Pendente — ver comandos acima |
| Commit deste relatório e quadro atualizado | Alta | Pendente — ver comandos acima |
| Replanejar prazo da R1.0 | Média | Prazo original (22/06) já passou |
| ADR-007 — confirmar conteúdo | Baixa | Aparece no quadro mas conteúdo não foi revisado nesta sessão |

---

## Status Sprint 001 (R1.0 Foundation)

- [x] Componentes chegaram e foram validados
- [x] Ambiente de desenvolvimento 100% funcional e documentado
- [x] Pronto para iniciar montagem física na bancada

**Próximo passo imediato:** montar o circuito de testes na bancada (ESP32 S3 + DHT22 + divisor de tensão PS_ON# + fan PWM) e validar os 4 cenários térmicos descritos na ADR-004.
