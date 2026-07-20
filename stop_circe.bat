@echo off
color 0C
echo =======================================================
echo          CIRCE HOME PLATFORM - SHUTDOWN SCRIPT
echo =======================================================
echo.

echo Encerrando Mosquitto (Porta 1883)...
FOR /F "tokens=5" %%T IN ('netstat -ano ^| findstr :1883') DO (taskkill /PID %%T /F >nul 2>&1)

echo Encerrando Backend (Porta 8001)...
FOR /F "tokens=5" %%T IN ('netstat -ano ^| findstr :8001') DO (taskkill /PID %%T /F >nul 2>&1)

echo Encerrando Frontend (Porta 5173 / 3000)...
FOR /F "tokens=5" %%T IN ('netstat -ano ^| findstr :5173') DO (taskkill /PID %%T /F >nul 2>&1)
FOR /F "tokens=5" %%T IN ('netstat -ano ^| findstr :3000') DO (taskkill /PID %%T /F >nul 2>&1)

echo Limpando terminais cmd residuais...
taskkill /FI "WINDOWTITLE eq CIRCE *" /F >nul 2>&1

echo.
echo Todos os servicos foram encerrados de forma cirurgica pelas portas!
echo =======================================================
timeout /t 3 >nul
