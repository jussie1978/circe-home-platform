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

// Pinos dos Switches (Chaves de Fim de Curso)
const int PIN_SWITCH_OPEN = 4;
const int PIN_SWITCH_CLOSED = 5;

// ==========================================
// CONTROLE DO SERVO 360 (PROPORCIONAL)
// ==========================================
enum RoofState { ROOF_STOPPED, ROOF_OPENING, ROOF_CLOSING, ROOF_HOMING };
RoofState currentRoofState = ROOF_STOPPED;

// Tempo total de viagem do teto medido pelo usuário (15 segundos)
const unsigned long TOTAL_TRAVEL_TIME_MS = 15000; 

long currentPositionMs = 0; // Posição atual estimada (0 a 15000)
long targetPositionMs = 0;  // Para onde queremos ir
unsigned long lastLoopTime = 0;

// Valores em microssegundos para servo de rotação contínua
const int SERVO_STOP = 1500;
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
  Serial.println("WiFi conectado!");
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
    // Agora o dashboard manda 0 a 100 (%)
    int percent = message.toInt();
    if(percent < 0) percent = 0;
    if(percent > 100) percent = 100;
    
    // Converte a porcentagem para tempo alvo
    targetPositionMs = (percent * TOTAL_TRAVEL_TIME_MS) / 100;
    
    Serial.print("Novo Target %: ");
    Serial.print(percent);
    Serial.print(" | Target MS: ");
    Serial.println(targetPositionMs);

    if (currentRoofState == ROOF_HOMING) {
      Serial.println("Ignorando comando: Realizando Homing (Calibracao inicial).");
      return;
    }

    if (targetPositionMs > currentPositionMs) {
      if (currentRoofState != ROOF_OPENING) {
        currentRoofState = ROOF_OPENING;
        roofServo.writeMicroseconds(SERVO_FORWARD);
        Serial.println("Comando: ABRINDO...");
      }
    } else if (targetPositionMs < currentPositionMs) {
      if (currentRoofState != ROOF_CLOSING) {
        currentRoofState = ROOF_CLOSING;
        roofServo.writeMicroseconds(SERVO_REVERSE);
        Serial.println("Comando: FECHANDO...");
      }
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Tentando conexão MQTT...");
    if (client.connect("ESP32_Alienware_ALX")) {
      Serial.println("conectado");
      // Avisa o Frontend do nosso estado atual
      if(currentRoofState == ROOF_HOMING) {
         client.publish("alx/status", "homing");
      } else {
         client.publish("alx/status", "online");
      }
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
  delay(2000); 
  
  pinMode(PIN_SWITCH_OPEN, INPUT_PULLUP);
  pinMode(PIN_SWITCH_CLOSED, INPUT_PULLUP);
  
  roofServo.setPeriodHertz(50); 
  roofServo.attach(PIN_SERVO_ROOF, 500, 2500);
  stopRoofMotor(); 

  setup_wifi();
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);

  // === ROTINA DE HOMING (CALIBRAÇÃO) ===
  bool isClosed = (digitalRead(PIN_SWITCH_CLOSED) == LOW);
  bool isOpen = (digitalRead(PIN_SWITCH_OPEN) == LOW);

  if (isClosed) {
    currentPositionMs = 0;
    targetPositionMs = 0;
    Serial.println("Boot: Teto ja fechado (0%).");
  } else if (isOpen) {
    currentPositionMs = TOTAL_TRAVEL_TIME_MS;
    targetPositionMs = TOTAL_TRAVEL_TIME_MS;
    Serial.println("Boot: Teto ja aberto (100%).");
  } else {
    // Parado no meio do caminho, precisamos nos achar!
    Serial.println("Boot: Posicao desconhecida. Iniciando HOMING (Fechando)...");
    currentRoofState = ROOF_HOMING;
    roofServo.writeMicroseconds(SERVO_REVERSE);
  }
  
  lastLoopTime = millis();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Calcula quanto tempo passou desde a ultima volta do loop
  unsigned long now = millis();
  unsigned long dt = now - lastLoopTime;
  lastLoopTime = now;

  bool isFullyOpen = (digitalRead(PIN_SWITCH_OPEN) == LOW);
  bool isFullyClosed = (digitalRead(PIN_SWITCH_CLOSED) == LOW);

  // Se estiver calibrando (homing)
  if (currentRoofState == ROOF_HOMING) {
    if (isFullyClosed) {
      stopRoofMotor();
      currentPositionMs = 0;
      targetPositionMs = 0;
      Serial.println("HOMING CONCLUIDO! Teto calibrado em 0%.");
      client.publish("alx/status", "online");
    }
    return;
  }

  // Deslocamento estimado por tempo (Dead-Reckoning)
  if (currentRoofState == ROOF_OPENING) {
    currentPositionMs += dt;
    if (currentPositionMs >= targetPositionMs || isFullyOpen) {
      if (isFullyOpen) currentPositionMs = TOTAL_TRAVEL_TIME_MS; // Auto-corrige a precisao
      stopRoofMotor();
    }
  } 
  else if (currentRoofState == ROOF_CLOSING) {
    currentPositionMs -= dt;
    if (currentPositionMs <= targetPositionMs || isFullyClosed) {
      if (isFullyClosed) currentPositionMs = 0; // Auto-corrige a precisao
      stopRoofMotor();
    }
  }
  
  // Limites de segurança contra variaveis malucas
  if(currentPositionMs > TOTAL_TRAVEL_TIME_MS) currentPositionMs = TOTAL_TRAVEL_TIME_MS;
  if(currentPositionMs < 0) currentPositionMs = 0;
}
