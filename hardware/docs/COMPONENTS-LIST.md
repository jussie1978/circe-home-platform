# Lista de Componentes — CIRCE Home Platform

**Última atualização:** 24/05/2026  
**Release:** 1.0 Foundation  
**Orçamento máximo:** R$ 250  
**Status:** 🟡 Pesquisa pendente (preencher preços reais)

---

## Release 1.0 — Componentes Obrigatórios

### Microcontrolador

| Componente | Qtd | Especificação Mínima | Loja Sugerida | Preço Est. | Link | Status |
|------------|-----|----------------------|---------------|------------|------|--------|
| **ESP32 DevKit V1** | 2 | 30 pinos, WiFi+BT, 4MB Flash, 3.3V | Eletrogate | R$ 45/un | — | ⚪ |

> ⚠️ Comprar **2 unidades** — 1 para uso, 1 reserva (defeito de fábrica é comum em genéricos)

**Datasheet:** [ESP32 Datasheet Espressif](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf)  
**Pinout:** [ESP32 DevKit V1 Pinout](https://randomnerdtutorials.com/esp32-pinout-reference-gpios/)

---

### Sensores

| Componente | Qtd | Especificação | Loja Sugerida | Preço Est. | Link | Status |
|------------|-----|---------------|---------------|------------|------|--------|
| **DHT22** | 1 | Temp: -40~80°C (±0.5°C), 3.3–6V, protocolo 1-wire | Baú Eletrônica | R$ 28 | — | ⚪ |

**Validação de compatibilidade:**
- Tensão de operação: 3.3V–6V ✅ (GPIO ESP32 = 3.3V)
- Pull-up resistor: necessário 10kΩ entre DATA e VCC
- Tempo de resposta: 2s entre leituras (suficiente para nosso loop)

**Pinout DHT22:**
```
Pino 1 (VCC)  → 3.3V ESP32
Pino 2 (DATA) → GPIO4 ESP32 + resistor 10kΩ para VCC
Pino 3 (NC)   → não conectar
Pino 4 (GND)  → GND ESP32
```

---

### Atuadores

| Componente | Qtd | Especificação | Loja Sugerida | Preço Est. | Link | Status |
|------------|-----|---------------|---------------|------------|------|--------|
| **Módulo Relé 2 Canais 5V** | 1 | Optoacoplado, 10A/250VAC, trigger LOW ativo | Eletrogate | R$ 18 | — | ⚪ |

> ⚠️ **Obrigatório: optoacoplado** — isola eletricamente ESP32 da carga (sem isso, o ESP32 pode resetar ao acionar)

**Fiação do relé:**
```
Módulo Relé (lógica):
  VCC  → 5V (fonte externa)
  GND  → GND comum
  IN1  → GPIO5 (ESP32) — fan principal
  IN2  → GPIO18 (ESP32) — reserva R2.0

Carga fan 12V:
  Fan+ → Fonte 12V positivo
  Fan- → COM do relé
  Relé → NO (Normally Open) conecta ao GND 12V
```

---

### Indicadores Visuais

| Componente | Qtd | Especificação | Loja Sugerida | Preço Est. | Link | Status |
|------------|-----|---------------|---------------|------------|------|--------|
| **LED 5mm Verde difuso** | 2 | 3V, 20mA | Baú Eletrônica | R$ 2 | — | ⚪ |
| **LED 5mm Vermelho difuso** | 2 | 3V, 20mA | Baú Eletrônica | R$ 2 | — | ⚪ |
| **Resistor 220Ω** | 10 | 1/4W, tolerância 5% | Baú Eletrônica | R$ 5 | — | ⚪ |

**Cálculo do resistor:**
```
V_gpio = 3.3V  (saída GPIO ESP32)
V_led  = 2.0V  (tensão direta típica LED vermelho/verde)
I_led  = 20mA  (corrente máxima)

R = (V_gpio - V_led) / I_led
R = (3.3 - 2.0) / 0.020
R = 65Ω → usar 220Ω (corrente ~6mA, LED mais dimmer mas seguro)
```

---

### Protoboard e Interconexão

| Componente | Qtd | Especificação | Loja Sugerida | Preço Est. | Link | Status |
|------------|-----|---------------|---------------|------------|------|--------|
| **Protoboard 830 pontos** | 1 | 16.5×5.5cm, sem solda | Eletrogate | R$ 15 | — | ⚪ |
| **Jumpers Macho-Fêmea** | 40 | 20cm, coloridos | Baú Eletrônica | R$ 12 | — | ⚪ |
| **Jumpers Macho-Macho** | 40 | 20cm, coloridos | Baú Eletrônica | R$ 10 | — | ⚪ |
| **Resistor 10kΩ** | 5 | 1/4W (pull-up DHT22) | Baú Eletrônica | R$ 3 | — | ⚪ |

---

### Alimentação

| Componente | Qtd | Especificação | Loja Sugerida | Preço Est. | Link | Status |
|------------|-----|---------------|---------------|------------|------|--------|
| **Fonte 5V 3A** | 1 | Para ESP32 + módulo relé | Eletrogate | R$ 25 | — | ⚪ |
| **Fonte 12V 2A** | 1 | Para fans do case (verificar se já tem) | Baú Eletrônica | R$ 30 | — | ⚪ |

> 💡 **Dica:** Se tiver fonte ATX velha (PC antigo), use os fios amarelos (+12V) e pretos (GND) para alimentar os fans. Economiza R$ 30.

---

## Resumo Financeiro R1.0

| Categoria | Estimativa | Real |
|-----------|------------|------|
| Microcontroladores (2x ESP32) | R$ 90 | R$ ___ |
| Sensores (DHT22) | R$ 28 | R$ ___ |
| Atuadores (módulo relé) | R$ 18 | R$ ___ |
| LEDs + resistores | R$ 9 | R$ ___ |
| Protoboard + jumpers | R$ 37 | R$ ___ |
| Alimentação | R$ 55 | R$ ___ |
| Frete estimado | R$ 25 | R$ ___ |
| **TOTAL** | **R$ 262** | **R$ ___** |

---

## Release 2.0 — Componentes Adicionais (Orçar Agora, Comprar Depois)

| Componente | Qtd | Especificação | Preço Est. |
|------------|-----|---------------|------------|
| **Fita LED WS2812B** | 5m | 60 LEDs/m, IP30, 5V | R$ 80 |
| **MOSFET IRLZ44N** | 4 | PWM fans (controle velocidade) | R$ 8/un |
| **Capacitor 1000µF 16V** | 2 | Desacoplamento fita LED | R$ 5/un |
| **Resistor 300-500Ω** | 5 | Proteção linha data WS2812B | R$ 1/un |

---

## Ferramentas Necessárias

| Ferramenta | Já Possui? | Onde Comprar | Preço Est. |
|------------|------------|--------------|------------|
| **Ferro de solda 30W** | [ ] SIM [ ] NÃO | Eletrogate | R$ 40 |
| **Suporte + esponja** | [ ] SIM [ ] NÃO | Eletrogate | R$ 15 |
| **Estanho 60/40 1mm** | [ ] SIM [ ] NÃO | Baú Eletrônica | R$ 12 |
| **Multímetro digital** | [ ] SIM [ ] NÃO | Baú Eletrônica | R$ 50 |
| **Alicate de corte** | [ ] SIM [ ] NÃO | Ferragens | R$ 25 |
| **Alicate de bico fino** | [ ] SIM [ ] NÃO | Ferragens | R$ 20 |

---

## Fornecedores Avaliados

| Loja | Confiabilidade | Frete SP | Prazo | Observações |
|------|----------------|----------|-------|-------------|
| **Eletrogate** | ⭐⭐⭐⭐⭐ | R$ 15–25 | 5–7 dias | Componentes de qualidade, bom suporte |
| **Baú da Eletrônica** | ⭐⭐⭐⭐⭐ | R$ 12–20 | 5–7 dias | Melhor preço em passivos (resistores, LEDs) |
| **FilipeFlop** | ⭐⭐⭐⭐ | R$ 15–25 | 5–8 dias | Boa variedade de módulos |
| **Mercado Livre** | ⭐⭐⭐ (varia) | Grátis (Full) | 3–10 dias | Comparar preços, verificar vendedor |
| **AliExpress** | ⭐⭐⭐ | Grátis | 30–60 dias | ❌ Lento demais para este projeto |

---

## Registro de Pedidos

| Data | Loja | Itens | Valor | Pedido # | Tracking | Previsão |
|------|------|-------|-------|----------|----------|----------|
| — | — | — | — | — | — | — |

---

## Checklist Pré-Compra

```
[ ] DHT22 aceita 3.3V? (SIM — range 3.3–6V)
[ ] Módulo relé é optoacoplado? (VERIFICAR no anúncio)
[ ] ESP32 é DevKit V1 com 30 pinos? (não 38 pinos)
[ ] Fonte 5V tem corrente mínima de 3A? (ESP32 + relé)
[ ] Já tenho fonte 12V para os fans? (verificar no case)
[ ] Fans do case são 3-pin ou 4-pin? (medir e anotar aqui: ___)
[ ] Tenho ferro de solda e multímetro? (ferramentas checklist acima)
[ ] Frete consolidado em 1 loja é mais barato que 2 lojas?
```

---

## Referências e Datasheets

- [ESP32 DevKit V1 Pinout (RandomNerdTutorials)](https://randomnerdtutorials.com/esp32-pinout-reference-gpios/)
- [DHT22 Datasheet (SparkFun)](https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf)
- [DHT Sensor Library (Adafruit GitHub)](https://github.com/adafruit/DHT-sensor-library)
- [PubSubClient MQTT ESP32 (GitHub)](https://github.com/knolleary/pubsubclient)
- [Relay Module Wiring Guide (CircuitBasics)](https://www.circuitbasics.com/setting-up-a-5v-relay-on-the-arduino/)
- [WS2812B LED Strip Guide (RandomNerdTutorials)](https://randomnerdtutorials.com/guide-for-ws2812b-addressable-rgb-led-strip-with-arduino/)
