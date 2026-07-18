#!/usr/bin/env python3
import time
import json
import math
import random
import argparse
import paho.mqtt.client as mqtt

def main():
    parser = argparse.ArgumentParser(description="Simulador de Inputs MQTT para a CIRCE Home Platform (IRIS)")
    parser.add_argument("--host", default="localhost", help="Host do Broker MQTT (default: localhost)")
    parser.add_argument("--port", type=int, default=1883, help="Porta do Broker MQTT (default: 1883)")
    parser.add_argument("--interval", type=float, default=2.0, help="Intervalo de envio em segundos (default: 2.0)")
    args = parser.parse_args()

    print(f"Iniciando Simulação de Inputs MQTT...")
    print(f"Conectando ao Broker: {args.host}:{args.port}")
    
    try:
        # Compatibilidade com paho-mqtt v1 e v2
        try:
            client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
        except AttributeError:
            client = mqtt.Client()
            
        client.connect(args.host, args.port, keepalive=60)
        client.loop_start()
        print("Conectado com sucesso. Enviando dados simulados (pressione Ctrl+C para parar)...")
    except Exception as e:
        print(f"Erro ao conectar no Broker MQTT: {e}")
        print("Certifique-se de que o Mosquitto está rodando localmente na porta 1883.")
        return

    # Frases de voz simuladas
    voice_phrases = [
        "Ajustando velocidade das aletas para otimizar exaustão térmica.",
        "Acelerando coolers do case Alienware para 80% devido à carga de processamento.",
        "Varredura de câmera local não identificou intrusos na área do console.",
        "Temperatura interna estabilizada em níveis seguros de operação.",
        "Padrão de cores RGB sincronizado com o perfil personalizado do usuário.",
        "Visão computacional ativa. Rastreando face do usuário."
    ]

    counter = 0
    try:
        while True:
            # 1. Telemetria Simulada
            temp = round(38.0 + math.sin(counter * 0.05) * 5.0 + random.random() * 0.5, 1)
            humidity = round(55.0 - math.sin(counter * 0.05) * 8.0 + random.random() * 0.5, 1)
            
            client.publish("alx/case/temperature", str(temp))
            client.publish("alx/case/humidity", str(humidity))
            print(f"[{counter}] Enviado -> Temp: {temp}°C | Umid: {humidity}%")

            # 2. Visão (Rastreamento Facial)
            face_x = round(math.sin(counter * 0.2), 3)
            face_y = round(math.cos(counter * 0.3) * 0.4, 3)
            face_payload = json.dumps({
                "faceDetected": True,
                "faceX": face_x,
                "faceY": face_y
            })
            client.publish("alx/vision/face", face_payload)
            print(f"[{counter}] Enviado -> Face: x={face_x}, y={face_y}")

            # 3. Voz (IRIS Fala a cada 10 ciclos)
            if counter % 10 == 0:
                iris_state = "speaking"
                phrase = random.choice(voice_phrases)
                voice_payload = json.dumps({
                    "irisState": iris_state,
                    "text": phrase
                })
                client.publish("alx/voice/state", voice_payload)
                print(f"[{counter}] Enviado -> Voz (IRIS): State={iris_state} | Text='{phrase}'")
                
                # Deixa falando por 4 segundos, depois volta a idle
                time.sleep(4.0)
                client.publish("alx/voice/state", json.dumps({"irisState": "idle", "text": ""}))
                print(f"[{counter}] Enviado -> Voz (IRIS): State=idle")

            counter += 1
            time.sleep(args.interval)

    except KeyboardInterrupt:
        print("\nSimulação finalizada pelo usuário.")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()
