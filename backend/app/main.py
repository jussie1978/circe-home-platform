import asyncio
import json
import random
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IRIS_BACKEND")

app = FastAPI(
  title="IRIS System API",
  description="Backend para automação residencial do case Alienware ALX e assistente de voz IRIS",
  version="0.2.0"
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

state = SystemState()

# Modelos Pydantic para endpoints REST
class FanControl(BaseModel):
  speed: int

class LedControl(BaseModel):
  color: str

# 1. Rota de Health Check
@app.get("/health")
@app.get("/api/v1/status")
async def get_status():
  return {
    "status": "online",
    "project": "CIRCE Home Platform",
    "timestamp": datetime.utcnow().isoformat(),
    "state": {
      "temperature": state.temperature,
      "humidity": state.humidity,
      "fan_speed": state.fan_speed,
      "roof_angle": state.roof_angle,
      "led_color": state.led_color,
      "led_mode": state.led_mode,
      "iris_state": state.iris_state,
    }
  }

# 2. Controles REST (Para compatibilidade futura e dashboard)
@app.post("/api/v1/controls/fans")
async def control_fans(control: FanControl):
  if 0 <= control.speed <= 100:
    state.fan_speed = control.speed
    logger.info(f"Comando recebido - Velocidade do Fan setada para {control.speed}%")
    await broadcast_state()
    return {"status": "success", "fan_speed": state.fan_speed}
  return {"status": "error", "message": "Velocidade deve ser entre 0 e 100"}

@app.post("/api/v1/controls/leds")
async def control_leds(control: LedControl):
  state.led_color = control.color
  logger.info(f"Comando recebido - Cor dos LEDs alterada para {control.color}")
  await broadcast_state()
  return {"status": "success", "led_color": state.led_color}

# Funções auxiliares para transmissão de eventos WebSocket
async def broadcast_state():
  if not state.connected_clients:
    return
  payload = json.dumps({
    "temperature": state.temperature,
    "humidity": state.humidity,
    "irisState": state.iris_state,
    "fanSpeed": state.fan_speed,
    "roofAngle": state.roof_angle,
    "ledColor": state.led_color,
  })
  
  # Broadcast assíncrono para todos os clientes conectados
  inactive_connections = []
  for client in state.connected_clients:
    try:
      await client.send_text(payload)
    except Exception:
      inactive_connections.append(client)
      
  for dead_client in inactive_connections:
    state.connected_clients.remove(dead_client)

# 3. Gerenciamento do canal WebSocket (/ws)
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
  await websocket.accept()
  state.connected_clients.add(websocket)
  logger.info(f"Novo cliente conectado. Total: {len(state.connected_clients)}")
  
  # Envia o estado atual imediatamente no connect
  try:
    await websocket.send_text(json.dumps({
      "temperature": state.temperature,
      "humidity": state.humidity,
      "irisState": state.iris_state,
      "fanSpeed": state.fan_speed,
      "roofAngle": state.roof_angle,
      "ledColor": state.led_color,
    }))
    
    # Loop de recebimento de comandos do cliente por WebSocket
    while True:
      data = await websocket.receive_text()
      try:
        msg = json.loads(data)
        logger.info(f"Mensagem WebSocket recebida: {msg}")
        
        # Processamento de comandos rápidos recebidos via WebSocket
        topic = msg.get("topic")
        value = msg.get("value")
        
        if topic == "alx/case/fans/set":
          state.fan_speed = int(value)
        elif topic == "alx/case/servos/angle":
          state.roof_angle = int(value)
        elif topic == "alx/case/leds/set":
          state.led_color = value
        elif topic == "alx/case/leds/mode":
          state.led_mode = value
          
        await broadcast_state()
      except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"Erro ao processar dados recebidos: {e}")
        
  except WebSocketDisconnect:
    state.connected_clients.remove(websocket)
    logger.info(f"Cliente desconectado. Restantes: {len(state.connected_clients)}")

# 4. Tarefa assíncrona em background para simulação física realista
@app.on_event("startup")
async def startup_event():
  asyncio.create_task(simulation_loop())

async def simulation_loop():
  """
  Loop de simulação em background.
  - Altera a temperatura dinamicamente baseado na velocidade dos fans (resfriamento térmico).
  - Altera ciclicamente o estado da IA IRIS (Idle -> Listening -> Speaking -> Idle).
  """
  iris_cycle = ["idle", "listening", "speaking", "idle"]
  cycle_idx = 0
  counter = 0

  while True:
    await asyncio.sleep(1.0)
    counter += 1

    # 1. Simulação Térmica baseada nos Fans (Hysteresis física)
    # A velocidade dos fans resfria o case. O case aquece naturalmente se os fans estiverem lentos.
    cooling_factor = state.fan_speed / 100.0 * 0.45
    heating_factor = 0.18 # aquecimento natural dos componentes
    
    # Temperatura tende a subir se fan < 40%, e cair se fan > 40%
    temp_delta = heating_factor - cooling_factor
    noise = (random.random() - 0.5) * 0.15 # ruído térmico
    state.temperature = round(max(30.0, min(85.0, state.temperature + temp_delta + noise)), 1)

    # Automação de Alerta Crítico Térmico
    if state.temperature >= 75.0:
      state.iris_state = "critical"
    elif state.iris_state == "critical" and state.temperature < 70.0:
      state.iris_state = "idle" # se resfriar, volta ao normal

    # 2. Mudança cíclica do estado da IRIS para fins demonstrativos (a cada 15 segundos)
    if state.iris_state != "critical" and counter % 15 == 0:
      cycle_idx = (cycle_idx + 1) % len(iris_cycle)
      state.iris_state = iris_cycle[cycle_idx]
      logger.info(f"Estado de simulação da IRIS atualizado para: {state.iris_state}")

    # Atualiza a umidade simulada de forma inversamente proporcional à temperatura
    state.humidity = round(max(20.0, min(90.0, 75.0 - (state.temperature - 30.0) * 0.6 + (random.random() - 0.5) * 0.5)), 1)

    # Transmite o novo estado para todos os clientes conectados
    await broadcast_state()

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host="0.0.0.0", port=8000)