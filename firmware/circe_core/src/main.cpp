#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>
#include "secrets.h"

WiFiClient espClient;
PubSubClient client(espClient);
Servo roofServo;

// ==========================================
// CONFIGURAÇÃO DE PINOS
// ==========================================
// Pino de SINAL do Servo MG996R (Fio Laranja/Amarelo)
const int PIN_SERVO_ROOF = 15;

// Pinos dos Switches (Chaves de Fim de Curso originais)
// Conecte um lado da chave ao GND e o outro a este pino (usa PULLUP interno)
const int PIN_SWITCH_OPEN = 4;
const int PIN_SWITCH_CLOSED = 5;

// ==========================================
// CONTROLE DO SERVO 360
// ==========================================
enum RoofState { ROOF_STOPPED, ROOF_OPENING, ROOF_CLOSING };
RoofState currentRoofState = ROOF_STOPPED;
unsigned long motorStartTime = 0;

// Timeout de segurança: 15 segundos para dar tempo de sobra.
const unsigned long MOTOR_TIMEOUT_MS = 15000; 

// Valores em microssegundos para servo de rotação contínua
const int SERVO_STOP = 1500;
// Usando força e velocidade MÁXIMAS para o MG996R vencer o peso das aletas
const int SERVO_FORWARD = 2000; // Força máxima (abrir)
const int SERVO_REVERSE = 1000; // Força máxima (fechar)

void stopRoofMotor() {
  roofServo.writeMicroseconds(SERVO_STOP);
  currentRoofState = ROOF_STOPPED;
  Serial.println("Motor do teto PARADO.");
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("Comando MQTT [");
  Serial.print(topic);
  Serial.print("] -> ");
  Serial.println(message);

  if (String(topic) == "alx/case/servos/angle") {
    int angleCommand = message.toInt();
    
    // Como o dashboard manda 180 (aberto) e 0 (fechado)
    if (angleCommand > 90) {
      Serial.println("Ação: ABRIR ALETAS");
      currentRoofState = ROOF_OPENING;
      roofServo.writeMicroseconds(SERVO_FORWARD);
      motorStartTime = millis();
    } else {
      Serial.println("Ação: FECHAR ALETAS");
      currentRoofState = ROOF_CLOSING;
      roofServo.writeMicroseconds(SERVO_REVERSE);
      motorStartTime = millis();
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Tentando conexão MQTT...");
    if (client.connect("ESP32_Alienware_ALX")) {
      Serial.println("conectado");
      client.publish("alx/status", "ESP32 Alienware online (Roof Ready)");
      client.subscribe("alx/case/servos/angle");
    } else {
      Serial.print("falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(2000); // Quirk do ESP32 para USB-CDC
  
  // Configuração dos Switches com resistor de Pull-up interno.
  // Assim a leitura normal é HIGH. Quando você aperta a chave, fecha contato com GND e vai para LOW.
  pinMode(PIN_SWITCH_OPEN, INPUT_PULLUP);
  pinMode(PIN_SWITCH_CLOSED, INPUT_PULLUP);
  
  // Configuração do Servo MG996R
  roofServo.setPeriodHertz(50); 
  roofServo.attach(PIN_SERVO_ROOF, 500, 2500);
  stopRoofMotor(); // Força parada imediata ao ligar

  setup_wifi();
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // ==========================================
  // LOOP DE SEGURANÇA (MOTOR WATCHDOG)
  // ==========================================
  if (currentRoofState != ROOF_STOPPED) {
    unsigned long elapsed = millis() - motorStartTime;
    
    // Leitura: LOW significa que a chave mecânica foi encostada/fechada.
    bool isFullyOpen = (digitalRead(PIN_SWITCH_OPEN) == LOW);
    bool isFullyClosed = (digitalRead(PIN_SWITCH_CLOSED) == LOW);
    
    if (currentRoofState == ROOF_OPENING && isFullyOpen) {
      Serial.println("SENSOR DE FIM DE CURSO: ALETAS TOTALMENTE ABERTAS");
      stopRoofMotor();
    } 
    else if (currentRoofState == ROOF_CLOSING && isFullyClosed) {
      Serial.println("SENSOR DE FIM DE CURSO: ALETAS TOTALMENTE FECHADAS");
      stopRoofMotor();
    } 
    else if (elapsed > MOTOR_TIMEOUT_MS) {
      Serial.println("!!! TIMEOUT DE SEGURANÇA !!! Motor desligado para evitar quebra mecânica.");
      stopRoofMotor();
    }
  }
}
