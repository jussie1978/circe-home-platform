@echo off
color 0B
echo =======================================================
echo          CIRCE HOME PLATFORM - STARTUP SCRIPT
echo =======================================================
echo.

echo [1/4] Inicializando Broker MQTT (Mosquitto Nativo)...
start "CIRCE Mosquitto" /MIN cmd /k ""C:\Program Files\mosquitto\mosquitto.exe" -c "%~dp0local_mqtt.conf""
echo.

echo [2/4] Iniciando Backend FastAPI...
cd "%~dp0backend"
start "CIRCE Backend" /MIN cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8001"
echo.

echo [3/4] Iniciando Modulo de Visao Computacional (Headless)...
cd "%~dp0"
start "CIRCE Vision (Face Tracker)" /MIN cmd /k "python scripts\face_tracker.py --headless"
echo.

echo [4/4] Iniciando Frontend React (Orbe 3D)...
cd "%~dp0frontend"
start "CIRCE Frontend" /MIN cmd /k "npm run dev"
echo.

echo =======================================================
echo Sistema inicializado com sucesso!
echo.
echo Abrindo o navegador em 5 segundos...
echo =======================================================
timeout /t 5 >nul

start http://localhost:3000
exit
