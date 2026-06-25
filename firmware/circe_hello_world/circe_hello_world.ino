/*
 * CIRCE Home Platform — Hello World ESP32 S3
 * Sprint 000 — Validação de ambiente
 *
 * Objetivo: confirmar que o ESP32 S3 conecta ao WiFi,
 * pisca o LED onboard, e publica/recebe via MQTT.
 *
 * STATUS: ✅ Validado end-to-end em 24/06/2026
 *
 * LIÇÕES APRENDIDAS (ver QUADRO-ORGANIZACAO.md para detalhes completos):
 *
 * 1. delay(2000) após Serial.begin() é OBRIGATÓRIO em ESP32 S3 com USB
 *    nativo (USB-Serial/JTAG). Sem isso, as mensagens de boot inicial
 *    (incluindo toda a conexão WiFi) se perdem silenciosamente, mesmo
 *    que o firmware esteja funcionando corretamente.
 *
 * 2. Configuração de board necessária (Arduino IDE → Tools):
 *    - Flash Size: 8MB (64Mb)       [NÃO usar o padrão 4MB]
 *    - PSRAM: OPI PSRAM             [chip tem PSRAM física embarcada]
 *    - USB CDC On Boot: Enabled     [necessário para Serial via USB nativo]
 *    Sem essas 3 configs corretas, o ESP32 trava silenciosamente após
 *    o boot do ROM, sem nunca chegar ao setup().
 *
 * 3. Mosquitto no Windows precisa de mosquitto.conf customizado:
 *    listener 1883 0.0.0.0
 *    allow_anonymous true
 *    (config padrão só aceita conexões "local only", bloqueando o ESP32)
 *
 * 4. Firewall do Windows precisa de regra de entrada para porta 1883.
 */

#include <WiFi.h>
#include <PubSubClient.h>

// --- Credenciais WiFi ---
const char* ssid     = "VIVOFIBRA-WIFI6-6138";
const char* password = "4uqPnniikuoYinU";

// --- Configuração MQTT ---
const char* mqttServer = "192.168.15.51";  // IP do PC rodando Mosquitto
const int   mqttPort   = 1883;

WiFiClient   espClient;
PubSubClient client(espClient);

// LED onboard do ESP32 S3
#define LED_PIN 48

unsigned long lastBlink = 0;
unsigned long lastPublish = 0;
bool ledState = false;

void setup() {
  Serial.begin(115200);
  delay(2000);  // CRÍTICO: estabiliza USB-CDC antes de qualquer print

  pinMode(LED_PIN, OUTPUT);

  Serial.println("=== CIRCE Home Platform - Hello World ===");
  Serial.print("Conectando ao WiFi");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi conectado! IP do ESP32: ");
  Serial.println(WiFi.localIP());

  client.setServer(mqttServer, mqttPort);
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Conectando ao MQTT...");
    if (client.connect("ESP32S3_CIRCE")) {
      Serial.println(" conectado!");
      client.publish("alx/status", "online");
    } else {
      Serial.print(" falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 3s");
      delay(3000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  // Pisca o LED a cada 500ms (não bloqueante)
  if (millis() - lastBlink > 500) {
    lastBlink = millis();
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
  }

  // Publica heartbeat MQTT a cada 5s
  if (millis() - lastPublish > 5000) {
    lastPublish = millis();
    client.publish("alx/test", "IRIS online - ESP32 S3 funcionando");
    Serial.println("Publicado: alx/test");
  }
}
