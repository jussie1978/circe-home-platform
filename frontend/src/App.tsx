import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Thermometer, 
  Wind, 
  Settings,
  Lightbulb, 
  Cpu, 
  Activity
} from 'lucide-react';
import OrbCanvas from './components/OrbCanvas';
import { useIrisStore } from './store/irisStore';
import { voiceService } from './services/voiceService';
import { IrisControlPanel } from './components/panel/IrisControlPanel';

const PANEL_W = 400;
const MARGIN = 16;
const POS_KEY = 'iris_panel_pos';

function defaultPosition() {
  return {
    x: Math.max(MARGIN, window.innerWidth - PANEL_W - MARGIN),
    y: MARGIN,
  };
}

function clampPosition(x: number, y: number) {
  const maxX = window.innerWidth - 80;
  const maxY = window.innerHeight - 80;
  return {
    x: Math.min(Math.max(MARGIN, x), maxX),
    y: Math.min(Math.max(MARGIN, y), maxY),
  };
}

function loadPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return clampPosition(parsed.x, parsed.y);
    }
  } catch { /* ignore */ }
  return defaultPosition();
}

export default function App() {
  const { 
    temperature, 
    irisState, 
    setTemperature, 
    setIrisState,
    humidity,
    tempHistory,
    fan1Speed,
    fan1Rpm,
    fan2Speed,
    fan2Rpm,
    fanMode,
    finsState,
    pcState,
    roofAngle,
    setHumidity,
    setTempHistory,
    setFan1Speed,
    setFan1Rpm,
    setFan2Speed,
    setFan2Rpm,
    setFanMode,
    setFinsState,
    setPcState,
    setRoofAngle,
    activePanel,
    setActivePanel,
    satelliteCoords,
    satellite2Coords,
    customThemeActive,
    faceDetected,
    voiceText
  } = useIrisStore();
    const R1_dyn = Math.max(500, (window.innerWidth / 2) - 40);
  const R2_dyn = R1_dyn * 0.8;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panelPos, setPanelPos] = useState(loadPosition);
  const panelRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLButtonElement>(null);

  const closePanel = useCallback(() => setSettingsOpen(false), []);

  useEffect(() => {
    if (!settingsOpen) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (settingsRef.current?.contains(t)) return;
      closePanel();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [settingsOpen, closePanel]);

  const onPanelDragEnd = useCallback((x: number, y: number) => {
    const c = clampPosition(x, y);
    setPanelPos(c);
    localStorage.setItem(POS_KEY, JSON.stringify(c));
  }, []);
  const [showDebug, setShowDebug] = useState(false);
  const [hoveredQuadrant, setHoveredQuadrant] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null);

  // Controle de arrasto em 2D do Satélite Gravitacional (Lua)
  const [isDraggingSat, setIsDraggingSat] = useState(false);
  const handleSatPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsDraggingSat(true);
    useIrisStore.setState({ isDraggingSat1: true });
  };

  useEffect(() => {
    if (!isDraggingSat) return;

    const handlePointerMove = (e: PointerEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      let newX = e.clientX - centerX;
      let newY = e.clientY - centerY;

      // Limitar o movimento para que o satélite possa se mover por todo o canvas/viewport
      // mantendo uma margem de 28px (metade do tamanho do satélite) para não sair da tela
      const limitX = centerX - 28;
      const limitY = centerY - 28;
      newX = Math.max(-limitX, Math.min(limitX, newX));
      newY = Math.max(-limitY, Math.min(limitY, newY));

      useIrisStore.setState({ satelliteCoords: { x: newX, y: newY } });
    };

    const handlePointerUp = () => {
      setIsDraggingSat(false);
      useIrisStore.setState({ isDraggingSat1: false });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingSat]);

  // Controle de arrasto em 2D do Segundo Satélite Gravitacional (10% menor)
  const [isDraggingSat2, setIsDraggingSat2] = useState(false);
  const handleSat2PointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsDraggingSat2(true);
    useIrisStore.setState({ isDraggingSat2: true });
  };

  useEffect(() => {
    if (!isDraggingSat2) return;

    const handlePointerMove = (e: PointerEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      let newX = e.clientX - centerX;
      let newY = e.clientY - centerY;

      // Limitar o movimento para que o segundo satélite possa se mover por todo o canvas/viewport
      // mantendo uma margem de 25px (metade do tamanho de 50px do satélite) para não sair da tela
      const limitX = centerX - 25;
      const limitY = centerY - 25;
      newX = Math.max(-limitX, Math.min(limitX, newX));
      newY = Math.max(-limitY, Math.min(limitY, newY));

      useIrisStore.setState({ satellite2Coords: { x: newX, y: newY } });
    };

    const handlePointerUp = () => {
      setIsDraggingSat2(false);
      useIrisStore.setState({ isDraggingSat2: false });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingSat2]);

  // Instâncias do Framer Motion useDragControls para controle de arrasto manual no visor de cabeçalho
  const dragSensors = useDragControls();
  const dragFans = useDragControls();
  const dragServos = useDragControls();
  const dragLeds = useDragControls();

  // Refs para controle do arrasto 3D no centro
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const dragBaseRef = useRef({ x: 0, y: 0 });
  
  // Controles locais (estado do dashboard)
  const [ledColor, setLedColor] = useState('#06B6D4');
  const [ledMode, setLedMode] = useState('Breath');
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Conexão WebSocket com o Backend FastAPI
  useEffect(() => {
    let shouldReconnect = true;

    const connectWS = () => {
      if (!shouldReconnect) return;

      // Usando 127.0.0.1 para evitar problemas de resolução de localhost (IPv6 vs IPv4) no Windows
      const socket = new WebSocket('ws://127.0.0.1:8001/ws');
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
          if (data.humidity !== undefined) setHumidity(data.humidity);
          if (data.tempHistory !== undefined) setTempHistory(data.tempHistory);
          if (data.fanSpeed !== undefined) {
            setFan1Speed(data.fanSpeed);
            setFan2Speed(data.fanSpeed);
          }
          if (data.fan1Speed !== undefined) setFan1Speed(data.fan1Speed);
          if (data.fan1Rpm !== undefined) setFan1Rpm(data.fan1Rpm);
          if (data.fan2Speed !== undefined) setFan2Speed(data.fan2Speed);
          if (data.fan2Rpm !== undefined) setFan2Rpm(data.fan2Rpm);
          if (data.fanMode !== undefined) setFanMode(data.fanMode);
          if (data.finsState !== undefined) setFinsState(data.finsState);
          if (data.pcState !== undefined) setPcState(data.pcState);
          if (data.roofAngle !== undefined) {
            setRoofAngle(data.roofAngle);
            if (data.finsState === undefined) {
              setFinsState(data.roofAngle > 10 ? 'open' : 'closed');
            }
          }
          if (data.voiceText !== undefined) {
            useIrisStore.setState({ voiceText: data.voiceText });
          }
          if (data.faceDetected !== undefined) {
            useIrisStore.setState({ faceDetected: data.faceDetected });
            if (data.faceDetected && data.faceX !== undefined && data.faceY !== undefined) {
              // faceX (horizontal -1..1) → dragOffset.y (rotation.y do orbe)
              // faceY (vertical -1..1)   → dragOffset.x (rotation.x do orbe), invertido (câmera espelha Y)
              const gain = 0.5; // Gain muito mais baixo para estabilizar tracking
              const maxAngle = 20 * Math.PI / 180; // Limite de 20 graus
              const rotX = Math.max(-maxAngle, Math.min(maxAngle, data.faceY * gain));
              const rotY = Math.max(-maxAngle, Math.min(maxAngle, data.faceX * gain));
              useIrisStore.setState({ dragOffset: { x: rotX, y: rotY } });
            } else if (useIrisStore.getState().snapToCenter) {
              useIrisStore.setState({ dragOffset: { x: 0, y: 0 } });
            }
          }
        } catch (err) {
          console.error('Erro ao processar dados do WS:', err);
        }
      };

      socket.onclose = () => {
        setIsWebSocketConnected(false);
        if (!shouldReconnect) return;

        console.log('Conexão fechada. Tentando reconectar em 3s...');
        reconnectTimeoutRef.current = setTimeout(connectWS, 3000);
      };
    };

    connectWS();

    return () => {
      shouldReconnect = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [
    setTemperature, 
    setIrisState, 
    setHumidity, 
    setTempHistory, 
    setFan1Speed, 
    setFan2Speed, 
    setFan1Rpm, 
    setFan2Rpm, 
    setFanMode, 
    setFinsState, 
    setPcState, 
    setRoofAngle
  ]);

  useEffect(() => {
    // O fallback local foi inteiramente removido para forçar a depuração real do sistema
    // console.log("Aguardando conexão WebSocket...");
  }, [
    isWebSocketConnected,
    setTemperature,
    setHumidity,
    setFan1Rpm,
    setFan2Rpm,
    setIrisState
  ]);

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
        await fetch('http://127.0.0.1:8001/api/v1/controls/fans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ speed: parseInt(value) }),
        });
      } else if (topic === 'alx/case/servos/angle') {
        await fetch('http://127.0.0.1:8001/api/v1/controls/servos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ angle: parseInt(value) }),
        });
      } else if (topic === 'alx/case/leds/set') {
        await fetch('http://127.0.0.1:8001/api/v1/controls/leds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ color: value }),
        });
      }
    } catch (e) {
      // Ignora erro se backend não estiver rodando
    }
  };

  const toggleVoiceSession = () => {
    if (voiceActive) {
      voiceService.disconnect();
      setVoiceActive(false);
      useIrisStore.setState({ irisState: 'idle', voiceText: '' });
    } else {
      const apiKey = localStorage.getItem('GEMINI_API_KEY') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        const inputKey = prompt("Por favor, insira sua GEMINI_API_KEY do Google AI Studio para conversar com a IRIS:");
        if (inputKey) {
          localStorage.setItem('GEMINI_API_KEY', inputKey);
          startVoiceSession(inputKey);
        }
      } else {
        startVoiceSession(apiKey);
      }
    }
  };

  const startVoiceSession = (key: string) => {
    voiceService.connect(key, 'gemini-2.5-flash', {
      onStateChange: (state) => {
        if (state === 'connecting') {
          setIrisState('listening');
        } else if (state === 'error') {
          setIrisState('critical');
        } else {
          setIrisState(state);
        }
      },
      onTextReceived: (text) => {
        useIrisStore.setState({ voiceText: text });
      },
      onToolExecuted: (name, _args, result) => {
        console.log(`Função local ${name} executada com sucesso. Resultado:`, result);
      }
    });
    setVoiceActive(true);
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
      <main className="relative h-full w-full">
      
      {/* 1. Renderização 3D Otimizada de Fundo */}
      <OrbCanvas />

      {/* Satélite Gravitacional (Lua) como Elemento DOM de alta prioridade (z-35) */}
      <div
        style={{
          position: 'absolute',
          left: `calc(50% + ${(satelliteCoords?.x ?? 180)}px - 28px)`,
          top: `calc(50% + ${(satelliteCoords?.y ?? 0)}px - 28px)`,
          width: '56px',
          height: '56px',
          zIndex: 35, // Mantém zIndex fixo em 35 para não sumir atrás do background opaco do canvas
          cursor: isDraggingSat ? 'grabbing' : 'grab',
          pointerEvents: 'auto',
          transform: `scale(${0.9 + ((satelliteCoords?.z ?? 0) / R1_dyn) * 0.45})`,
          opacity: ((satelliteCoords?.z ?? 0) < -20 && Math.sqrt(satelliteCoords.x * satelliteCoords.x + satelliteCoords.y * satelliteCoords.y) < 162)
            ? 0.05 // Oclusão atrás do orbe central
            : 0.52 + (((satelliteCoords?.z ?? 0) / R1_dyn) + 1.0) * 0.24, // Destaque de opacidade base maior (mínimo 0.52 em vez de 0.35)
          transition: 'none'
        }}
        onPointerDown={handleSatPointerDown}
        className="flex items-center justify-center select-none"
      >
        {/* Halo de energia sutil (vazado/hollow, sem sólido interno para não brigar por atenção) */}
        <div 
          className={`w-9 h-9 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
            isDraggingSat 
              ? 'border-cyan-400 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.8)] bg-cyan-500/10' 
              : 'border-cyan-400/70 hover:border-cyan-400 hover:scale-105 hover:bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.35)] bg-cyan-500/5'
          }`}
        >
          {/* Fino anel de controle interno com preenchimento sutil */}
          <div className="w-3.5 h-3.5 rounded-full border border-cyan-400/40 bg-cyan-500/10" />
        </div>

        {/* Fino anel orbital externo tracejado */}
        <div className="absolute w-14 h-14 rounded-full border border-dashed border-cyan-400/25 animate-[spin_25s_linear_infinite]" />
      </div>

      {/* Segundo Satélite Gravitacional (10% menor, cor de realce magenta/fúcsia) */}
      <div
        style={{
          position: 'absolute',
          left: `calc(50% + ${(satellite2Coords?.x ?? -180)}px - 25px)`,
          top: `calc(50% + ${(satellite2Coords?.y ?? 0)}px - 25px)`,
          width: '50px',
          height: '50px',
          zIndex: 35, // Mantém zIndex fixo em 35
          cursor: isDraggingSat2 ? 'grabbing' : 'grab',
          pointerEvents: 'auto',
          transform: `scale(${0.9 + ((satellite2Coords?.z ?? 0) / R2_dyn) * 0.45})`,
          opacity: ((satellite2Coords?.z ?? 0) < -20 && Math.sqrt(satellite2Coords.x * satellite2Coords.x + satellite2Coords.y * satellite2Coords.y) < 162)
            ? 0.05 // Oclusão atrás do orbe central
            : 0.52 + (((satellite2Coords?.z ?? 0) / R2_dyn) + 1.0) * 0.24, // Destaque de opacidade base maior (mínimo 0.52 em vez de 0.35)
          transition: 'none'
        }}
        onPointerDown={handleSat2PointerDown}
        className="flex items-center justify-center select-none"
      >
        {/* Halo de energia sutil (Fuchsia/Magenta) */}
        <div 
          className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
            isDraggingSat2 
              ? 'border-fuchsia-400 scale-110 shadow-[0_0_15px_rgba(217,70,239,0.8)] bg-fuchsia-500/10' 
              : 'border-fuchsia-400/70 hover:border-fuchsia-400 hover:scale-105 hover:bg-fuchsia-500/10 shadow-[0_0_8px_rgba(217,70,239,0.35)] bg-fuchsia-500/5'
          }`}
        >
          {/* Fino anel de controle interno */}
          <div className="w-3 h-3 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10" />
        </div>

        {/* Fino anel orbital externo tracejado */}
        <div className="absolute w-12 h-12 rounded-full border border-dashed border-fuchsia-400/25 animate-[spin_20s_linear_infinite_reverse]" />
      </div>

      {/* Ambient background glow for active/hovered quadrants */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <div 
          className={`absolute top-0 left-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.1),transparent_60%)] transition-opacity duration-500 ${
            hoveredQuadrant === 'top-left' ? 'opacity-100' : 'opacity-0'
          }`} 
        />
        <div 
          className={`absolute top-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.1),transparent_60%)] transition-opacity duration-500 ${
            hoveredQuadrant === 'top-right' ? 'opacity-100' : 'opacity-0'
          }`} 
        />
        <div 
          className={`absolute bottom-0 left-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_bottom_left,rgba(234,88,12,0.08),transparent_60%)] transition-opacity duration-500 ${
            hoveredQuadrant === 'bottom-left' ? 'opacity-100' : 'opacity-0'
          }`} 
        />
        <div 
          className={`absolute bottom-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_bottom_right,rgba(220,38,38,0.08),transparent_60%)] transition-opacity duration-500 ${
            hoveredQuadrant === 'bottom-right' ? 'opacity-100' : 'opacity-0'
          }`} 
        />
      </div>

      {/* Grid sutil de sobreposição holográfica */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#000000e0_95%)] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10 opacity-70" />

      {/* 2. Grid de 4 Quadrantes Clicáveis Invisíveis para Abertura dos Painéis */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 z-20 pointer-events-none">
        {/* Quadrante Superior Esquerdo - Sensores */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActivePanel('top-left'); }}
          onMouseEnter={() => setHoveredQuadrant('top-left')}
          onMouseLeave={() => setHoveredQuadrant(null)}
          className="pointer-events-auto cursor-pointer"
        />
        {/* Quadrante Superior Direito - Ventilação */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActivePanel('top-right'); }}
          onMouseEnter={() => setHoveredQuadrant('top-right')}
          onMouseLeave={() => setHoveredQuadrant(null)}
          className="pointer-events-auto cursor-pointer"
        />
        {/* Quadrante Inferior Esquerdo - Aletas */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActivePanel('bottom-left'); }}
          onMouseEnter={() => setHoveredQuadrant('bottom-left')}
          onMouseLeave={() => setHoveredQuadrant(null)}
          className="pointer-events-auto cursor-pointer"
        />
        {/* Quadrante Inferior Direito - Iluminação */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActivePanel('bottom-right'); }}
          onMouseEnter={() => setHoveredQuadrant('bottom-right')}
          onMouseLeave={() => setHoveredQuadrant(null)}
          className="pointer-events-auto cursor-pointer"
        />
      </div>

      {/* Área Central de Descarte (Sobre o Orbe Central, z-30 para sobrepor os quadrantes com Pointer Capture robusto) */}
      <div 
        onPointerDown={(e) => {
          e.stopPropagation();
          // Bloquear o foco do ponteiro no elemento para receber movimentos mesmo fora do círculo
          e.currentTarget.setPointerCapture(e.pointerId);
          isDraggingRef.current = true;
          dragStartRef.current = { x: e.clientX, y: e.clientY };
          
          // Capturar a rotação atual como ponto de partida para evitar saltos
          const currentOffset = useIrisStore.getState().dragOffset || { x: 0, y: 0 };
          dragBaseRef.current = { x: currentOffset.x, y: currentOffset.y };
          
          hasDraggedRef.current = false;
        }}
        onPointerMove={(e) => {
          if (!isDraggingRef.current) return;
          e.stopPropagation();
          const dX = e.clientX - dragStartRef.current.x;
          const dY = e.clientY - dragStartRef.current.y;
          if (Math.abs(dX) > 4 || Math.abs(dY) > 4) {
            hasDraggedRef.current = true;
          }
          
          // Limitar inclinação a no máximo 30 graus (~0.52 rad) com maior sensibilidade
          const maxRot = 30 * Math.PI / 180;
          const rotY = Math.max(-maxRot, Math.min(maxRot, dragBaseRef.current.y + dX * 0.0035));
          const rotX = Math.max(-maxRot, Math.min(maxRot, dragBaseRef.current.x + dY * 0.0035));
          
          useIrisStore.setState({ dragOffset: { x: rotX, y: rotY } });
        }}
        onPointerUp={(e) => {
          if (isDraggingRef.current) {
            e.stopPropagation();
            e.currentTarget.releasePointerCapture(e.pointerId);
            isDraggingRef.current = false;
            
            // Retorna ao centro somente se o snap estiver ativo
            if (useIrisStore.getState().snapToCenter) {
              useIrisStore.setState({ dragOffset: { x: 0, y: 0 } });
            }
            
            if (!hasDraggedRef.current) {
              if (activePanel && activePanel.length > 0) {
                setActivePanel(null);
              } else {
                toggleVoiceSession();
              }
            }
          }
        }}
        onPointerCancel={(e) => {
          if (isDraggingRef.current) {
            e.currentTarget.releasePointerCapture(e.pointerId);
            isDraggingRef.current = false;
            
            // Retorna ao centro somente se o snap estiver ativo
            if (useIrisStore.getState().snapToCenter) {
              useIrisStore.setState({ dragOffset: { x: 0, y: 0 } });
            }
          }
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full z-30 pointer-events-auto cursor-grab active:cursor-grabbing"
      />

      {/* Central HUD Close Hint (Anel tracejado rotativo sutil indicando que a área central fecha o painel ativo) */}
      {activePanel.length > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-dashed border-white/10 animate-spin-slow pointer-events-none z-20" />
      )}

      {/* 3. Diagnósticos e Telemetria (Lista CRT no Canto Superior Esquerdo) */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-1.5 font-mono text-[10px] pointer-events-auto bg-black/85 border border-[var(--iris-border)] p-3 text-[var(--iris-phosphor)] w-48 shadow-[0_0_10px_rgba(42,92,58,0.25)] select-none">
        {/* Cabeçalho do Monitor */}
        <div className="text-[var(--iris-phosphor-dim)] font-bold border-b border-[var(--iris-border)] pb-1 mb-1 tracking-widest flex items-center justify-between">
          <span>IRIS_MONITOR</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isWebSocketConnected ? 'bg-cyan-400 animate-pulse' : 'bg-amber-500'}`} />
        </div>
        
        {/* Linhas de Telemetria */}
        <div className="flex justify-between items-center">
          <span className="text-[var(--iris-phosphor-dim)]">STATE:</span>
          <span className="font-bold text-white tracking-wide">{irisState}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--iris-phosphor-dim)]">TEMP:</span>
          <span className="font-bold text-white">{temperature}°C</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--iris-phosphor-dim)]">HOST:</span>
          <span className={`font-bold ${pcState === 'on' ? 'text-[var(--iris-phosphor)]' : 'text-zinc-500'}`}>{pcState.toUpperCase()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--iris-phosphor-dim)]">CONN:</span>
          <span className={`font-bold ${isWebSocketConnected ? 'text-[var(--iris-phosphor)]' : 'text-amber-500'}`}>
            {isWebSocketConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--iris-phosphor-dim)]">AI_VISION:</span>
          <span className={`font-bold ${faceDetected ? 'text-[var(--iris-phosphor)]' : 'text-zinc-500'}`}>
            {faceDetected ? 'TRACKING' : 'LOCKED'}
          </span>
        </div>

        {/* Console de Debug (Colapsável) */}
        <div className="border-t border-[var(--iris-border)] pt-1.5 mt-1 flex flex-col gap-1">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="w-full text-left text-[9px] tracking-wider text-[var(--iris-phosphor-dim)] hover:text-[var(--iris-phosphor)] transition-colors uppercase font-bold flex items-center justify-between"
          >
            <span>[ DEBUG_CONSOLE ]</span>
            <span className="font-bold">{showDebug ? '▼' : '►'}</span>
          </button>

          <AnimatePresence>
            {showDebug && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden flex flex-col gap-1.5 mt-1.5 bg-black/60 p-1.5 border border-[var(--iris-border)]/50"
              >
                <span className="text-[8px] text-[var(--iris-phosphor-dim)] font-bold">FORCE STATE:</span>
                <div className="grid grid-cols-3 gap-1">
                  <button 
                    onClick={() => setIrisState('idle')}
                    className={`py-0.5 text-[8px] border font-bold ${irisState === 'idle' ? 'bg-[var(--iris-phosphor)] text-black border-[var(--iris-phosphor)]' : 'border-[var(--iris-border)] text-[var(--iris-phosphor)] hover:bg-emerald-500/10'}`}
                  >
                    IDLE
                  </button>
                  <button 
                    onClick={() => setIrisState('listening')}
                    className={`py-0.5 text-[8px] border font-bold ${irisState === 'listening' ? 'bg-[var(--iris-phosphor)] text-black border-[var(--iris-phosphor)]' : 'border-[var(--iris-border)] text-[var(--iris-phosphor)] hover:bg-emerald-500/10'}`}
                  >
                    LIST
                  </button>
                  <button 
                    onClick={() => setIrisState('speaking')}
                    className={`py-0.5 text-[8px] border font-bold ${irisState === 'speaking' ? 'bg-[var(--iris-phosphor)] text-black border-[var(--iris-phosphor)]' : 'border-[var(--iris-border)] text-[var(--iris-phosphor)] hover:bg-emerald-500/10'}`}
                  >
                    SPK
                  </button>
                </div>
                <div className="flex flex-col gap-1 border-t border-[var(--iris-border)]/30 pt-1 mt-0.5">
                  <span className="text-[8px] text-[var(--iris-phosphor-dim)] font-bold">FORCE HOST:</span>
                  <button 
                    onClick={() => setPcState(pcState === 'on' ? 'off' : 'on')}
                    className={`w-full py-0.5 text-[8px] border font-bold ${pcState === 'on' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-zinc-800 text-slate-400 border-transparent hover:text-white'}`}
                  >
                    TOGGLE
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Overlay de Cantoneiras Guia (HUD Dinâmico e Responsivo) */}
      <div className="absolute top-[8%] bottom-[8%] left-[16%] right-[16%] pointer-events-none z-30">
        {/* Canto Superior Esquerdo - Telemetria */}
        <div className="absolute top-0 left-0 flex flex-col gap-2">
          <div className={`w-5 h-5 border-t-2 border-l-2 transition-all duration-300 ${
            hoveredQuadrant === 'top-left' || activePanel.includes('top-left')
              ? 'border-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] scale-105' 
              : 'border-cyan-500/20'
          }`} />
          <span className={`font-mono text-[9px] tracking-widest transition-all duration-300 ${
            hoveredQuadrant === 'top-left' || activePanel.includes('top-left')
              ? 'text-cyan-400 opacity-100 translate-y-0' 
              : 'text-cyan-500/40 opacity-0 -translate-y-1'
          }`}>
            [ LAUNCH_TELEMETRIA ]
          </span>
        </div>

        {/* Canto Superior Direito - Ventilação */}
        <div className="absolute top-0 right-0 flex flex-col items-end gap-2">
          <div className={`w-5 h-5 border-t-2 border-r-2 transition-all duration-300 ${
            hoveredQuadrant === 'top-right' || activePanel.includes('top-right')
              ? 'border-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] scale-105' 
              : 'border-purple-500/20'
          }`} />
          <span className={`font-mono text-[9px] tracking-widest transition-all duration-300 ${
            hoveredQuadrant === 'top-right' || activePanel.includes('top-right')
              ? 'text-purple-400 opacity-100 translate-y-0' 
              : 'text-purple-500/40 opacity-0 -translate-y-1'
          }`}>
            [ ACCESS_VENTILATION ]
          </span>
        </div>

        {/* Canto Inferior Esquerdo - Aletas */}
        <div className="absolute bottom-0 left-0 flex flex-col gap-2 justify-end">
          <span className={`font-mono text-[9px] tracking-widest transition-all duration-300 order-1 ${
            hoveredQuadrant === 'bottom-left' || activePanel.includes('bottom-left')
              ? 'text-orange-400 opacity-100 translate-y-0' 
              : 'text-orange-500/40 opacity-0 translate-y-1'
          }`}>
            [ ADJUST_APERTURE ]
          </span>
          <div className={`w-5 h-5 border-b-2 border-l-2 transition-all duration-300 order-2 ${
            hoveredQuadrant === 'bottom-left' || activePanel.includes('bottom-left')
              ? 'border-orange-400 drop-shadow-[0_0_6px_rgba(234,88,12,0.8)] scale-105' 
              : 'border-orange-500/20'
          }`} />
        </div>

        {/* Canto Inferior Direito - Iluminação */}
        <div className="absolute bottom-0 right-0 flex flex-col items-end gap-2 justify-end">
          <span className={`font-mono text-[9px] tracking-widest transition-all duration-300 order-1 ${
            hoveredQuadrant === 'bottom-right' || activePanel.includes('bottom-right')
              ? 'text-red-400 opacity-100 translate-y-0' 
              : 'text-red-500/40 opacity-0 translate-y-1'
          }`}>
            [ LIGHTING_CONTROLS ]
          </span>
          <div className={`w-5 h-5 border-b-2 border-r-2 transition-all duration-300 order-2 ${
            hoveredQuadrant === 'bottom-right' || activePanel.includes('bottom-right')
              ? 'border-red-500 drop-shadow-[0_0_6px_rgba(220,38,38,0.8)] scale-105' 
              : 'border-red-500/20'
          }`} />
        </div>
      </div>

      {/* Backdrop de desfocagem (glassmorphism) e clique fora para fechar painéis */}
      {activePanel.length > 0 && (
        <div 
          onClick={() => {
            setActivePanel(null);
          }}
          className="fixed inset-0 z-30 pointer-events-auto transition-all bg-black/25 backdrop-blur-[1.5px]"
        />
      )}

      {/* 5. Painéis de Controle Ativados no Clique via Satélites 3D (Animados via AnimatePresence) */}
      <div className="absolute inset-10 pointer-events-none z-40">
        <AnimatePresence custom={activePanel}>
          
          {/* PAINEL: SENSORES (Superior Esquerdo) */}
          {activePanel.includes('top-left') && (
            <motion.div
              custom="top-left"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-[12%] left-[8%] w-80 diesel-panel glow-panel-cyan p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-2xl border-2 border-zinc-700 backdrop-blur-md bg-opacity-90 select-none"
              drag
              dragControls={dragSensors}
              dragListener={false}
              dragMomentum={false}
            >
              {/* Rebites mecânicos nos cantos */}
              <div className="mechanical-rivet top-2 left-2" />
              <div className="mechanical-rivet top-2 right-2" />
              <div className="mechanical-rivet bottom-2 left-2" />
              <div className="mechanical-rivet bottom-2 right-2" />

              {/* Visor CRT que atua como alça de arrasto */}
              <div 
                onPointerDown={(e) => dragSensors.start(e)}
                className="crt-screen w-full py-2 px-3.5 rounded-lg flex items-center justify-between border border-zinc-950 cursor-grab active:cursor-grabbing select-none"
              >
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4.5 h-4.5 text-crt-cyan" />
                  <h2 className="font-bold tracking-wider uppercase font-mono text-xs text-crt-cyan">TELEMETRIA_DHT22</h2>
                </div>
                <Activity className="w-3.5 h-3.5 text-crt-cyan animate-pulse" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/55 p-3 rounded-xl border border-zinc-800 flex flex-col gap-1 shadow-inner">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Temperatura</span>
                  <span className="text-xl font-mono font-bold text-crt-cyan">{temperature}°C</span>
                </div>
                <div className="bg-black/55 p-3 rounded-xl border border-zinc-800 flex flex-col gap-1 shadow-inner">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Umidade</span>
                  <span className="text-xl font-mono font-bold text-crt-cyan">{humidity}%</span>
                </div>
              </div>

              {/* Gráfico Histórico CRT */}
              <div className="crt-screen p-3 rounded-xl border border-zinc-950 flex flex-col gap-1">
                <span className="text-[9px] font-mono text-crt-cyan uppercase font-bold">HISTÓRICO_TÉRMICO_24H</span>
                <div className="w-full h-16 mt-1 relative flex items-end">
                  {/* Grade de fundo do gráfico */}
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 pointer-events-none opacity-10">
                    <div className="border-b border-r border-crt-cyan"></div>
                    <div className="border-b border-r border-crt-cyan"></div>
                    <div className="border-b border-r border-crt-cyan"></div>
                    <div className="border-b border-r border-crt-cyan"></div>
                    <div className="border-b border-r border-crt-cyan"></div>
                    <div className="border-b border-crt-cyan"></div>
                    <div className="border-b border-r border-crt-cyan"></div>
                    <div className="border-b border-r border-crt-cyan"></div>
                    <div className="border-b border-r border-crt-cyan"></div>
                    <div className="border-b border-r border-crt-cyan"></div>
                    <div className="border-b border-r border-crt-cyan"></div>
                    <div className="border-b border-crt-cyan"></div>
                    <div className="border-r border-crt-cyan"></div>
                    <div className="border-r border-crt-cyan"></div>
                    <div className="border-r border-crt-cyan"></div>
                    <div className="border-r border-crt-cyan"></div>
                    <div className="border-r border-crt-cyan"></div>
                    <div></div>
                  </div>
                  {/* Gráfico SVG */}
                  <svg className="w-full h-full" viewBox="0 0 240 60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#00f3ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {tempHistory && tempHistory.length > 1 && (
                      <>
                        <path
                          d={`M ${tempHistory.map((temp, index) => {
                            const x = (index / (tempHistory.length - 1)) * 240;
                            // Normaliza a temp de 20 a 85
                            const normTemp = (temp - 20) / (85 - 20);
                            const y = 60 - normTemp * 50 - 5;
                            return `${x} ${y}`;
                          }).join(' L ')} L 240 60 L 0 60 Z`}
                          fill="url(#chartGlow)"
                        />
                        <path
                          d={`M ${tempHistory.map((temp, index) => {
                            const x = (index / (tempHistory.length - 1)) * 240;
                            const normTemp = (temp - 20) / (85 - 20);
                            const y = 60 - normTemp * 50 - 5;
                            return `${x} ${y}`;
                          }).join(' L ')}`}
                          fill="none"
                          stroke="#00f3ff"
                          strokeWidth="2"
                          className="drop-shadow-[0_0_3px_rgba(0,243,255,0.7)]"
                        />
                      </>
                    )}
                  </svg>
                </div>
              </div>

              {/* Visor de logs CRT verde secundário */}
              <div className="crt-screen p-3 rounded-xl border border-zinc-950 flex flex-col gap-1.5 text-[9px]">
                <div className="text-crt-green uppercase font-bold pb-1 border-b border-[#0f2415] mb-0.5">ÚLTIMOS_LOGS_SYS:</div>
                <div className="flex justify-between text-crt-green">
                  <span>[17:42] TEMP_READ_OK</span>
                  <span>{temperature}°C</span>
                </div>
                <div className="flex justify-between text-crt-green opacity-60">
                  <span>[17:40] FAN_SPEED_AUTO</span>
                  <span>PWM_60%</span>
                </div>
                <div className="flex justify-between text-crt-green opacity-60">
                  <span>[17:35] WEBSOCKET_CONNECT</span>
                  <span>ONLINE</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* PAINEL: VENTILAÇÃO (Superior Direito) */}
          {activePanel.includes('top-right') && (
            <motion.div
              custom="top-right"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-[12%] right-[8%] w-80 diesel-panel glow-panel-purple p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-2xl border-2 border-zinc-700 backdrop-blur-md bg-opacity-90 select-none"
              drag
              dragControls={dragFans}
              dragListener={false}
              dragMomentum={false}
            >
              {/* Rebites mecânicos nos cantos */}
              <div className="mechanical-rivet top-2 left-2" />
              <div className="mechanical-rivet top-2 right-2" />
              <div className="mechanical-rivet bottom-2 left-2" />
              <div className="mechanical-rivet bottom-2 right-2" />

              {/* Visor CRT que atua como alça de arrasto */}
              <div 
                onPointerDown={(e) => dragFans.start(e)}
                className="crt-screen w-full py-2 px-3.5 rounded-lg flex items-center justify-between border border-zinc-950 cursor-grab active:cursor-grabbing select-none"
              >
                <div className="flex items-center gap-2">
                  <Wind className="w-4.5 h-4.5 text-crt-purple" />
                  <h2 className="font-bold tracking-wider uppercase font-mono text-xs text-crt-purple">FANS PWM</h2>
                </div>
                <svg
                  className="w-4.5 h-4.5 text-crt-purple"
                  viewBox="0 0 100 100"
                  style={{
                    animation: fan1Speed > 0 ? `spin ${(100 - fan1Speed) * 0.005 + 0.08}s linear infinite` : 'none',
                    transformOrigin: '50px 50px'
                  }}
                >
                  <circle cx="50" cy="50" r="12" fill="currentColor" />
                  <path d="M50 40 C42 20, 58 10, 50 2 C42 10, 42 20, 50 40 Z" fill="currentColor" />
                  <path d="M60 50 C80 42, 90 58, 98 50 C90 42, 80 42, 60 50 Z" fill="currentColor" />
                  <path d="M50 60 C58 80, 42 90, 50 98 C58 90, 58 80, 50 60 Z" fill="currentColor" />
                  <path d="M40 50 C20 58, 10 42, 2 50 C10 58, 20 58, 40 50 Z" fill="currentColor" />
                </svg>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-xs items-center">
                  <span className="text-slate-400">Velocidade dos Fans</span>
                  <span className="text-crt-purple font-mono font-bold text-xs bg-black/40 px-1.5 py-0.5 rounded border border-zinc-800">
                    F1: {fan1Speed}% | F2: {fan2Speed}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={fan1Speed} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFan1Speed(val);
                    setFan2Speed(val);
                    setFanMode('manual');
                    sendControl('alx/case/fans/set', val.toString());
                  }}
                  className="w-full cursor-pointer accent-slider-purple" 
                />
              </div>

              {/* Leituras individuais de RPM */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/55 p-2.5 rounded-xl border border-zinc-800 flex flex-col gap-0.5 shadow-inner">
                  <span className="text-[8px] font-mono text-slate-500 uppercase font-bold">FAN_1 (Admissão)</span>
                  <span className="text-sm font-mono font-bold text-crt-purple">{fan1Rpm} RPM</span>
                </div>
                <div className="bg-black/55 p-2.5 rounded-xl border border-zinc-800 flex flex-col gap-0.5 shadow-inner">
                  <span className="text-[8px] font-mono text-slate-500 uppercase font-bold">FAN_2 (Exaustão)</span>
                  <span className="text-sm font-mono font-bold text-crt-purple">{fan2Rpm} RPM</span>
                </div>
              </div>

              {/* Seletor de Modo Fan (Auto / Manual / Silent) */}
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Modo de Operação</span>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                  {['auto', 'manual', 'silent'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setFanMode(mode as any);
                        sendControl('alx/case/fans/mode', mode);
                        if (mode === 'silent') {
                          setFan1Speed(20);
                          setFan2Speed(20);
                          sendControl('alx/case/fans/set', '20');
                        }
                      }}
                      className={`py-1.5 rounded-lg border transition active:translate-y-0.5 shadow ${
                        fanMode === mode 
                          ? 'bg-purple-950/20 border-purple-500/30 text-purple-300' 
                          : 'bg-black/55 border-zinc-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* PAINEL: ALETAS DO TETO (Inferior Esquerdo) */}
          {activePanel.includes('bottom-left') && (
            <motion.div
              custom="bottom-left"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-[55%] left-[8%] w-80 iris-panel-container pointer-events-auto select-none"
              drag
              dragControls={dragServos}
              dragListener={false}
              dragMomentum={false}
            >
              {/* Detalhes de cantos metálicos no Bezel */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--iris-border)]" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[var(--iris-border)]" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[var(--iris-border)]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--iris-border)]" />

              <aside 
                className="iris-panel shrink-0"
                style={{ height: 'auto', minHeight: 'unset', maxHeight: 'none', width: '100%', padding: '12px 14px 16px' }}
              >
                <div className="iris-panel-screen-glow" />

                <header 
                  onPointerDown={(e) => dragServos.start(e)}
                  className="iris-panel-header mb-4 flex justify-between items-center border-b border-[var(--iris-border)] pb-2 cursor-grab active:cursor-grabbing font-mono font-bold text-[10px] tracking-widest text-[var(--iris-phosphor)]"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" />
                    <span>ALETAS_ALX // CONTROL</span>
                  </div>
                  <Cpu className="w-3.5 h-3.5 animate-pulse" />
                </header>

                <div className="flex flex-col gap-3 relative z-10">
                {/* Status Físico de Diagnóstico */}
                <div className="flex justify-between items-center bg-black/60 p-2.5 border border-[var(--iris-border)] shadow-inner">
                  <span className="font-mono text-[9px] text-[var(--iris-phosphor-dim)] font-bold uppercase">ESTADO FÍSICO</span>
                  <span className={`font-mono text-[9px] uppercase font-bold px-2 py-0.5 border ${
                    finsState === 'open' ? 'bg-[var(--iris-phosphor)]/20 border-[var(--iris-phosphor)]/50 text-[var(--iris-phosphor)]' :
                    finsState === 'closed' ? 'bg-black/80 border-[var(--iris-border)]/50 text-[var(--iris-phosphor-dim)]' :
                    'bg-amber-950/40 border-amber-500/50 text-amber-400 animate-pulse'
                  }`}>
                    {finsState}
                  </span>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  
                  {finsState === 'homing' ? (
                    <div className="w-full bg-amber-950/40 border border-amber-500/50 p-3 flex flex-col items-center justify-center gap-2 animate-pulse">
                      <Cpu className="w-5 h-5 text-amber-400 animate-spin" />
                      <span className="font-mono text-[10px] text-amber-400 font-bold tracking-widest text-center">
                        CALIBRANDO ALETAS...
                      </span>
                      <span className="font-mono text-[8px] text-amber-500/70 text-center">
                        Aguarde a deteccao de limite zero.
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between font-mono text-[10px] items-center px-1">
                        <span className="text-[var(--iris-phosphor-dim)]">ABERTURA: <span className="text-[var(--iris-phosphor)] font-bold">{roofAngle}%</span></span>
                      </div>
                      
                      <div className="px-1 py-2">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={roofAngle} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setFinsState('moving');
                            setRoofAngle(val);
                            sendControl('alx/case/servos/angle', val.toString());
                            if (!isWebSocketConnected) {
                              if ((window as any).finsTimeout) clearTimeout((window as any).finsTimeout);
                              (window as any).finsTimeout = setTimeout(() => {
                                setFinsState(val > 10 ? 'open' : 'closed');
                              }, 2000);
                            }
                          }}
                          className="iris-slider w-full cursor-pointer" 
                        />
                      </div>

                      <div className="flex justify-between gap-2 mt-1">
                        <button 
                          onClick={() => { 
                            setFinsState('moving');
                            setRoofAngle(100); 
                            sendControl('alx/case/servos/angle', '100');
                          }}
                          className={`iris-btn flex-1 flex justify-center items-center gap-2 ${
                            roofAngle === 100 
                            ? 'bg-[var(--iris-phosphor)]/20 shadow-[0_0_8px_rgba(61,255,122,0.15)] border-[var(--iris-phosphor)]' 
                            : ''
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${roofAngle === 100 ? 'bg-[var(--iris-phosphor)]' : 'bg-[var(--iris-phosphor-dim)]'}`}></div>
                          MAX (100%)
                        </button>
                        
                        <button 
                          onClick={() => { 
                            setFinsState('moving');
                            setRoofAngle(0); 
                            sendControl('alx/case/servos/angle', '0');
                          }}
                          className={`iris-btn flex-1 flex justify-center items-center gap-2 ${
                            roofAngle === 0 
                            ? 'bg-[var(--iris-phosphor)]/20 shadow-[0_0_8px_rgba(61,255,122,0.15)] border-[var(--iris-phosphor)]' 
                            : ''
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${roofAngle === 0 ? 'bg-[var(--iris-phosphor)]' : 'bg-[var(--iris-phosphor-dim)]'}`}></div>
                          MIN (0%)
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Visualizador Esquemático de Aletas */}
                <div className="mt-2 bg-black/60 p-2 border border-[var(--iris-border)] flex flex-col items-center justify-center gap-1 h-14 relative overflow-hidden">
                  <div className="absolute top-0.5 left-2 text-[7px] font-mono text-[var(--iris-phosphor-dim)] uppercase">MECHANICAL_FINS_PROFILE</div>
                  <div className="flex gap-6 items-center justify-center mt-2.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="w-8 h-1 bg-[var(--iris-phosphor)] transition-transform duration-300 shadow-[0_0_6px_var(--iris-phosphor)]"
                        style={{
                          transform: `rotate(${-(roofAngle * 0.5)}deg)`,
                          transformOrigin: 'center'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              </aside>
            </motion.div>
          )}

          {/* PAINEL: ILUMINAÇÃO (Inferior Direito) */}
          {activePanel.includes('bottom-right') && (
            <motion.div
              custom="bottom-right"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-[12%] right-[8%] w-80 diesel-panel glow-panel-rose p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-2xl border-2 border-zinc-700 backdrop-blur-md bg-opacity-90 select-none"
              drag
              dragControls={dragLeds}
              dragListener={false}
              dragMomentum={false}
            >
              {/* Rebites mecânicos nos cantos */}
              <div className="mechanical-rivet top-2 left-2" />
              <div className="mechanical-rivet top-2 right-2" />
              <div className="mechanical-rivet bottom-2 left-2" />
              <div className="mechanical-rivet bottom-2 right-2" />

              {/* Visor CRT que atua como alça de arrasto */}
              <div 
                onPointerDown={(e) => dragLeds.start(e)}
                className="crt-screen w-full py-2 px-3.5 rounded-lg flex items-center justify-between border border-zinc-950 cursor-grab active:cursor-grabbing select-none"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4.5 h-4.5 text-crt-red" />
                  <h2 className="font-bold tracking-wider uppercase font-mono text-xs text-crt-red">LEDS WS2812B</h2>
                </div>
                <Lightbulb className="w-3.5 h-3.5 text-crt-red animate-pulse" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center bg-black/25 p-2 rounded-xl border border-zinc-850 shadow-inner">
                  <span className="font-mono text-xs text-slate-450">Cor dos LEDs</span>
                  <div className="flex items-center gap-2.5">
                    {/* Lâmpada indicadora 3D que serve de capa para o color picker */}
                    <div 
                      className="glowing-lamp shadow-md"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${ledColor} 0%, #200404 80%, #000 100%)`,
                        boxShadow: `0 0 10px ${ledColor}, inset 0 -3px 6px rgba(0,0,0,0.8), inset 0 3px 6px rgba(255,255,255,0.4)`
                      }}
                    >
                      <input 
                        type="color" 
                        value={ledColor} 
                        onChange={(e) => {
                          setLedColor(e.target.value);
                          sendControl('alx/case/leds/set', e.target.value);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                    <span className="font-mono text-xs uppercase text-white font-bold">{ledColor}</span>
                  </div>
                </div>

                {/* Visualizador Esquemático da Fita de LEDs */}
                <div className="crt-screen p-2 rounded-xl border border-zinc-950 flex flex-col justify-center gap-1 h-14 relative overflow-hidden">
                  <div className="absolute top-0.5 left-2 text-[7px] font-mono text-crt-red/60 uppercase">LED_STRIP_MATRIX</div>
                  <div className="flex gap-2.5 items-center justify-center mt-2.5">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                      let color = ledColor;
                      if (ledMode === 'Rainbow') {
                        const hue = (i * 45) % 360;
                        color = `hsl(${hue}, 100%, 50%)`;
                      }
                      
                      const opacity = ledMode === 'Breath' 
                        ? 0.4 + 0.6 * Math.sin(Date.now() * 0.005 + i * 0.5) 
                        : 1.0;
                      
                      return (
                        <div 
                          key={i} 
                          className="w-3.5 h-3.5 rounded-full border border-black/50 transition-all duration-300"
                          style={{
                            backgroundColor: color,
                            opacity: opacity,
                            boxShadow: `0 0 8px ${color}`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Efeitos Rápidos</span>
                  <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                    {['Solid', 'Breath', 'Rainbow'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setLedMode(mode);
                          sendControl('alx/case/leds/mode', mode.toLowerCase());
                        }}
                        className={`py-1.5 rounded-lg border transition active:translate-y-0.5 shadow ${
                          ledMode === mode 
                            ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' 
                            : 'bg-black/55 border-zinc-800 text-slate-400 hover:text-white'
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


      {/* 6. Barra de Status Central Inferior (Reativa ao estado térmico e da IRIS) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="glass-panel px-6 py-2 rounded-full border border-white/5 flex items-center gap-3 shadow-md transition-all duration-300">
          <span 
            className="w-2.5 h-2.5 rounded-full animate-pulse" 
            style={{
              backgroundColor: 
                irisState === 'critical' || temperature >= 75 ? '#DC2626' : 
                temperature >= 68 ? '#EA580C' : 
                temperature >= 60 ? '#F59E0B' : 
                irisState === 'listening' ? '#7C3AED' : 
                irisState === 'speaking' ? '#F8FAFC' : 
                '#06B6D4', 
              boxShadow: `0 0 8px ${
                irisState === 'critical' || temperature >= 75 ? '#DC2626' :
                temperature >= 68 ? '#EA580C' :
                temperature >= 60 ? '#F59E0B' :
                irisState === 'listening' ? '#7C3AED' :
                irisState === 'speaking' ? '#F8FAFC' :
                '#06B6D4'
              }`
            }}
          />
          <span className="font-mono text-[9px] tracking-[3px] uppercase font-bold text-slate-300">
            {
              irisState === 'critical' || temperature >= 75 ? 'ALERTA TÉRMICO' :
              temperature >= 68 ? 'AQUECIMENTO ALTO' :
              temperature >= 60 ? 'AQUECENDO' :
              irisState === 'listening' ? 'IRIS OUVINDO' :
              irisState === 'speaking' ? 'IRIS FALANDO' :
              'IRIS ONLINE'
            }
          </span>
          <div className="w-[1px] h-3 bg-white/10" />
          <span 
            className="font-mono text-[9px] font-bold"
            style={{
              color: 
                irisState === 'critical' || temperature >= 75 ? '#DC2626' :
                temperature >= 68 ? '#EA580C' :
                temperature >= 60 ? '#F59E0B' :
                '#94a3b8'
            }}
          >
            {temperature}°C
          </span>
        </div>
      </div>

      {/* 7. Footer de Rodapé (Instrução Sci-fi) */}
      <div className="absolute bottom-4 left-6 pointer-events-none z-10 flex flex-col font-mono text-[9px] text-slate-500">
        <span>SECURITY_PROTOCOL // ENCRYPTED</span>
        <span>SYS_STATUS // ACTIVE_LOCAL_HOST</span>
      </div>
      
      {/* Legendas CRT de Voz */}
      {(irisState === 'speaking' || irisState === 'listening') && voiceText && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 max-w-[600px] text-center bg-black/80 border border-[var(--iris-phosphor)]/30 px-4 py-2 font-mono text-[10px] text-[var(--iris-phosphor)] shadow-[0_0_10px_rgba(6,182,212,0.15)] select-none pointer-events-none tracking-wide rounded-sm">
          <span className="opacity-60 mr-1.5">&gt;&gt; IRIS:</span>
          <span>{voiceText}</span>
          <span className="inline-block w-1 h-2.5 ml-1 bg-[var(--iris-phosphor)] animate-pulse align-middle" />
        </div>
      )}

      <div className="absolute bottom-4 right-6 pointer-events-none z-10 font-mono text-[9px] text-cyan-500/40 animate-pulse">
        <span>Clique no centro para conversar com a IRIS // Passe nos quadrantes para controlar</span>
      </div>

        {!settingsOpen && (
          <button
            ref={settingsRef}
            type="button"
            aria-label="Configurações IRIS"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen(true)}
            className="iris-settings-btn absolute top-6 right-6 z-40"
          >
            <Settings className="h-5 w-5" />
          </button>
        )}
      </main>

      {settingsOpen && (
        <>
          <div
            className={`iris-backdrop fixed inset-0 z-40 bg-black/55 transition-all duration-300 ${
              customThemeActive ? '' : 'backdrop-blur-[1.5px]'
            }`}
            aria-hidden
            onClick={closePanel}
          />
          <div
            ref={panelRef}
            className="fixed z-50"
            style={{ left: panelPos.x, top: panelPos.y }}
          >
            <IrisControlPanel
              onClose={closePanel}
              onDragEnd={onPanelDragEnd}
              position={panelPos}
              onPositionChange={setPanelPos}
            />
          </div>
        </>
      )}
    </div>
  );
}
