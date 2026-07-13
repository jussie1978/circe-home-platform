import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
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

const FACTORY_PRESETS = [
  {
    name: 'Padrão IRIS',
    isFactory: true,
    rotationSpeed: 1.0,
    repulsionStrength: 1.0,
    glowIntensityBars: 1.2,
    glowIntensityLines: 1.2,
    barPulseSpeed: 1.0,
    barGlowPulseSpeed: 1.0,
    starSpeed: 1.0,
    saturation: 1.0,
    ringSpeed: 1.0,
    pulseSpeed: 1.0,
    physicsMode: 'gel' as const,
    customThemeActive: false,
    primaryColor: '#00f3ff',
    secondaryColor: '#00aaff',
    tertiaryColor: '#d946ef',
    ringColorCustom: '#00f3ff',
  },
  {
    name: 'Supernova',
    isFactory: true,
    rotationSpeed: 1.5,
    repulsionStrength: 1.6,
    glowIntensityBars: 1.8,
    glowIntensityLines: 1.8,
    barPulseSpeed: 2.2,
    barGlowPulseSpeed: 2.0,
    starSpeed: 2.2,
    saturation: 1.5,
    ringSpeed: 1.8,
    pulseSpeed: 2.0,
    physicsMode: 'liquid' as const,
    customThemeActive: true,
    primaryColor: '#ff5500',
    secondaryColor: '#ff9900',
    tertiaryColor: '#ff0055',
    ringColorCustom: '#ff5500',
  },
  {
    name: 'Aurora',
    isFactory: true,
    rotationSpeed: 0.5,
    repulsionStrength: 0.8,
    glowIntensityBars: 1.1,
    glowIntensityLines: 1.1,
    barPulseSpeed: 0.4,
    barGlowPulseSpeed: 0.5,
    starSpeed: 0.6,
    saturation: 0.8,
    ringSpeed: 0.5,
    pulseSpeed: 0.6,
    physicsMode: 'gel' as const,
    customThemeActive: true,
    primaryColor: '#00ff66',
    secondaryColor: '#00f3ff',
    tertiaryColor: '#7c3aed',
    ringColorCustom: '#00ff66',
  },
  {
    name: 'Vortex',
    isFactory: true,
    rotationSpeed: 2.2,
    repulsionStrength: 1.4,
    glowIntensityBars: 0.9,
    glowIntensityLines: 0.9,
    barPulseSpeed: 1.5,
    barGlowPulseSpeed: 1.2,
    starSpeed: 0.3,
    saturation: 1.3,
    ringSpeed: 2.0,
    pulseSpeed: 3.0,
    physicsMode: 'mechanical' as const,
    customThemeActive: true,
    primaryColor: '#ef4444',
    secondaryColor: '#ff007f',
    tertiaryColor: '#64748b',
    ringColorCustom: '#ef4444',
  }
];

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
    glowIntensityBars,
    glowIntensityLines,
    barPulseSpeed,
    barGlowPulseSpeed,
    saturation,
    ringColorCustom,
    ringSpeed,
    pulseSpeed,
    activePanel,
    setActivePanel,
    snapToCenter,
    setFXConfig
  } = useIrisStore();
  const [showFXSettings, setShowFXSettings] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [hoveredQuadrant, setHoveredQuadrant] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null);

  // Instâncias do Framer Motion useDragControls para controle de arrasto manual no visor de cabeçalho
  const dragSensors = useDragControls();
  const dragFans = useDragControls();
  const dragServos = useDragControls();
  const dragLeds = useDragControls();
  const dragFX = useDragControls();

  // Refs para controle do arrasto 3D no centro
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const dragBaseRef = useRef({ x: 0, y: 0 });
  
  // Controles locais (estado do dashboard)
  const [fanSpeed, setFanSpeed] = useState(60);
  const [roofAngle, setRoofAngle] = useState(90);
  const [ledColor, setLedColor] = useState('#06B6D4');
  const [ledMode, setLedMode] = useState('Breath');
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // Estado local para gerenciar Presets
  const [presetsList, setPresetsList] = useState<any[]>([]);
  const [activePresetName, setActivePresetName] = useState<string>('Padrão IRIS');
  const [newPresetName, setNewPresetName] = useState<string>('');

  // Carregar presets ao montar o componente
  useEffect(() => {
    const saved = localStorage.getItem('circe_visual_presets');
    let loadedPresets = [...FACTORY_PRESETS];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        loadedPresets = [...loadedPresets, ...parsed];
      } catch (e) {
        console.error(e);
      }
    }
    setPresetsList(loadedPresets);
  }, []);

  const applyPreset = (preset: any) => {
    setActivePresetName(preset.name);
    setFXConfig({
      rotationSpeed: preset.rotationSpeed,
      repulsionStrength: preset.repulsionStrength,
      glowIntensityBars: preset.glowIntensityBars,
      glowIntensityLines: preset.glowIntensityLines,
      barPulseSpeed: preset.barPulseSpeed || 1.0,
      barGlowPulseSpeed: preset.barGlowPulseSpeed || 1.0,
      starSpeed: preset.starSpeed,
      saturation: preset.saturation,
      ringSpeed: preset.ringSpeed,
      pulseSpeed: preset.pulseSpeed,
      physicsMode: preset.physicsMode,
      customThemeActive: preset.customThemeActive,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      tertiaryColor: preset.tertiaryColor,
      ringColorCustom: preset.ringColorCustom,
    });
  };

  const saveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    
    const storeState = useIrisStore.getState();
    const newPreset = {
      name: newPresetName.trim(),
      isFactory: false,
      rotationSpeed: storeState.rotationSpeed,
      repulsionStrength: storeState.repulsionStrength,
      glowIntensityBars: storeState.glowIntensityBars,
      glowIntensityLines: storeState.glowIntensityLines,
      barPulseSpeed: storeState.barPulseSpeed,
      barGlowPulseSpeed: storeState.barGlowPulseSpeed,
      starSpeed: storeState.starSpeed,
      saturation: storeState.saturation,
      ringSpeed: storeState.ringSpeed,
      pulseSpeed: storeState.pulseSpeed,
      physicsMode: storeState.physicsMode,
      customThemeActive: storeState.customThemeActive,
      primaryColor: storeState.primaryColor,
      secondaryColor: storeState.secondaryColor,
      tertiaryColor: storeState.tertiaryColor,
      ringColorCustom: storeState.ringColorCustom,
    };

    const filtered = presetsList.filter(p => p.name.toLowerCase() !== newPreset.name.toLowerCase() || p.isFactory);
    const updatedPresets = [...filtered, newPreset];
    
    setPresetsList(updatedPresets);
    setActivePresetName(newPreset.name);
    setNewPresetName('');

    const customOnly = updatedPresets.filter(p => !p.isFactory);
    localStorage.setItem('circe_visual_presets', JSON.stringify(customOnly));
  };


  const deleteCustomPreset = (e: React.MouseEvent, presetName: string) => {
    e.stopPropagation();
    const updated = presetsList.filter(p => p.name !== presetName);
    setPresetsList(updated);
    
    const customOnly = updated.filter(p => !p.isFactory);
    localStorage.setItem('circe_visual_presets', JSON.stringify(customOnly));

    if (activePresetName === presetName) {
      applyPreset(FACTORY_PRESETS[0]);
    }
  };

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
          onClick={(e) => { e.stopPropagation(); setActivePanel(activePanel === 'top-left' ? null : 'top-left'); }}
          onMouseEnter={() => setHoveredQuadrant('top-left')}
          onMouseLeave={() => setHoveredQuadrant(null)}
          className="pointer-events-auto cursor-pointer"
        />
        {/* Quadrante Superior Direito - Ventilação */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActivePanel(activePanel === 'top-right' ? null : 'top-right'); }}
          onMouseEnter={() => setHoveredQuadrant('top-right')}
          onMouseLeave={() => setHoveredQuadrant(null)}
          className="pointer-events-auto cursor-pointer"
        />
        {/* Quadrante Inferior Esquerdo - Aletas */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActivePanel(activePanel === 'bottom-left' ? null : 'bottom-left'); }}
          onMouseEnter={() => setHoveredQuadrant('bottom-left')}
          onMouseLeave={() => setHoveredQuadrant(null)}
          className="pointer-events-auto cursor-pointer"
        />
        {/* Quadrante Inferior Direito - Iluminação */}
        <div 
          onClick={(e) => { e.stopPropagation(); setActivePanel(activePanel === 'bottom-right' ? null : 'bottom-right'); }}
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
              setActivePanel(null);
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
      {activePanel && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-dashed border-white/10 animate-spin-slow pointer-events-none z-20" />
      )}

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

        {/* Console de Teste Rápido de Estados da IRIS (Colapsável) */}
        <div className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-white/5 text-xs font-mono">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="text-[9px] tracking-widest text-slate-400 hover:text-cyan-400 transition-colors uppercase font-bold flex items-center gap-1.5"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${showDebug ? 'bg-cyan-400' : 'bg-slate-500'}`} />
            {showDebug ? 'HIDE_SYS_DEBUG' : 'SHOW_SYS_DEBUG'}
          </button>
          
          <AnimatePresence>
            {showDebug && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden flex items-center gap-2 mt-1.5 pt-1.5 border-t border-white/5"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Overlay de Cantoneiras Guia (HUD Dinâmico e Responsivo) */}
      <div className="absolute inset-[8%] pointer-events-none z-30">
        {/* Canto Superior Esquerdo - Telemetria */}
        <div className="absolute top-0 left-0 flex flex-col gap-2">
          <div className={`w-5 h-5 border-t-2 border-l-2 transition-all duration-300 ${
            hoveredQuadrant === 'top-left' || activePanel === 'top-left'
              ? 'border-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] scale-105' 
              : 'border-cyan-500/20'
          }`} />
          <span className={`font-mono text-[9px] tracking-widest transition-all duration-300 ${
            hoveredQuadrant === 'top-left' || activePanel === 'top-left'
              ? 'text-cyan-400 opacity-100 translate-y-0' 
              : 'text-cyan-500/40 opacity-0 -translate-y-1'
          }`}>
            [ LAUNCH_TELEMETRIA ]
          </span>
        </div>

        {/* Canto Superior Direito - Ventilação */}
        <div className="absolute top-0 right-0 flex flex-col items-end gap-2">
          <div className={`w-5 h-5 border-t-2 border-r-2 transition-all duration-300 ${
            hoveredQuadrant === 'top-right' || activePanel === 'top-right'
              ? 'border-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] scale-105' 
              : 'border-purple-500/20'
          }`} />
          <span className={`font-mono text-[9px] tracking-widest transition-all duration-300 ${
            hoveredQuadrant === 'top-right' || activePanel === 'top-right'
              ? 'text-purple-400 opacity-100 translate-y-0' 
              : 'text-purple-500/40 opacity-0 -translate-y-1'
          }`}>
            [ ACCESS_VENTILATION ]
          </span>
        </div>

        {/* Canto Inferior Esquerdo - Aletas */}
        <div className="absolute bottom-0 left-0 flex flex-col gap-2 justify-end">
          <span className={`font-mono text-[9px] tracking-widest transition-all duration-300 order-1 ${
            hoveredQuadrant === 'bottom-left' || activePanel === 'bottom-left'
              ? 'text-orange-400 opacity-100 translate-y-0' 
              : 'text-orange-500/40 opacity-0 translate-y-1'
          }`}>
            [ ADJUST_APERTURE ]
          </span>
          <div className={`w-5 h-5 border-b-2 border-l-2 transition-all duration-300 order-2 ${
            hoveredQuadrant === 'bottom-left' || activePanel === 'bottom-left'
              ? 'border-orange-400 drop-shadow-[0_0_6px_rgba(234,88,12,0.8)] scale-105' 
              : 'border-orange-500/20'
          }`} />
        </div>

        {/* Canto Inferior Direito - Iluminação */}
        <div className="absolute bottom-0 right-0 flex flex-col items-end gap-2 justify-end">
          <span className={`font-mono text-[9px] tracking-widest transition-all duration-300 order-1 ${
            hoveredQuadrant === 'bottom-right' || activePanel === 'bottom-right'
              ? 'text-red-400 opacity-100 translate-y-0' 
              : 'text-red-500/40 opacity-0 translate-y-1'
          }`}>
            [ LIGHTING_CONTROLS ]
          </span>
          <div className={`w-5 h-5 border-b-2 border-r-2 transition-all duration-300 order-2 ${
            hoveredQuadrant === 'bottom-right' || activePanel === 'bottom-right'
              ? 'border-red-500 drop-shadow-[0_0_6px_rgba(220,38,38,0.8)] scale-105' 
              : 'border-red-500/20'
          }`} />
        </div>
      </div>

      {/* Backdrop de desfocagem (glassmorphism) e clique fora para fechar painéis */}
      {(activePanel !== null || showFXSettings) && (
        <div 
          onClick={() => {
            setActivePanel(null);
            setShowFXSettings(false);
          }}
          className={`fixed inset-0 z-30 pointer-events-auto transition-all ${
            activePanel !== null 
              ? 'bg-black/25 backdrop-blur-[1.5px]' 
              : 'bg-transparent'
          }`}
        />
      )}

      {/* 5. Painéis de Controle Ativados no Clique via Satélites 3D (Animados via AnimatePresence) */}
      <div className="absolute inset-10 pointer-events-none z-40">
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
              className="absolute top-[12%] left-[8%] w-80 diesel-panel p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-2xl border-2 border-zinc-700 backdrop-blur-md bg-opacity-90 select-none"
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
                  <span className="text-xl font-mono font-bold text-crt-cyan">62.8%</span>
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
          {activePanel === 'top-right' && (
            <motion.div
              custom="top-right"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-[12%] right-[8%] w-80 diesel-panel p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-2xl border-2 border-zinc-700 backdrop-blur-md bg-opacity-90 select-none"
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
                <Cpu className="w-3.5 h-3.5 text-crt-purple animate-pulse" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-xs items-center">
                  <span className="text-slate-400">Velocidade dos Fans</span>
                  <span className="text-crt-purple font-mono font-bold text-sm bg-black/40 px-1.5 py-0.5 rounded border border-zinc-800">{fanSpeed}%</span>
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
                  className="w-full cursor-pointer accent-slider-purple" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button 
                  onClick={() => { setFanSpeed(100); sendControl('alx/case/fans/set', '100'); }}
                  className="bg-purple-950/20 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 font-mono text-xs py-2 rounded-xl transition shadow active:translate-y-0.5"
                >
                  Modo Turbo
                </button>
                <button 
                  onClick={() => { setFanSpeed(20); sendControl('alx/case/fans/set', '20'); }}
                  className="bg-black/55 hover:bg-black/75 border border-zinc-800 text-slate-400 font-mono text-xs py-2 rounded-xl transition shadow active:translate-y-0.5"
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
              className="absolute bottom-[12%] left-[8%] w-80 diesel-panel p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-2xl border-2 border-zinc-700 backdrop-blur-md bg-opacity-90 select-none"
              drag
              dragControls={dragServos}
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
                onPointerDown={(e) => dragServos.start(e)}
                className="crt-screen w-full py-2 px-3.5 rounded-lg flex items-center justify-between border border-zinc-950 cursor-grab active:cursor-grabbing select-none"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-crt-orange" />
                  <h2 className="font-bold tracking-wider uppercase font-mono text-xs text-crt-orange">ALETAS ALX</h2>
                </div>
                <Cpu className="w-3.5 h-3.5 text-crt-orange animate-pulse" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between font-mono text-xs items-center">
                  <span className="text-slate-400">Abertura do Servo</span>
                  <span className="text-crt-orange font-mono font-bold text-sm bg-black/40 px-1.5 py-0.5 rounded border border-zinc-800">{roofAngle}°</span>
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
                  className="w-full cursor-pointer accent-slider-orange" 
                />
                
                <div className="flex justify-between gap-2 mt-1">
                  <button 
                    onClick={() => { setRoofAngle(180); sendControl('alx/case/servos/angle', '180'); }}
                    className="flex-1 bg-orange-950/20 hover:bg-orange-900/40 border border-orange-500/30 text-orange-300 font-mono text-[10px] py-1.5 rounded-lg transition active:translate-y-0.5 shadow"
                  >
                    100% Aberto
                  </button>
                  <button 
                    onClick={() => { setRoofAngle(0); sendControl('alx/case/servos/angle', '0'); }}
                    className="flex-1 bg-black/55 hover:bg-black/75 border border-zinc-800 text-slate-400 font-mono text-[10px] py-1.5 rounded-lg transition active:translate-y-0.5 shadow"
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
              className="absolute bottom-[12%] right-[8%] w-80 diesel-panel p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-2xl border-2 border-zinc-700 backdrop-blur-md bg-opacity-90 select-none"
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
            className="absolute top-24 right-8 w-80 diesel-panel p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-2xl border-2 border-zinc-700 z-40 backdrop-blur-md bg-opacity-90 select-none"
            drag
            dragControls={dragFX}
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
              onPointerDown={(e) => dragFX.start(e)}
              className="crt-screen w-full py-2 px-3.5 rounded-lg flex items-center justify-between border border-zinc-950 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-crt-green animate-spin-slow" />
                <h2 className="font-bold tracking-wider uppercase font-mono text-xs text-crt-green">INTERFACE CORE FX</h2>
              </div>
              <span className="text-[8px] font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded text-crt-green border border-emerald-500/30 animate-pulse font-bold">ACTIVE</span>
            </div>

            {/* Seção Presets */}
            <div className="flex flex-col gap-2 border-b border-zinc-800 pb-3">
              <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">Presets Visuais</span>
              
              {/* Seletor de Presets com visual de papel fixado */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono max-h-36 overflow-y-auto pr-0.5">
                {presetsList.map((preset) => {
                  const isActive = activePresetName === preset.name;
                  return (
                    <div
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`border rounded text-slate-850 font-bold px-2 py-1.5 flex justify-between items-center cursor-pointer shadow-md transition-all active:translate-y-0.5 ${
                        isActive
                          ? 'bg-[#ded6c3] border-[#a0947a] text-zinc-900'
                          : 'bg-[#b8b09d]/75 border-[#9a907a] text-zinc-700/80 hover:text-zinc-900 hover:bg-[#ded6c3]/90'
                      }`}
                    >
                      <span className="truncate max-w-[85px] uppercase font-mono">{preset.name}</span>
                      <div className="flex items-center gap-1">
                        {/* Lâmpada indicadora de preset ativo */}
                        <div 
                          className={`w-2.5 h-2.5 rounded-full border border-zinc-950/60 shadow ${
                            isActive 
                              ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.85)]' 
                              : 'bg-[#555045]/60'
                          }`} 
                        />
                        {!preset.isFactory && (
                          <span 
                            onClick={(e) => deleteCustomPreset(e, preset.name)}
                            className="text-[10px] text-red-700 hover:text-red-900 px-0.5 pl-1 cursor-pointer font-bold transition-colors font-mono"
                          >
                            ×
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Salvar Novo Preset com push button mecânico */}
              <div className="flex gap-2 mt-1 bg-black/20 p-1.5 rounded-xl border border-zinc-800 shadow-inner">
                <input 
                  type="text" 
                  placeholder="Novo preset..."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="flex-1 bg-black/55 border border-zinc-800 rounded px-2.5 py-1 text-[10px] font-mono text-white focus:outline-none focus:border-zinc-700/50 shadow-inner"
                />
                <button
                  onClick={saveCustomPreset}
                  className="px-3.5 py-1 bg-red-800 hover:bg-red-700 border border-zinc-950 text-white shadow-md active:translate-y-0.5 rounded text-[10px] font-mono font-bold uppercase transition"
                >
                  Salvar
                </button>
              </div>
            </div>

            {/* Seção Cores Personalizadas com Lâmpadas Indicadoras 3D */}
            <div className="flex flex-col gap-2 border-b border-zinc-800 pb-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">Cores Customizadas</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={customThemeActive} 
                    onChange={(e) => setFXConfig({ customThemeActive: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-zinc-800 border-2 border-zinc-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#ded6c3] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#ded6c3] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {customThemeActive && (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Cor 1', value: primaryColor, setter: (c: string) => setFXConfig({ primaryColor: c }) },
                      { label: 'Cor 2', value: secondaryColor, setter: (c: string) => setFXConfig({ secondaryColor: c }) },
                      { label: 'Cor 3', value: tertiaryColor, setter: (c: string) => setFXConfig({ tertiaryColor: c }) },
                      { label: 'Cor 4', value: quaternaryColor, setter: (c: string) => setFXConfig({ quaternaryColor: c }) },
                      { label: 'Cor 5', value: quinaryColor, setter: (c: string) => setFXConfig({ quinaryColor: c }) },
                      { label: 'Cor 6', value: senaryColor, setter: (c: string) => setFXConfig({ senaryColor: c }) },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-black/40 p-2 rounded-xl border border-zinc-800 flex flex-col items-center gap-1 shadow-inner">
                        <span className="text-[8px] font-mono text-slate-500 uppercase font-bold">{item.label}</span>
                        <div 
                          className="glowing-lamp shadow-md"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${item.value} 0%, #151515 80%, #000 100%)`,
                            boxShadow: `0 0 8px ${item.value}, inset 0 -2.5px 5px rgba(0,0,0,0.85), inset 0 2.5px 5px rgba(255,255,255,0.3)`
                          }}
                        >
                          <input 
                            type="color" 
                            value={item.value} 
                            onChange={(e) => item.setter(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
                        <span className="text-[8px] font-mono uppercase text-slate-400 font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Cor do Anel */}
                  <div className="bg-black/40 p-2 rounded-xl border border-zinc-800 flex items-center justify-between shadow-inner mt-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold pl-1">Cor do Anel</span>
                    <div className="flex items-center gap-2 pr-1">
                      <div 
                        className="glowing-lamp shadow-md"
                        style={{
                          background: `radial-gradient(circle at 35% 35%, ${ringColorCustom} 0%, #151515 80%, #000 100%)`,
                          boxShadow: `0 0 8px ${ringColorCustom}, inset 0 -2.5px 5px rgba(0,0,0,0.85), inset 0 2.5px 5px rgba(255,255,255,0.3)`
                        }}
                      >
                        <input 
                          type="color" 
                          value={ringColorCustom} 
                          onChange={(e) => setFXConfig({ ringColorCustom: e.target.value })}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                      <span className="text-[9px] font-mono uppercase text-white font-bold">{ringColorCustom}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Perfil de Física */}
            <div className="flex flex-col gap-1.5 border-b border-zinc-800 pb-3">
              <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">Física do Orbe</span>
              <div className="grid grid-cols-3 gap-1.5 mt-0.5">
                {(['gel', 'mechanical', 'liquid'] as const).map((mode) => {
                  const isActive = physicsMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setFXConfig({ physicsMode: mode })}
                      className={`py-2 rounded-lg border text-[9px] font-mono uppercase font-bold transition duration-150 active:translate-y-0.5 shadow-md ${
                        isActive 
                          ? 'bg-zinc-800 border-orange-500/80 text-orange-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_0_8px_rgba(249,115,22,0.3)]' 
                          : 'bg-black/55 border-zinc-850 text-slate-450 hover:text-slate-200'
                      }`}
                    >
                      {mode === 'gel' ? 'Gel' : mode === 'mechanical' ? 'Rígida' : 'Líquida'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alternador de Snap com Papel de Projeto */}
            <div className="blueprint-paper p-3 rounded-xl flex items-center justify-between border-2 border-zinc-700 shadow-md">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs font-bold text-zinc-900">Snap ao Soltar</span>
                <span className="text-[8px] font-mono text-zinc-700 leading-tight font-semibold">Retorna o orbe ao centro se ativo</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={snapToCenter} 
                  onChange={(e) => setFXConfig({ snapToCenter: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-[#3a3222]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#ded6c3] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#3a3222] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3a3222]"></div>
              </label>
            </div>

            {/* Sliders de Controle FX */}
            <div className="flex flex-col gap-3 font-mono text-xs max-h-64 overflow-y-auto pr-1">
              
              {/* Rotação */}
              <div className="flex flex-col gap-1.5 bg-black/15 p-2 rounded-lg border border-zinc-800/40">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Rotação do Orbe</span>
                  <span className="led-readout text-[11px] font-mono px-2 py-0.5 rounded">{rotationSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.1" max="3.0" step="0.1"
                  value={rotationSpeed} 
                  onChange={(e) => setFXConfig({ rotationSpeed: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-slider-cyan" 
                />
              </div>

              {/* Repulsão */}
              <div className="flex flex-col gap-1.5 bg-black/15 p-2 rounded-lg border border-zinc-800/40">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Repulsão do Mouse</span>
                  <span className="led-readout text-[11px] font-mono px-2 py-0.5 rounded">{repulsionStrength.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.0" max="2.5" step="0.1"
                  value={repulsionStrength} 
                  onChange={(e) => setFXConfig({ repulsionStrength: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-slider-cyan" 
                />
              </div>

              {/* Glow das Barras */}
              <div className="flex flex-col gap-1.5 bg-black/15 p-2 rounded-lg border border-zinc-800/40">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Glow das Barras</span>
                  <span className="led-readout text-[11px] font-mono px-2 py-0.5 rounded">{glowIntensityBars.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.2" max="2.5" step="0.1"
                  value={glowIntensityBars} 
                  onChange={(e) => setFXConfig({ glowIntensityBars: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-slider-cyan" 
                />
              </div>

              {/* Pulsação do Glow das Barras */}
              <div className="flex flex-col gap-1.5 bg-black/15 p-2 rounded-lg border border-zinc-800/40">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pulsação Glow Barras</span>
                  <span className="led-readout text-[11px] font-mono px-2 py-0.5 rounded">{barGlowPulseSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.0" max="3.0" step="0.1"
                  value={barGlowPulseSpeed} 
                  onChange={(e) => setFXConfig({ barGlowPulseSpeed: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-slider-cyan" 
                />
              </div>

              {/* Pulsação das Barras */}
              <div className="flex flex-col gap-1.5 bg-black/15 p-2 rounded-lg border border-zinc-800/40">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pulsação Barras</span>
                  <span className="led-readout text-[11px] font-mono px-2 py-0.5 rounded">{barPulseSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.0" max="3.0" step="0.1"
                  value={barPulseSpeed} 
                  onChange={(e) => setFXConfig({ barPulseSpeed: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-slider-cyan" 
                />
              </div>

              {/* Glow das Linhas */}
              <div className="flex flex-col gap-1.5 bg-black/15 p-2 rounded-lg border border-zinc-800/40">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Glow das Linhas</span>
                  <span className="led-readout text-[11px] font-mono px-2 py-0.5 rounded">{glowIntensityLines.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.2" max="2.5" step="0.1"
                  value={glowIntensityLines} 
                  onChange={(e) => setFXConfig({ glowIntensityLines: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-slider-cyan" 
                />
              </div>

              {/* Velocidade de Pulsação das Linhas */}
              <div className="flex flex-col gap-1.5 bg-black/15 p-2 rounded-lg border border-zinc-800/40">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pulsação Linhas</span>
                  <span className="led-readout text-[11px] font-mono px-2 py-0.5 rounded">{pulseSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.0" max="4.0" step="0.1"
                  value={pulseSpeed} 
                  onChange={(e) => setFXConfig({ pulseSpeed: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-slider-cyan" 
                />
              </div>

              {/* Estrelas */}
              <div className="flex flex-col gap-1.5 bg-black/15 p-2 rounded-lg border border-zinc-800/40">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Vórtice das Estrelas</span>
                  <span className="led-readout text-[11px] font-mono px-2 py-0.5 rounded">{starSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.0" max="3.0" step="0.1"
                  value={starSpeed} 
                  onChange={(e) => setFXConfig({ starSpeed: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-slider-cyan" 
                />
              </div>

              {/* Saturação */}
              <div className="flex flex-col gap-1.5 bg-black/15 p-2 rounded-lg border border-zinc-800/40">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Saturação Cores</span>
                  <span className="led-readout text-[11px] font-mono px-2 py-0.5 rounded">{(saturation * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" min="0.0" max="2.0" step="0.1"
                  value={saturation} 
                  onChange={(e) => setFXConfig({ saturation: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-slider-cyan" 
                />
              </div>

              {/* Velocidade do Anel */}
              <div className="flex flex-col gap-1.5 bg-black/15 p-2 rounded-lg border border-zinc-800/40">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Velocidade Anel</span>
                  <span className="led-readout text-[11px] font-mono px-2 py-0.5 rounded">{ringSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.0" max="3.0" step="0.1"
                  value={ringSpeed} 
                  onChange={(e) => setFXConfig({ ringSpeed: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer accent-slider-cyan" 
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
