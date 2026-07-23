# Arquitetura de visão

O protótipo atual usa MediaPipe Face Mesh e publica posição normalizada via MQTT.

## Próximos passos

- encapsular como serviço com health check;
- documentar câmera, FPS e latência;
- distinguir presença, rastreamento e reconhecimento;
- evitar reconhecimento de identidade por padrão;
- definir retenção zero para frames, salvo consentimento explícito;
- integrar ao orbe sem acionar hardware crítico diretamente.
