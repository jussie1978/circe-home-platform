import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Thermometer, 
  Wind, 
  Settings, 
  Lightbulb, 
  Cpu, 
  Activity,
  Sliders
} from 'lucide-react';
import OrbCanvas, { useIrisStore } from './components/OrbCanvas';

export default function App() {
  const { 
    temperature, 
    irisState, 
    setTemperature, 
    setIrisState,
    primaryColor,
    secondaryColor,
    tertiaryColor,
    quaternaryColor,
    quinaryColor,
    senaryColor,
    customThemeActive,
    rotationSpeed,
    physicsMode,
    repulsionStrength,
    starSpeed,
    glowIntensity,
    saturation,
    ringColorCustom,
    ringSpeed,
    pulseSpeed,
    activePanel,
    setActivePanel,
    setFXConfig
  } = useIrisStore();
  const [showFXSettings, setShowFXSettings] = useState(false);
  
  // Controles locais (estado do dashboard)
  const [fanSpeed, setFanSpeed] = useState(60);
  const [roofAngle, setRoofAngle] = useState(90);
  const [ledColor, setLedColor] = useState('#06B6D4');
  const [ledMode, setLedMode] = useState('Breath');
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Conexão WebSocket com o Backend FastAPI
  useEffect(() => {
    const connectWS = () => {
      const socket = new WebSocket('ws://localhost:8000/ws');
      wsRef.current = socket;

      socket.onopen = () => {
        setIsWebSocketConnected(true);
        console.log('Conectado ao WebSocket da IRIS');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.temperature !== undefined) setTemperature(data.temperature);
          if (data.irisState !== undefined) setIrisState(data.irisState);
        } catch (err) {
          console.error('Erro ao processar dados do WS:', err);
        }
      };

      socket.onclose = () => {
        setIsWebSocketConnected(false);
        console.log('Conexão fechada. Tentando reconectar em 3s...');
        setTimeout(connectWS, 3000);
      };
    };

    connectWS();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [setTemperature, setIrisState]);

  // Simulação Local Inteligente (Hysteresis e Ruído Térmico) caso o backend não esteja ativo
  useEffect(() => {
    if (isWebSocketConnected) return;

    const interval = setInterval(() => {
      const prev = useIrisStore.getState().temperature;
      // Oscilação térmica simulada em torno de 45°C
      const target = irisState === 'critical' ? 78 : irisState === 'speaking' ? 52 : 44;
      const noise = (Math.random() - 0.5) * 0.4;
      const diff = target - prev;
      const nextTemp = parseFloat((prev + diff * 0.05 + noise).toFixed(1));
      setTemperature(nextTemp);
    }, 2000);

    return () => clearInterval(interval);
  }, [isWebSocketConnected, irisState, setTemperature]);

  // Função para enviar comandos via REST ou WebSocket
  const sendControl = async (topic: string, value: string) => {
    console.log(`Comando enviado -> Tópico: ${topic}, Valor: ${value}`);
    
    // Se o websocket estiver aberto, podemos enviar comandos rápidos por ele
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ topic, value }));
    }

    // Fallback REST (POST para o backend FastAPI)
    try {
      if (topic === 'alx/case/fans/set') {
        await fetch('http://localhost:8000/api/v1/controls/fans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ speed: parseInt(value) }),
        });
      } else if (topic === 'alx/case/leds/set') {
        await fetch('http://localhost:8000/api/v1/controls/leds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ color: value }),
        });
      }
    } catch (e) {
      // Ignora erro se backend não estiver rodando
    }
  };

  // Variantes de animação para os cards de controle (Framer Motion) - Suavizados e menos bruscos
  const cardVariants = {
    hidden: (quadrant: string) => {
      const x = quadrant.includes('left') ? -15 : 15;
      const y = quadrant.includes('top') ? -10 : 10;
      return { x, y, opacity: 0, scale: 0.96 };
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'tween',
        ease: [0.25, 1, 0.5, 1], // easeOutQuart: curva ultra-suave
        duration: 0.45,
      }
    },
    exit: (quadrant: string) => {
      const x = quadrant.includes('left') ? -10 : 10;
      const y = quadrant.includes('top') ? -8 : 8;
      return { x, y, opacity: 0, scale: 0.98, transition: { type: 'tween', ease: 'easeInOut', duration: 0.35 } };
    }
  };

  return (
    <div 
      onClick={() => setActivePanel(null)} 
      className="relative w-full h-full bg-[#02020a] font-sans text-slate-200 select-none overflow-hidden"
    >
      
      {/* 1. Renderização 3D Otimizada de Fundo */}
      <OrbCanvas />

      {/* Grid sutil de sobreposição holográfica */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#000000e0_95%)] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10 opacity-70" />

      {/* 2. Grid de 4 Quadrantes Clicáveis Invisíveis para Abertura dos Painéis */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 z-20 pointer-events-none">
        {/* Quadrante Superior Esquerdo - Sensores */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActivePanel(activePanel === 'top-left' ? null : 'top-left'); }}
          className="pointer-events-auto cursor-pointer"
        />
        {/* Quadrante Superior Direito - Ventilação */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActivePanel(activePanel === 'top-right' ? null : 'top-right'); }}
          className="pointer-events-auto cursor-pointer"
        />
        {/* Quadrante Inferior Esquerdo - Aletas */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActivePanel(activePanel === 'bottom-left' ? null : 'bottom-left'); }}
          className="pointer-events-auto cursor-pointer"
        />
        {/* Quadrante Inferior Direito - Iluminação */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActivePanel(activePanel === 'bottom-right' ? null : 'bottom-right'); }}
          className="pointer-events-auto cursor-pointer"
        />
      </div>

      {/* Área Central de Descarte (Sobre o Orbe Central, z-25 para sobrepor os quadrantes) */}
      <div 
        onClick={(e) => { e.stopPropagation(); setActivePanel(null); }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full z-25 pointer-events-auto cursor-default"
      />

      {/* 3. Cabeçalho Central Fixo Superior (Status IRIS e Controle de Teste de Modos) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-auto">
        <div className="glass-panel px-6 py-2 rounded-full border border-cyan-500/20 flex items-center gap-3 shadow-neon-cyan transition-all duration-300">
          <span className={`w-2.5 h-2.5 rounded-full ${isWebSocketConnected ? 'bg-cyan-400 animate-pulse' : 'bg-amber-500'}`} />
          <h1 className="font-mono text-sm tracking-wider uppercase font-semibold text-cyan-400">
            IRIS_SYSTEM_R2.0 // <span className="text-white">{irisState}</span>
          </h1>
          <div className="w-[1px] h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>{temperature}°C</span>
          </div>
        </div>

        {/* Console de Teste Rápido de Estados da IRIS (Para Diversão do Usuário) */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-white/5 text-xs font-mono">
          <span className="text-slate-500">MOCK:</span>
          <button 
            onClick={() => setIrisState('idle')}
            className={`px-2 py-0.5 rounded transition ${irisState === 'idle' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            Idle
          </button>
          <button 
            onClick={() => setIrisState('listening')}
            className={`px-2 py-0.5 rounded transition ${irisState === 'listening' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            Listen
          </button>
          <button 
            onClick={() => setIrisState('speaking')}
            className={`px-2 py-0.5 rounded transition ${irisState === 'speaking' ? 'bg-slate-300/20 text-white border border-white/20' : 'text-slate-400 hover:text-white'}`}
          >
            Speak
          </button>
          <button 
            onClick={() => setIrisState('critical')}
            className={`px-2 py-0.5 rounded transition ${irisState === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            Crit
          </button>
        </div>
      </div>

      {/* 4. Overlay de Cantoneiras Guia (Aproximadas para emoldurar os novos limites dos cards) */}
      <div className="absolute inset-[8%] border border-white/[0.02] pointer-events-none z-10 flex flex-col justify-between">
        <div className="flex justify-between">
          <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-500/10" />
          <div className="w-4 h-4 border-t-2 border-r-2 border-purple-500/10" />
        </div>
        <div className="flex justify-between">
          <div className="w-4 h-4 border-b-2 border-l-2 border-orange-500/10" />
          <div className="w-4 h-4 border-b-2 border-r-2 border-red-500/10" />
        </div>
      </div>

      {/* 5. Painéis de Controle Ativados no Clique via Satélites 3D (Animados via AnimatePresence) */}
      <div className="absolute inset-10 pointer-events-none z-30">
        <AnimatePresence custom={activePanel}>
          
          {/* PAINEL: SENSORES (Superior Esquerdo) */}
          {activePanel === 'top-left' && (
            <motion.div
              custom="top-left"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-[12%] left-[8%] w-80 glass-panel border-neon-cyan p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-neon-cyan"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-cyan-400" />
                  <h2 className="font-semibold tracking-wider uppercase font-mono text-sm text-cyan-400">TELEMETRIA_DHT22</h2>
                </div>
                <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Temperatura</span>
                  <span className="text-2xl font-bold tracking-tight text-white">{temperature}°C</span>
                </div>
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Umidade</span>
                  <span className="text-2xl font-bold tracking-tight text-white">62.8%</span>
                </div>
              </div>

              {/* Tabela de logs fictícia sci-fi */}
              <div className="font-mono text-[10px] bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col gap-1.5">
                <div className="text-slate-400 uppercase font-semibold pb-1 border-b border-white/5">Últimos Logs:</div>
                <div className="flex justify-between text-slate-300">
                  <span>[17:42] TEMP_READ_OK</span>
                  <span className="text-cyan-400">{temperature}°C</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>[17:40] FAN_SPEED_AUTO</span>
                  <span>PWM_60%</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>[17:35] WEBSOCKET_CONNECT</span>
                  <span className="text-green-400">ONLINE</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* PAINEL: VENTILAÇÃO (Superior Direito) */}
          {activePanel === 'top-right' && (
            <motion.div
              custom="top-right"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-[12%] right-[8%] w-80 glass-panel border-neon-purple p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-neon-purple"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-purple-400" />
                  <h2 className="font-semibold tracking-wider uppercase font-mono text-sm text-purple-400">Fans PWM</h2>
                </div>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-slate-400">Velocidade dos Fans</span>
                  <span className="text-purple-400 font-bold">{fanSpeed}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={fanSpeed} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFanSpeed(val);
                    sendControl('alx/case/fans/set', val.toString());
                  }}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => { setFanSpeed(100); sendControl('alx/case/fans/set', '100'); }}
                  className="bg-purple-950/20 hover:bg-purple-900/40 border border-purple-500/20 text-purple-300 font-mono text-xs py-2 rounded-xl transition"
                >
                  Modo Turbo
                </button>
                <button 
                  onClick={() => { setFanSpeed(20); sendControl('alx/case/fans/set', '20'); }}
                  className="bg-black/30 hover:bg-black/50 border border-white/5 text-slate-300 font-mono text-xs py-2 rounded-xl transition"
                >
                  Modo Silencioso
                </button>
              </div>
            </motion.div>
          )}

          {/* PAINEL: ALETAS DO TETO (Inferior Esquerdo) */}
          {activePanel === 'bottom-left' && (
            <motion.div
              custom="bottom-left"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-[12%] left-[8%] w-80 glass-panel border-neon-orange p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-neon-orange"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-400" />
                  <h2 className="font-semibold tracking-wider uppercase font-mono text-sm text-orange-400">Aletas ALX</h2>
                </div>
                <Cpu className="w-4 h-4 text-orange-400" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-slate-400">Abertura do Servo</span>
                  <span className="text-orange-400 font-bold">{roofAngle}°</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="180" 
                  value={roofAngle} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setRoofAngle(val);
                    sendControl('alx/case/servos/angle', val.toString());
                  }}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                />
                
                <div className="flex justify-between gap-2 mt-2">
                  <button 
                    onClick={() => { setRoofAngle(180); sendControl('alx/case/servos/angle', '180'); }}
                    className="flex-1 bg-orange-950/20 hover:bg-orange-900/40 border border-orange-500/20 text-orange-300 font-mono text-xs py-1.5 rounded-lg transition"
                  >
                    100% Aberto
                  </button>
                  <button 
                    onClick={() => { setRoofAngle(0); sendControl('alx/case/servos/angle', '0'); }}
                    className="flex-1 bg-black/30 hover:bg-black/50 border border-white/5 text-slate-300 font-mono text-xs py-1.5 rounded-lg transition"
                  >
                    Fechado
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PAINEL: ILUMINAÇÃO (Inferior Direito) */}
          {activePanel === 'bottom-right' && (
            <motion.div
              custom="bottom-right"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-[12%] right-[8%] w-80 glass-panel border-neon-red p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-neon-red"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-rose-400" />
                  <h2 className="font-semibold tracking-wider uppercase font-mono text-sm text-rose-400">LEDs WS2812B</h2>
                </div>
                <Lightbulb className="w-4 h-4 text-rose-400" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-slate-400">Cor dos LEDs</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={ledColor} 
                      onChange={(e) => {
                        setLedColor(e.target.value);
                        sendControl('alx/case/leds/set', e.target.value);
                      }}
                      className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer"
                    />
                    <span className="font-mono text-xs uppercase text-white font-bold">{ledColor}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] text-slate-400 uppercase">Efeitos Rápidos</span>
                  <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                    {['Solid', 'Breath', 'Rainbow'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setLedMode(mode);
                          sendControl('alx/case/leds/mode', mode.toLowerCase());
                        }}
                        className={`py-1.5 rounded-lg border transition ${
                          ledMode === mode 
                            ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' 
                            : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Botão Flutuante de Configurações FX (Sliders Sci-Fi) */}
      <button 
        onClick={() => setShowFXSettings(!showFXSettings)} 
        className={`absolute top-8 right-8 z-50 p-2.5 rounded-full border transition-all duration-300 pointer-events-auto ${
          showFXSettings 
            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-neon-cyan shadow-sm' 
            : 'bg-black/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
        }`}
      >
        <Sliders className="w-5 h-5" />
      </button>

      {/* Painel Central de Configurações FX (Aparência e Física R2.1) */}
      <AnimatePresence>
        {showFXSettings && (
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.97 }}
            transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.45 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-24 right-8 w-80 glass-panel border-neon-cyan p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-neon-cyan z-40"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                <h2 className="font-semibold tracking-wider uppercase font-mono text-sm text-cyan-400">INTERFACE CORE FX</h2>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/10 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/20">Active</span>
            </div>

            {/* Seção Cores Personalizadas */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-slate-300">Cores Customizadas</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={customThemeActive} 
                    onChange={(e) => setFXConfig({ customThemeActive: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {customThemeActive && (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Cor 1 */}
                    <div className="bg-black/35 p-1.5 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                      <span className="text-[7px] font-mono text-slate-400 uppercase">Cor 1</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <input 
                          type="color" 
                          value={primaryColor} 
                          onChange={(e) => setFXConfig({ primaryColor: e.target.value })}
                          className="w-4 h-4 bg-transparent border-0 rounded cursor-pointer"
                        />
                        <span className="text-[7px] font-mono uppercase text-white font-bold">{primaryColor}</span>
                      </div>
                    </div>
                    {/* Cor 2 */}
                    <div className="bg-black/35 p-1.5 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                      <span className="text-[7px] font-mono text-slate-400 uppercase">Cor 2</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <input 
                          type="color" 
                          value={secondaryColor} 
                          onChange={(e) => setFXConfig({ secondaryColor: e.target.value })}
                          className="w-4 h-4 bg-transparent border-0 rounded cursor-pointer"
                        />
                        <span className="text-[7px] font-mono uppercase text-white font-bold">{secondaryColor}</span>
                      </div>
                    </div>
                    {/* Cor 3 */}
                    <div className="bg-black/35 p-1.5 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                      <span className="text-[7px] font-mono text-slate-400 uppercase">Cor 3</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <input 
                          type="color" 
                          value={tertiaryColor} 
                          onChange={(e) => setFXConfig({ tertiaryColor: e.target.value })}
                          className="w-4 h-4 bg-transparent border-0 rounded cursor-pointer"
                        />
                        <span className="text-[7px] font-mono uppercase text-white font-bold">{tertiaryColor}</span>
                      </div>
                    </div>
                    {/* Cor 4 */}
                    <div className="bg-black/35 p-1.5 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                      <span className="text-[7px] font-mono text-slate-400 uppercase">Cor 4</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <input 
                          type="color" 
                          value={quaternaryColor} 
                          onChange={(e) => setFXConfig({ quaternaryColor: e.target.value })}
                          className="w-4 h-4 bg-transparent border-0 rounded cursor-pointer"
                        />
                        <span className="text-[7px] font-mono uppercase text-white font-bold">{quaternaryColor}</span>
                      </div>
                    </div>
                    {/* Cor 5 */}
                    <div className="bg-black/35 p-1.5 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                      <span className="text-[7px] font-mono text-slate-400 uppercase">Cor 5</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <input 
                          type="color" 
                          value={quinaryColor} 
                          onChange={(e) => setFXConfig({ quinaryColor: e.target.value })}
                          className="w-4 h-4 bg-transparent border-0 rounded cursor-pointer"
                        />
                        <span className="text-[7px] font-mono uppercase text-white font-bold">{quinaryColor}</span>
                      </div>
                    </div>
                    {/* Cor 6 */}
                    <div className="bg-black/35 p-1.5 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                      <span className="text-[7px] font-mono text-slate-400 uppercase">Cor 6</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <input 
                          type="color" 
                          value={senaryColor} 
                          onChange={(e) => setFXConfig({ senaryColor: e.target.value })}
                          className="w-4 h-4 bg-transparent border-0 rounded cursor-pointer"
                        />
                        <span className="text-[7px] font-mono uppercase text-white font-bold">{senaryColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cor do Anel */}
                  <div className="bg-black/35 p-1.5 rounded-xl border border-white/5 flex flex-col items-center gap-1">
                    <span className="text-[7px] font-mono text-slate-400 uppercase">Cor do Anel</span>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="color" 
                        value={ringColorCustom} 
                        onChange={(e) => setFXConfig({ ringColorCustom: e.target.value })}
                        className="w-4.5 h-4.5 bg-transparent border-0 rounded cursor-pointer"
                      />
                      <span className="text-[8px] font-mono uppercase text-white font-bold">{ringColorCustom}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Perfil de Física */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-xs text-slate-300">Física do Orbe</span>
              <div className="grid grid-cols-3 gap-1">
                {(['gel', 'mechanical', 'liquid'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFXConfig({ physicsMode: mode })}
                    className={`py-1.5 rounded-lg border transition text-[10px] font-mono uppercase ${
                      physicsMode === mode 
                        ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300 shadow-sm shadow-cyan-500/10' 
                        : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'gel' ? 'Gel' : mode === 'mechanical' ? 'Rígida' : 'Líquida'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders de Controle FX */}
            <div className="flex flex-col gap-3 font-mono text-xs">
              
              {/* Rotação */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-400">
                  <span>Rotação do Orbe</span>
                  <span className="text-cyan-400 font-bold">{rotationSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.1" max="3.0" step="0.1"
                  value={rotationSpeed} 
                  onChange={(e) => setFXConfig({ rotationSpeed: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                />
              </div>

              {/* Repulsão */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-400">
                  <span>Repulsão do Mouse</span>
                  <span className="text-cyan-400 font-bold">{repulsionStrength.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.0" max="2.5" step="0.1"
                  value={repulsionStrength} 
                  onChange={(e) => setFXConfig({ repulsionStrength: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                />
              </div>

              {/* Glow */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-400">
                  <span>Intensidade Glow</span>
                  <span className="text-cyan-400 font-bold">{glowIntensity.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.2" max="2.5" step="0.1"
                  value={glowIntensity} 
                  onChange={(e) => setFXConfig({ glowIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                />
              </div>

              {/* Estrelas */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-400">
                  <span>Vórtice das Estrelas</span>
                  <span className="text-cyan-400 font-bold">{starSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.0" max="3.0" step="0.1"
                  value={starSpeed} 
                  onChange={(e) => setFXConfig({ starSpeed: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                />
              </div>

              {/* Saturação */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-400">
                  <span>Saturação das Cores</span>
                  <span className="text-cyan-400 font-bold">{(saturation * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" min="0.0" max="2.0" step="0.1"
                  value={saturation} 
                  onChange={(e) => setFXConfig({ saturation: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                />
              </div>

              {/* Velocidade do Anel */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-400">
                  <span>Velocidade do Anel</span>
                  <span className="text-cyan-400 font-bold">{ringSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.0" max="3.0" step="0.1"
                  value={ringSpeed} 
                  onChange={(e) => setFXConfig({ ringSpeed: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                />
              </div>

              {/* Velocidade de Pulsação das Linhas (Acender / Apagar) */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-400">
                  <span>Pulsação das Linhas</span>
                  <span className="text-cyan-400 font-bold">{pulseSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.0" max="4.0" step="0.1"
                  value={pulseSpeed} 
                  onChange={(e) => setFXConfig({ pulseSpeed: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Footer de Rodapé (Instrução Sci-fi) */}
      <div className="absolute bottom-4 left-6 pointer-events-none z-10 flex flex-col font-mono text-[9px] text-slate-500">
        <span>SECURITY_PROTOCOL // ENCRYPTED</span>
        <span>SYS_STATUS // ACTIVE_LOCAL_HOST</span>
      </div>
      <div className="absolute bottom-4 right-6 pointer-events-none z-10 font-mono text-[9px] text-cyan-500/40 animate-pulse">
        <span>Passe o mouse nos quadrantes para controlar o sistema</span>
      </div>

    </div>
  );
}
