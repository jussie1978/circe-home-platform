# CIRCE Home Platform — Guia de Desenvolvimento

## Pré-requisitos

- Python 3.11+;
- Node.js 18+;
- Docker/Compose ou Mosquitto local;
- PlatformIO para firmware;
- câmera e dependências extras apenas para face tracking.

## Problema conhecido antes do setup

`backend/requirements.txt` foi encontrado em UTF-16LE. Converta para UTF-8 antes de usar em pipelines Unix:

```bash
iconv -f UTF-16LE -t UTF-8 backend/requirements.txt > backend/requirements.utf8.txt
mv backend/requirements.utf8.txt backend/requirements.txt
```

## Broker MQTT

```bash
docker compose up -d mqtt-broker
```

Verificação:

```bash
mosquitto_sub -h localhost -t 'alx/#' -v
```

## Backend

```bash
cd backend
python -m venv .venv
# Linux/macOS
source .venv/bin/activate
# Windows PowerShell
# .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Acesse `http://127.0.0.1:8001/docs`.

## Frontend

```bash
cd frontend
npm ci
npm run dev
```

Acesse `http://127.0.0.1:3000`.

## Simulador

```bash
python scripts/simulate_inputs.py --host localhost --port 1883
```

## Face tracker

O script requer dependências que não aparecem no `requirements.txt` principal: OpenCV, MediaPipe e Paho MQTT. Recomenda-se um arquivo separado `requirements-vision.txt`.

```bash
python scripts/face_tracker.py --host localhost --camera 0
```

## Firmware

```bash
cd firmware/circe_core
pio run
pio run --target upload
pio device monitor
```

## Testes

```bash
cd backend
PYTHONPATH=. pytest -q
```

```bash
cd frontend
npm run build
```

## Configuração recomendada

Criar `.env.example`:

```dotenv
DATABASE_URL=sqlite:///./circe_home.db
MQTT_BROKER=localhost
MQTT_PORT=1883
API_HOST=0.0.0.0
API_PORT=8001
CORS_ORIGINS=http://localhost:3000
```

E no frontend:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8001
VITE_WS_URL=ws://127.0.0.1:8001/ws
```

Não colocar chave permanente Gemini/OpenAI em arquivo versionado ou bundle público.
