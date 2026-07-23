# Arquitetura de hardware

## Implementado

ESP32-S3 com Wi-Fi/MQTT, servo contínuo, homing e fins de curso para mecanismo do case.

## Planejado, ainda não comprovado no firmware atual

- DHT22;
- fans PWM;
- WS2812B;
- telemetria elétrica;
- múltiplos dispositivos residenciais.

## Requisitos de segurança física

- fim de curso e timeout independentes;
- estado seguro após reboot;
- comando com expiração;
- watchdog;
- acionamento manual local;
- proteção elétrica e isolamento apropriados;
- ack após execução real.

## Cadastro de capacidades

Cada dispositivo deve anunciar firmware, capacidades, versão do contrato e estado de saúde.
