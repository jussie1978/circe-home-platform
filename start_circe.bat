@echo off
color 0B
echo =======================================================
echo          CIRCE HOME PLATFORM - STARTUP SCRIPT
echo =======================================================
echo.

echo [1/4] Inicializando Servicos Base (Mosquitto MQTT) via Docker...
docker-compose up -d
echo.

echo [2/4] Iniciando Backend FastAPI...
:: Inicia em uma nova janela minimizada
start "CIRCE Backend" /MIN cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8001"
echo.

echo [3/4] Iniciando Modulo de Visao Computacional (Headless)...
:: Inicia em uma nova janela minimizada
start "CIRCE Vision (Face Tracker)" /MIN cmd /k "python scripts\face_tracker.py --headless"
echo.

echo [4/4] Iniciando Frontend React (Orbe 3D)...
:: Inicia o npm run dev
cd frontend
start "CIRCE Frontend" cmd /k "npm run dev"
echo.

echo =======================================================
echo Sistema inicializado com sucesso!
echo - Backend rodando na porta 8001 (minimizada)
echo - Face Tracker rodando em modo headless (minimizada)
echo - Frontend rodando no terminal aberto.
echo =======================================================
echo.
pause
