#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# CIRCE Home Platform — Setup Ambiente de Desenvolvimento
# Testado em: Ubuntu 22.04+, Debian 12+, Raspberry Pi OS (64-bit)
# ─────────────────────────────────────────────────────────────────

set -e  # Para em caso de erro

VERDE='\033[0;32m'
AMARELO='\033[1;33m'
VERMELHO='\033[0;31m'
NC='\033[0m' # Sem cor

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CIRCE Home Platform — Dev Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Verificar dependências ──────────────────────────────────────
echo -e "${AMARELO}[1/6] Verificando dependências...${NC}"

# Python 3.11+
if ! command -v python3 &>/dev/null; then
    echo -e "${VERMELHO}  ✗ Python 3 não encontrado. Instale: sudo apt install python3.11${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo -e "${VERDE}  ✓ Python ${PYTHON_VERSION}${NC}"

# Node.js 18+
if ! command -v node &>/dev/null; then
    echo -e "${VERMELHO}  ✗ Node.js não encontrado. Instale: curl -fsSL https://deb.nodesource.com/setup_18.x | bash -${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${VERDE}  ✓ Node.js ${NODE_VERSION}${NC}"

# Git
if ! command -v git &>/dev/null; then
    echo -e "${VERMELHO}  ✗ Git não encontrado. Instale: sudo apt install git${NC}"
    exit 1
fi
echo -e "${VERDE}  ✓ Git $(git --version | awk '{print $3}')${NC}"

# ── 2. Backend Python ──────────────────────────────────────────────
echo ""
echo -e "${AMARELO}[2/6] Configurando backend Python...${NC}"

cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${VERDE}  ✓ Virtual environment criado${NC}"
else
    echo -e "${VERDE}  ✓ Virtual environment já existe${NC}"
fi

source venv/bin/activate

pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet 2>/dev/null || pip install \
    fastapi \
    uvicorn[standard] \
    sqlalchemy \
    alembic \
    pydantic \
    paho-mqtt \
    pytest \
    pytest-asyncio \
    httpx \
    python-dotenv \
    --quiet

echo -e "${VERDE}  ✓ Dependências Python instaladas${NC}"

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# CIRCE Home Platform — Backend Config
DATABASE_URL=sqlite:///./circe_home.db
MQTT_BROKER=localhost
MQTT_PORT=1883
MQTT_CLIENT_ID=circe-backend
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
EOF
    echo -e "${VERDE}  ✓ Arquivo .env criado${NC}"
fi

deactivate
cd ..

# ── 3. Frontend Node ───────────────────────────────────────────────
echo ""
echo -e "${AMARELO}[3/6] Configurando frontend React...${NC}"

if [ -f "frontend/package.json" ]; then
    cd frontend
    npm install --silent
    echo -e "${VERDE}  ✓ Dependências Node instaladas${NC}"
    cd ..
else
    echo -e "${AMARELO}  ⚠ frontend/package.json não encontrado — pulando (será criado no Sprint 001)${NC}"
fi

# ── 4. Mosquitto MQTT Broker ───────────────────────────────────────
echo ""
echo -e "${AMARELO}[4/6] Verificando Mosquitto...${NC}"

if ! command -v mosquitto &>/dev/null; then
    echo -e "${AMARELO}  → Instalando Mosquitto...${NC}"
    sudo apt update -qq
    sudo apt install -y mosquitto mosquitto-clients
    sudo systemctl enable mosquitto
    sudo systemctl start mosquitto
    echo -e "${VERDE}  ✓ Mosquitto instalado e iniciado${NC}"
else
    echo -e "${VERDE}  ✓ Mosquitto já instalado: $(mosquitto --version 2>&1 | head -1)${NC}"
fi

# Criar config Mosquitto se não existir
MOSQUITTO_CONF="/etc/mosquitto/conf.d/circe.conf"
if [ ! -f "$MOSQUITTO_CONF" ]; then
    sudo tee "$MOSQUITTO_CONF" > /dev/null << 'EOF'
# CIRCE Home Platform — Mosquitto Config
listener 1883 0.0.0.0
allow_anonymous true
persistence true
persistence_location /var/lib/mosquitto/
log_dest stdout
log_type all
EOF
    sudo systemctl restart mosquitto
    echo -e "${VERDE}  ✓ Config Mosquitto aplicada${NC}"
fi

# ── 5. Docker Compose (opcional) ──────────────────────────────────
echo ""
echo -e "${AMARELO}[5/6] Verificando Docker...${NC}"

if command -v docker &>/dev/null; then
    echo -e "${VERDE}  ✓ Docker disponível: $(docker --version)${NC}"
    if [ -f "docker/docker-compose.yml" ]; then
        echo -e "${VERDE}  ✓ docker-compose.yml encontrado${NC}"
    fi
else
    echo -e "${AMARELO}  ⚠ Docker não encontrado (opcional para desenvolvimento inicial)${NC}"
fi

# ── 6. Teste de conectividade MQTT ────────────────────────────────
echo ""
echo -e "${AMARELO}[6/6] Testando Mosquitto...${NC}"

# Iniciar subscriber em background por 3 segundos
mosquitto_sub -t "circe/setup/test" -C 1 -W 5 &
SUB_PID=$!

sleep 1

# Publicar mensagem de teste
mosquitto_pub -t "circe/setup/test" -m "CIRCE Home Platform online"

# Aguardar subscriber
wait $SUB_PID 2>/dev/null && \
    echo -e "${VERDE}  ✓ MQTT pub/sub funcionando corretamente${NC}" || \
    echo -e "${AMARELO}  ⚠ Timeout MQTT — verifique se Mosquitto está rodando${NC}"

# ── Resumo ────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${VERDE}  Setup concluído!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Próximos passos:"
echo ""
echo "  Backend:"
echo "    cd backend && source venv/bin/activate"
echo "    uvicorn app.main:app --reload"
echo "    Abrir: http://localhost:8000/docs"
echo ""
echo "  Frontend (quando disponível):"
echo "    cd frontend && npm run dev"
echo "    Abrir: http://localhost:3000"
echo ""
echo "  MQTT Monitor:"
echo "    mosquitto_sub -t 'alx/#' -v"
echo ""
echo "  Documentação do projeto:"
echo "    cat docs/SPEC-001-PLATFORM.md"
echo "    cat docs/sprints/SPRINT-000-setup.md"
echo ""
echo "  🌈 IRIS está aguardando..."
echo ""
