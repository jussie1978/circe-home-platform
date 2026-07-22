import asyncio
import json
import random
import logging
from datetime import datetime, timedelta
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .database import engine, SessionLocal, get_db
from . import models
from .mqtt import MQTTManager

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IRIS_BACKEND")

app = FastAPI(
    title="IRIS System API",
    description="Backend para automação residencial do case Alienware ALX e assistente de voz IRIS",
    version="0.3.0"
)

# Configuração de CORS para permitir acesso local do frontend (Vite na porta 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Estado Global Simulado do Sistema
class SystemState:
    def __init__(self):
        self.temperature = 42.0
        self.humidity = 62.5
        self.fan_speed = 60 # 0% a 100%
        self.roof_angle = 90 # 0° a 180°
        self.led_color = "#06B6D4"
        self.led_mode = "breath"
        self.iris_state = "idle" # idle, listening, speaking, critical
        self.connected_clients = set()
        
        # Adições da Release 2.1
        self.face_detected = False
        self.face_x = 0.0
        self.face_y = 0.0
        self.voice_text = ""
        self.fins_state = "closed"

state = SystemState()
mqtt_manager = None
loop = None

# Modelos Pydantic para endpoints REST
class FanControl(BaseModel):
    speed: int

class LedControl(BaseModel):
    color: str

# Funções auxiliares de Banco de Dados
def save_sensor_log(temperature=None, humidity=None):
    db = SessionLocal()
    try:
        # Busca o device principal do case
        device = db.query(models.Device).filter(models.Device.type == "esp32").first()
        if not device:
            device = models.Device(name="Alienware ALX Case", type="esp32", mqtt_topic="alx/case")
            db.add(device)
            db.commit()
            db.refresh(device)
            
        log = models.SensorLog(
            device_id=device.id,
            temperature=temperature,
            humidity=humidity,
            timestamp=datetime.utcnow()
        )
        db.add(log)
        db.commit()
    except Exception as e:
        logger.error(f"Erro ao salvar sensor log no SQLite: {e}")
    finally:
        db.close()

def get_recent_temp_history() -> list:
    db = SessionLocal()
    try:
        # Obtém os últimos 24 registros
        logs = db.query(models.SensorLog)\
                 .filter(models.SensorLog.temperature.isnot(None))\
                 .order_by(models.SensorLog.timestamp.desc())\
                 .limit(24)\
                 .all()
        # Retorna na ordem cronológica (mais antigo primeiro)
        return [log.temperature for log in reversed(logs)]
    except Exception as e:
        logger.error(f"Erro ao recuperar histórico de temperatura: {e}")
        return []
    finally:
        db.close()

# Funções auxiliares para transmissão de eventos WebSocket
async def broadcast_state():
    if not state.connected_clients:
        return
    
    # Obtém histórico do banco
    temp_history = get_recent_temp_history()
    if not temp_history:
        temp_history = [state.temperature]

    payload = json.dumps({
        "temperature": state.temperature,
        "humidity": state.humidity,
        "irisState": state.iris_state,
        "fanSpeed": state.fan_speed,
        "roofAngle": state.roof_angle,
        "ledColor": state.led_color,
        "ledMode": state.led_mode,
        "faceDetected": state.face_detected,
        "faceX": state.face_x,
        "faceY": state.face_y,
        "voiceText": state.voice_text,
        "finsState": state.fins_state,
        "tempHistory": temp_history
    })
    
    # Broadcast assíncrono para todos os clientes conectados
    inactive_connections = []
    for client in state.connected_clients:
        try:
            await client.send_text(payload)
        except Exception:
            inactive_connections.append(client)
          
    for dead_client in inactive_connections:
        if dead_client in state.connected_clients:
            state.connected_clients.remove(dead_client)

# Callback para mensagens recebidas via MQTT
def handle_mqtt_message(topic: str, payload_str: str):
    global loop
    try:
        if topic == "alx/case/temperature":
            val = float(payload_str)
            state.temperature = val
            save_sensor_log(temperature=val)
        elif topic == "alx/case/humidity":
            val = float(payload_str)
            state.humidity = val
            save_sensor_log(humidity=val)
        elif topic == "alx/vision/face":
            data = json.loads(payload_str)
            state.face_detected = data.get("faceDetected", False)
            state.face_x = data.get("faceX", 0.0)
            state.face_y = data.get("faceY", 0.0)
        elif topic == "alx/voice/state":
            data = json.loads(payload_str)
            state.iris_state = data.get("irisState", "idle")
            state.voice_text = data.get("text", "")
        elif topic == "alx/status":
            logger.info(f"Status do dispositivo recebido via MQTT: {payload_str}")
            if "homing" in payload_str.lower():
                state.fins_state = "homing"
            elif "online" in payload_str.lower():
                # Se terminou de calibrar ou ligou, volta ao normal
                if state.roof_angle > 10:
                    state.fins_state = "open"
                else:
                    state.fins_state = "closed"

        # Envia atualização para os clientes WebSocket se o loop estiver ativo
        if loop:
            asyncio.run_coroutine_threadsafe(broadcast_state(), loop)
    except Exception as e:
        logger.error(f"Erro ao processar mensagem MQTT no callback: {e}")

# 1. Rota de Health Check / Status REST
@app.get("/health")
@app.get("/api/v1/status")
async def get_status():
    return {
        "status": "online",
        "project": "IRIS Hub Platform",
        "timestamp": datetime.utcnow().isoformat(),
        "state": {
            "temperature": state.temperature,
            "humidity": state.humidity,
            "fan_speed": state.fan_speed,
            "roof_angle": state.roof_angle,
            "led_color": state.led_color,
            "led_mode": state.led_mode,
            "iris_state": state.iris_state,
            "face_detected": state.face_detected,
            "face_x": state.face_x,
            "face_y": state.face_y,
            "voice_text": state.voice_text
        }
    }

# Rota de Histórico de Sensores
@app.get("/api/v1/sensors/history")
async def get_sensors_history(hours: int = 24, db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    logs = db.query(models.SensorLog)\
             .filter(models.SensorLog.timestamp >= cutoff)\
             .order_by(models.SensorLog.timestamp.asc())\
             .all()
    return [
        {
            "id": log.id,
            "device_id": log.device_id,
            "temperature": log.temperature,
            "humidity": log.humidity,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ]

# 2. Controles REST
@app.post("/api/v1/controls/fans")
async def control_fans(control: FanControl):
    if 0 <= control.speed <= 100:
        state.fan_speed = control.speed
        logger.info(f"REST: Comando recebido - Fans em {control.speed}%")
        
        # Publica no broker se conectado
        if mqtt_manager and mqtt_manager.client.is_connected():
            mqtt_manager.publish("alx/case/fans/set", str(control.speed))
            
        await broadcast_state()
        return {"status": "success", "fan_speed": state.fan_speed}
    return {"status": "error", "message": "Velocidade deve ser entre 0 e 100"}

@app.post("/api/v1/controls/leds")
async def control_leds(control: LedControl):
    state.led_color = control.color
    logger.info(f"REST: Comando recebido - Cor dos LEDs alterada para {control.color}")
    
    # Publica no broker se conectado
    if mqtt_manager and mqtt_manager.client.is_connected():
        mqtt_manager.publish("alx/case/leds/set", control.color)
        
    await broadcast_state()
    return {"status": "success", "led_color": state.led_color}

# 3. WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    state.connected_clients.add(websocket)
    logger.info(f"Novo cliente WebSocket conectado. Total: {len(state.connected_clients)}")
    
    # Envia o estado inicial completo
    try:
        temp_history = get_recent_temp_history()
        if not temp_history:
            temp_history = [state.temperature]
            
        await websocket.send_text(json.dumps({
            "temperature": state.temperature,
            "humidity": state.humidity,
            "irisState": state.iris_state,
            "fanSpeed": state.fan_speed,
            "roofAngle": state.roof_angle,
            "ledColor": state.led_color,
            "ledMode": state.led_mode,
            "faceDetected": state.face_detected,
            "faceX": state.face_x,
            "faceY": state.face_y,
            "voiceText": state.voice_text,
            "tempHistory": temp_history
        }))
        
        # Loop de recebimento de comandos rápidos do WebSocket
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                logger.info(f"WebSocket: Mensagem recebida: {msg}")
                
                topic = msg.get("topic")
                value = msg.get("value")
                
                if topic == "alx/case/fans/set":
                    state.fan_speed = int(value)
                    if mqtt_manager and mqtt_manager.client.is_connected():
                        mqtt_manager.publish("alx/case/fans/set", str(value))
                elif topic == "alx/case/servos/angle":
                    state.roof_angle = int(value)
                    if mqtt_manager and mqtt_manager.client.is_connected():
                        mqtt_manager.publish("alx/case/servos/angle", str(value))
                elif topic == "alx/case/leds/set":
                    state.led_color = value
                    if mqtt_manager and mqtt_manager.client.is_connected():
                        mqtt_manager.publish("alx/case/leds/set", str(value))
                elif topic == "alx/case/leds/mode":
                    state.led_mode = value
                    if mqtt_manager and mqtt_manager.client.is_connected():
                        mqtt_manager.publish("alx/case/leds/mode", str(value))
                      
                await broadcast_state()
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"WebSocket: Erro ao decodificar JSON: {e}")
                
    except WebSocketDisconnect:
        state.connected_clients.remove(websocket)
        logger.info(f"Cliente WebSocket desconectado. Restantes: {len(state.connected_clients)}")

# 4. Inicialização do Servidor e Simulação
@app.on_event("startup")
async def startup_event():
    global mqtt_manager, loop
    loop = asyncio.get_running_loop()
    
    # 1. Garante criação das tabelas no SQLite
    models.Base.metadata.create_all(bind=engine)
    
    # 2. Seed do Banco de Dados
    db = SessionLocal()
    try:
        # Configurações padrões
        default_configs = {
            "temp_threshold_high": "65.0",
            "temp_threshold_low": "55.0",
            "fan_speed_max": "100",
            "fan_speed_min": "20"
        }
        for k, v in default_configs.items():
            cfg = db.query(models.Config).filter(models.Config.key == k).first()
            if not cfg:
                db.add(models.Config(key=k, value=v))
                
        # Dispositivo principal
        dev = db.query(models.Device).filter(models.Device.type == "esp32").first()
        if not dev:
            db.add(models.Device(name="Alienware ALX Case", type="esp32", mqtt_topic="alx/case"))
            
        db.commit()
    except Exception as e:
        logger.error(f"Erro ao inicializar dados no SQLite: {e}")
    finally:
        db.close()
        
    # 3. Inicializa o cliente MQTT
    mqtt_manager = MQTTManager(on_message_callback=handle_mqtt_message)
    mqtt_manager.start()
    
    # 4. Inicia loop de simulação física realista
    # asyncio.create_task(simulation_loop()) # REMOVIDO: A simulação de voz estava conflitando com a IRIS real

async def simulation_loop():
    iris_cycle = ["idle", "listening", "speaking", "idle"]
    voice_phrases = {
        "listening": "Ouvindo comando de voz...",
        "speaking": "Ajustando refrigeração ativa dos ventiladores do case Alienware ALX.",
        "idle": ""
    }
    cycle_idx = 0
    counter = 0

    while True:
        await asyncio.sleep(2.0)
        counter += 1

        # 1. Simulação Térmica (Fans -> Hysteresis física)
        cooling_factor = state.fan_speed / 100.0 * 0.45
        heating_factor = 0.18
        temp_delta = heating_factor - cooling_factor
        noise = (random.random() - 0.5) * 0.15
        new_temp = round(max(30.0, min(85.0, state.temperature + temp_delta + noise)), 1)
        new_humidity = round(max(20.0, min(90.0, 75.0 - (new_temp - 30.0) * 0.6 + (random.random() - 0.5) * 0.5)), 1)

        # 2. Rastreamento Facial (Senoide) - REMOVIDO PARA USAR A CÂMERA REAL
        # Não sobrescrevemos mais as variáveis face_detected, face_x e face_y

        # 3. Estado de voz cíclico
        iris_state = state.iris_state
        voice_text = state.voice_text
        if state.iris_state != "critical" and counter % 10 == 0:
            cycle_idx = (cycle_idx + 1) % len(iris_cycle)
            iris_state = iris_cycle[cycle_idx]
            voice_text = voice_phrases.get(iris_state, "")

        # Automação de Alerta Crítico Térmico
        if new_temp >= 75.0:
            iris_state = "critical"
            voice_text = f"ALERTA CRÍTICO: TEMPERATURA CRÍTICA DE {new_temp}°C DETECTADA NO CASE!"
        elif iris_state == "critical" and new_temp < 70.0:
            iris_state = "idle"
            voice_text = ""

        # Se MQTT estiver conectado, publica nos tópicos correspondentes
        # Caso contrário, atualiza o estado local diretamente e gera log
        if mqtt_manager and mqtt_manager.client.is_connected():
            mqtt_manager.publish("alx/case/temperature", str(new_temp))
            mqtt_manager.publish("alx/case/humidity", str(new_humidity))
            # Os dados reais de rosto chegam via MQTT e não precisam ser re-publicados pelo loop
            mqtt_manager.publish("alx/voice/state", json.dumps({
                "irisState": iris_state,
                "text": voice_text
            }))
        else:
            state.temperature = new_temp
            state.humidity = new_humidity
            # Removido sobrescrita de face local para não conflitar com a câmera
            state.iris_state = iris_state
            state.voice_text = voice_text
            
            save_sensor_log(temperature=new_temp, humidity=new_humidity)
            await broadcast_state()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)