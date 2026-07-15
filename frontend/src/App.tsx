import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Thermometer, 
  Wind, 
  Settings, 
  Lightbulb, 
  Cpu, 
  Activity,
  Sliders,
  ChevronDown,
  ChevronRight
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
    primaryColor,
    secondaryColor,
    tertiaryColor,
    quaternaryColor,
    quinaryColor,
    senaryColor,
    septenaryColor,
    octonaryColor,
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
    glowBarsEnabled,
    glowLinesEnabled,
    colorZonesEnabled,
    satelliteCoords,
    satellite2Coords,
    sat1Mode,
    sat2Mode,
    sat1Force,
    sat2Force,
    sat1Speed,
    sat2Speed,
    cosmicJetsEnabled,
    jetIntensity,
    setFXConfig
  } = useIrisStore();
  const [showFXSettings, setShowFXSettings] = useState(false);
  const R1_dyn = Math.max(500, (window.innerWidth / 2) - 40);
  const R2_dyn = R1_dyn * 0.8;
  const [showDebug, setShowDebug] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    presets: true,
    colors: false, // Inicia expandida para fácil customização
    glow: true,
    physics: true,
    sliders: true
  });
  const toggleSection = (sec: string) => {
    setCollapsedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };
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
  const dragFX = useDragControls();

  // Refs para controle do arrasto 3D no centro
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const dragBaseRef = useRef({ x: 0, y: 0 });
  
  // Controles locais (estado do dashboard)
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

  // Simulação Local Inteligente (Física Térmica, Histórico, RPMs e Aletas)
  useEffect(() => {
    if (isWebSocketConnected) return;

    const interval = setInterval(() => {
      const store = useIrisStore.getState();
      
      // 1. Simulação Térmica
      const coolingFactor = (store.fan1Speed / 100) * 0.45;
      const heatingFactor = 0.18;
      const noise = (Math.random() - 0.5) * 0.3;
      const tempDelta = heatingFactor - coolingFactor + noise;
      const nextTemp = parseFloat(Math.max(30, Math.min(85, store.temperature + tempDelta)).toFixed(1));
      setTemperature(nextTemp);

      // Automação de Alerta Crítico
      if (nextTemp >= 75) {
        setIrisState('critical');
      } else if (store.irisState === 'critical' && nextTemp < 70) {
        setIrisState('idle');
      }

      // 2. Histórico de Temperatura (24 pontos)
      const currentHistory = [...store.tempHistory];
      currentHistory.push(nextTemp);
      if (currentHistory.length > 24) currentHistory.shift();
      setTempHistory(currentHistory);

      // 3. Simulação de Umidade
      const humidityNoise = (Math.random() - 0.5) * 0.5;
      const nextHumidity = parseFloat(Math.max(20, Math.min(90, 75.0 - (nextTemp - 30.0) * 0.6 + humidityNoise)).toFixed(1));
      setHumidity(nextHumidity);

      // 4. Simulação de RPMs dos Ventiladores (com flutuação realista de ±15 RPM)
      const rpm1Fluctuation = Math.floor((Math.random() - 0.5) * 30);
      const rpm2Fluctuation = Math.floor((Math.random() - 0.5) * 30);
      setFan1Rpm(store.fan1Speed > 0 ? Math.floor(store.fan1Speed * 20 + rpm1Fluctuation) : 0);
      setFan2Rpm(store.fan2Speed > 0 ? Math.floor(store.fan2Speed * 19.5 + rpm2Fluctuation) : 0);
    }, 2000);

    return () => clearInterval(interval);
  }, [
    isWebSocketConnected,
    setTemperature,
    setIrisState,
    setTempHistory,
    setHumidity,
    setFan1Rpm,
    setFan2Rpm
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
      {activePanel.length > 0 && (
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
          <div className="w-[1px] h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${pcState === 'on' ? 'bg-emerald-450 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="font-semibold text-white">HOST: {pcState}</span>
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
                <div className="w-[1px] h-3 bg-white/10 mx-0.5" />
                <button 
                  onClick={() => setPcState(pcState === 'on' ? 'off' : 'on')}
                  className={`px-2 py-0.5 rounded transition ${pcState === 'on' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-slate-400 border border-transparent hover:text-white'}`}
                >
                  PC: {pcState.toUpperCase()}
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
      {(activePanel.length > 0 || showFXSettings) && (
        <div 
          onClick={() => {
            setActivePanel(null);
            setShowFXSettings(false);
          }}
          className={`fixed inset-0 z-30 pointer-events-auto transition-all ${
            activePanel.length > 0 
              ? 'bg-black/25 backdrop-blur-[1.5px]' 
              : 'bg-transparent'
          }`}
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
              className="absolute bottom-[12%] left-[8%] w-80 diesel-panel glow-panel-orange p-5 rounded-2xl pointer-events-auto flex flex-col gap-4 shadow-2xl border-2 border-zinc-700 backdrop-blur-md bg-opacity-90 select-none"
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
                {/* Status Físico de Diagnóstico */}
                <div className="flex justify-between items-center bg-black/25 p-2.5 rounded-xl border border-zinc-850 shadow-inner">
                  <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">Estado Físico</span>
                  <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    finsState === 'open' ? 'bg-emerald-950/20 border-emerald-500/30 text-crt-green' :
                    finsState === 'closed' ? 'bg-zinc-950/40 border-zinc-700/30 text-slate-400' :
                    finsState === 'moving' ? 'bg-amber-950/20 border-amber-500/30 text-crt-orange animate-pulse' :
                    'bg-red-950/20 border-red-500/30 text-crt-red animate-pulse'
                  }`}>
                    {finsState}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
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
                      setFinsState('moving');
                      setRoofAngle(val);
                      sendControl('alx/case/servos/angle', val.toString());
                      
                      if (!isWebSocketConnected) {
                        if ((window as any).finsTimeout) clearTimeout((window as any).finsTimeout);
                        (window as any).finsTimeout = setTimeout(() => {
                          setFinsState(val > 10 ? 'open' : 'closed');
                        }, 700);
                      }
                    }}
                    className="w-full cursor-pointer accent-slider-orange" 
                  />
                </div>

                {/* Visualizador Esquemático de Aletas */}
                <div className="crt-screen p-2 rounded-xl border border-zinc-950 flex flex-col items-center justify-center gap-1 h-14 relative overflow-hidden">
                  <div className="absolute top-0.5 left-2 text-[7px] font-mono text-crt-orange/60 uppercase">MECHANICAL_FINS_PROFILE</div>
                  <div className="flex gap-6 items-center justify-center mt-2.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="w-8 h-1 bg-crt-orange rounded-full transition-transform duration-300 shadow-[0_0_6px_rgba(249,115,22,0.85)]"
                        style={{
                          transform: `rotate(${-(roofAngle * 0.5)}deg)`,
                          transformOrigin: 'center'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between gap-2 mt-1">
                  <button 
                    onClick={() => { 
                      setFinsState('moving');
                      setRoofAngle(180); 
                      sendControl('alx/case/servos/angle', '180');
                      if (!isWebSocketConnected) {
                        if ((window as any).finsTimeout) clearTimeout((window as any).finsTimeout);
                        (window as any).finsTimeout = setTimeout(() => {
                          setFinsState('open');
                        }, 700);
                      }
                    }}
                    className="flex-1 bg-orange-950/20 hover:bg-orange-900/40 border border-orange-500/30 text-orange-300 font-mono text-[10px] py-1.5 rounded-lg transition active:translate-y-0.5 shadow"
                  >
                    100% Aberto
                  </button>
                  <button 
                    onClick={() => { 
                      setFinsState('moving');
                      setRoofAngle(0); 
                      sendControl('alx/case/servos/angle', '0'); 
                      if (!isWebSocketConnected) {
                        if ((window as any).finsTimeout) clearTimeout((window as any).finsTimeout);
                        (window as any).finsTimeout = setTimeout(() => {
                          setFinsState('closed');
                        }, 700);
                      }
                    }}
                    className="flex-1 bg-black/55 hover:bg-black/75 border border-zinc-800 text-slate-400 font-mono text-[10px] py-1.5 rounded-lg transition active:translate-y-0.5 shadow"
                  >
                    Fechado
                  </button>
                </div>
              </div>
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

            {/* Área Rolável contendo todas as Seções do Painel para evitar transbordamento vertical */}
            <div className="flex flex-col gap-3.5 max-h-[60vh] overflow-y-auto pr-1 bg-black/10 rounded-lg p-1 border border-zinc-850 shadow-inner">
              
              {/* Seção Presets */}
              <div className="flex flex-col gap-2 border-b border-zinc-800/50 pb-2">
                <div 
                  onClick={() => toggleSection('presets')}
                  className="flex justify-between items-center cursor-pointer hover:text-cyan-400 transition-colors py-1 pl-1"
                >
                  <span className="font-mono text-[10px] text-slate-350 font-bold uppercase flex items-center gap-1.5 select-none">
                    {collapsedSections.presets ? <ChevronRight className="w-3.5 h-3.5 text-cyan-500" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-500" />}
                    Presets Visuais
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 font-bold uppercase truncate max-w-[120px] bg-black/30 px-1 py-0.5 rounded">
                    {activePresetName || 'NENHUM'}
                  </span>
                </div>
                
                {!collapsedSections.presets && (
                  <div className="flex flex-col gap-2 mt-1">
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
                )}
              </div>

              {/* Seção Cores Personalizadas com Lâmpadas Indicadoras 3D */}
              <div className="flex flex-col gap-2 border-b border-zinc-800/50 pb-2">
                <div 
                  onClick={() => toggleSection('colors')}
                  className="flex justify-between items-center cursor-pointer hover:text-cyan-400 transition-colors py-1 pl-1"
                >
                  <span className="font-mono text-[10px] text-slate-350 font-bold uppercase flex items-center gap-1.5 select-none">
                    {collapsedSections.colors ? <ChevronRight className="w-3.5 h-3.5 text-cyan-500" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-500" />}
                    Personalização Cores
                  </span>
                  <span className={`font-mono text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                    customThemeActive 
                      ? 'bg-orange-500/15 border-orange-500/30 text-orange-400 animate-pulse' 
                      : 'bg-zinc-800/40 border-zinc-700/30 text-slate-500'
                  }`}>
                    {customThemeActive ? 'ON' : 'OFF'}
                  </span>
                </div>
   
                {!collapsedSections.colors && (
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex justify-between items-center bg-black/25 p-2 rounded-xl border border-zinc-850 shadow-inner">
                      <span className="font-mono text-[9px] text-slate-400 uppercase font-bold pl-1">Ativar Paleta Personalizada</span>
                      <label className="relative inline-flex items-center cursor-pointer pr-1">
                        <input 
                          type="checkbox" 
                          checked={customThemeActive} 
                          onChange={(e) => setFXConfig({ customThemeActive: e.target.checked })}
                          className="sr-only peer" 
                        />
                        <div className="relative w-9 h-5 bg-zinc-800 border-2 border-zinc-950 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-[#ded6c3] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>

                    {customThemeActive && (
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { label: 'C1', value: primaryColor, setter: (c: string) => setFXConfig({ primaryColor: c }), idx: 0 },
                            { label: 'C2', value: secondaryColor, setter: (c: string) => setFXConfig({ secondaryColor: c }), idx: 1 },
                            { label: 'C3', value: tertiaryColor, setter: (c: string) => setFXConfig({ tertiaryColor: c }), idx: 2 },
                            { label: 'C4', value: quaternaryColor, setter: (c: string) => setFXConfig({ quaternaryColor: c }), idx: 3 },
                            { label: 'C5', value: quinaryColor, setter: (c: string) => setFXConfig({ quinaryColor: c }), idx: 4 },
                            { label: 'C6', value: senaryColor, setter: (c: string) => setFXConfig({ senaryColor: c }), idx: 5 },
                            { label: 'C7', value: septenaryColor, setter: (c: string) => setFXConfig({ septenaryColor: c }), idx: 6 },
                            { label: 'C8', value: octonaryColor, setter: (c: string) => setFXConfig({ octonaryColor: c }), idx: 7 },
                          ].map((item) => {
                            const isActive = colorZonesEnabled ? colorZonesEnabled[item.idx] : true;
                            const toggleZone = () => {
                              const newEnabled = [...(colorZonesEnabled || [true, true, true, true, true, true, true, true])];
                              newEnabled[item.idx] = !newEnabled[item.idx];
                              setFXConfig({ colorZonesEnabled: newEnabled });
                            };

                            return (
                              <div key={item.idx} className="bg-black/40 p-1.5 rounded-xl border border-zinc-800 flex flex-col items-center gap-1 shadow-inner">
                                <span className="text-[8px] font-mono text-slate-500 uppercase font-bold">{item.label}</span>
                                
                                {/* Lâmpada indicadora clicável para Ligar/Desligar a zona */}
                                <div 
                                  onClick={toggleZone}
                                  className={`glowing-lamp shadow-md cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${isActive ? 'opacity-100' : 'opacity-20'}`}
                                  style={{
                                    background: isActive 
                                      ? `radial-gradient(circle at 35% 35%, ${item.value} 0%, #151515 80%, #000 100%)`
                                      : `radial-gradient(circle at 35% 35%, #444 0%, #151515 80%, #000 100%)`,
                                    boxShadow: isActive 
                                      ? `0 0 8px ${item.value}, inset 0 -2.5px 5px rgba(0,0,0,0.85), inset 0 2.5px 5px rgba(255,255,255,0.3)`
                                      : `none`
                                  }}
                                />

                                {/* Seletor de cores ativado ao clicar no código HEX */}
                                <div className="relative flex items-center justify-center w-full min-h-[12px]">
                                  {isActive ? (
                                    <>
                                      <span className="text-[8px] font-mono uppercase text-slate-400 font-bold hover:text-white transition-colors cursor-pointer select-none">
                                        {item.value}
                                      </span>
                                      <input 
                                        type="color" 
                                        value={item.value} 
                                        onChange={(e) => item.setter(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                      />
                                    </>
                                  ) : (
                                    <span className="text-[8px] font-mono uppercase text-zinc-650 font-bold line-through select-none">
                                      MUTED
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
                )}
              </div>

              {/* Glow & Iluminação Toggles */}
              <div className="flex flex-col gap-2 border-b border-zinc-800/50 pb-2">
                <div 
                  onClick={() => toggleSection('glow')}
                  className="flex justify-between items-center cursor-pointer hover:text-cyan-400 transition-colors py-1 pl-1"
                >
                  <span className="font-mono text-[10px] text-slate-350 font-bold uppercase flex items-center gap-1.5 select-none">
                    {collapsedSections.glow ? <ChevronRight className="w-3.5 h-3.5 text-cyan-500" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-500" />}
                    Habilitar Glow
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">
                    {glowBarsEnabled || glowLinesEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>

                {!collapsedSections.glow && (
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {/* Glow das Barras */}
                    <div className="bg-black/40 p-2 rounded-xl border border-zinc-850 flex items-center justify-between shadow-inner">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[9px] font-bold text-slate-300">Glow Barras</span>
                        <span className="text-[7px] font-mono text-slate-500 uppercase">{glowBarsEnabled ? 'ON' : 'OFF'}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={glowBarsEnabled} 
                          onChange={(e) => setFXConfig({ glowBarsEnabled: e.target.checked })}
                          className="sr-only peer" 
                        />
                        <div className="relative w-8 h-4.5 bg-zinc-800 border border-zinc-950 rounded-full peer peer-checked:after:translate-x-3.5 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-[#ded6c3] after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>
                    {/* Glow das Linhas */}
                    <div className="bg-black/40 p-2 rounded-xl border border-zinc-850 flex items-center justify-between shadow-inner">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[9px] font-bold text-slate-300">Glow Linhas</span>
                        <span className="text-[7px] font-mono text-slate-500 uppercase">{glowLinesEnabled ? 'ON' : 'OFF'}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={glowLinesEnabled} 
                          onChange={(e) => setFXConfig({ glowLinesEnabled: e.target.checked })}
                          className="sr-only peer" 
                        />
                        <div className="relative w-8 h-4.5 bg-zinc-800 border border-zinc-950 rounded-full peer peer-checked:after:translate-x-3.5 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-[#ded6c3] after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
   
              {/* Perfil de Física */}
              <div className="flex flex-col gap-1.5 border-b border-zinc-800/50 pb-2">
                <div 
                  onClick={() => toggleSection('physics')}
                  className="flex justify-between items-center cursor-pointer hover:text-cyan-400 transition-colors py-1 pl-1"
                >
                  <span className="font-mono text-[10px] text-slate-350 font-bold uppercase flex items-center gap-1.5 select-none">
                    {collapsedSections.physics ? <ChevronRight className="w-3.5 h-3.5 text-cyan-500" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-500" />}
                    Física & Dinâmica
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">
                    {physicsMode.toUpperCase()}
                  </span>
                </div>

                {!collapsedSections.physics && (
                  <div className="flex flex-col gap-2 mt-1.5">
                    <div className="grid grid-cols-3 gap-1.5">
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
   
                    {/* Alternador de Snap com Papel de Projeto */}
                    <div className="blueprint-paper p-3 rounded-xl flex items-center justify-between border-2 border-zinc-700 shadow-md">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs font-bold text-zinc-900">Snap ao Soltar</span>
                        <span className="text-[8px] font-mono text-zinc-700 leading-tight font-semibold">Retorna o orbe ao centro se ativo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          snapToCenter 
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-800' 
                            : 'bg-zinc-200 border-zinc-450 text-zinc-650 font-semibold'
                        }`}>
                          {snapToCenter ? 'ATIVADO' : 'DESATIVADO'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={snapToCenter} 
                            onChange={(e) => setFXConfig({ snapToCenter: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="relative w-9 h-5 bg-[#3a3222]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-[#3a3222] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sliders de Ajuste Fino */}
              <div className="flex flex-col gap-2">
                <div 
                  onClick={() => toggleSection('sliders')}
                  className="flex justify-between items-center cursor-pointer hover:text-cyan-400 transition-colors py-1 pl-1"
                >
                  <span className="font-mono text-[10px] text-slate-350 font-bold uppercase flex items-center gap-1.5 select-none">
                    {collapsedSections.sliders ? <ChevronRight className="w-3.5 h-3.5 text-cyan-500" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-500" />}
                    Sliders de Ajuste
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">
                    SLIDERS
                  </span>
                </div>

                {!collapsedSections.sliders && (
                  <div className="flex flex-col gap-3 mt-1.5 pr-0.5">
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

                    {/* Satélite 1 (Ciano) - Modo e Força */}
                    <div className="flex flex-col gap-2 bg-cyan-950/15 p-2.5 rounded-lg border border-cyan-500/15">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] uppercase font-bold text-cyan-400">Satélite Ciano (Maior)</span>
                        <select
                          value={sat1Mode}
                          onChange={(e) => setFXConfig({ sat1Mode: e.target.value as 'manual' | 'gravitational' | 'orbital' })}
                          className="bg-[#050512]/90 border border-cyan-500/25 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase text-cyan-400 cursor-pointer focus:outline-none"
                        >
                          <option value="manual">Manual</option>
                          <option value="gravitational">Gravitacional</option>
                          <option value="orbital">Orbital 3D</option>
                        </select>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[9px] uppercase text-slate-500 text-left">Força de Impacto</span>
                        <span className="led-readout text-[10px] font-mono px-1.5 py-0.5 rounded text-cyan-400 bg-cyan-950/20">{sat1Force.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="-2.0" max="2.0" step="0.1"
                        value={sat1Force} 
                        onChange={(e) => setFXConfig({ sat1Force: parseFloat(e.target.value) })}
                        className="w-full cursor-pointer accent-slider-cyan" 
                      />
                      <div className="flex justify-between items-center text-slate-400 mt-1">
                        <span className="text-[9px] uppercase text-slate-500 text-left">Velocidade Órbita</span>
                        <span className="led-readout text-[10px] font-mono px-1.5 py-0.5 rounded text-cyan-400 bg-cyan-950/20">{sat1Speed.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.0" max="3.0" step="0.1"
                        value={sat1Speed} 
                        onChange={(e) => setFXConfig({ sat1Speed: parseFloat(e.target.value) })}
                        className="w-full cursor-pointer accent-slider-cyan" 
                      />
                      <span className="text-[7.5px] text-slate-500 font-mono -mt-1 text-center leading-none">
                        Valores negativos atraem, positivos repelem as barras
                      </span>
                    </div>

                    {/* Satélite 2 (Fúcsia) - Modo e Força */}
                    <div className="flex flex-col gap-2 bg-fuchsia-950/15 p-2.5 rounded-lg border border-fuchsia-500/15">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] uppercase font-bold text-fuchsia-400">Satélite Fúcsia (Menor)</span>
                        <select
                          value={sat2Mode}
                          onChange={(e) => setFXConfig({ sat2Mode: e.target.value as 'manual' | 'gravitational' | 'orbital' })}
                          className="bg-[#050512]/90 border border-fuchsia-500/25 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase text-fuchsia-400 cursor-pointer focus:outline-none"
                        >
                          <option value="manual">Manual</option>
                          <option value="gravitational">Gravitacional</option>
                          <option value="orbital">Orbital 3D</option>
                        </select>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[9px] uppercase text-slate-500 text-left">Força de Impacto</span>
                        <span className="led-readout text-[10px] font-mono px-1.5 py-0.5 rounded text-fuchsia-400 bg-fuchsia-950/20">{sat2Force.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="-2.0" max="2.0" step="0.1"
                        value={sat2Force} 
                        onChange={(e) => setFXConfig({ sat2Force: parseFloat(e.target.value) })}
                        className="w-full cursor-pointer accent-slider-rose" 
                      />
                      <div className="flex justify-between items-center text-slate-400 mt-1">
                        <span className="text-[9px] uppercase text-slate-500 text-left">Velocidade Órbita</span>
                        <span className="led-readout text-[10px] font-mono px-1.5 py-0.5 rounded text-fuchsia-400 bg-fuchsia-950/20">{sat2Speed.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.0" max="3.0" step="0.1"
                        value={sat2Speed} 
                        onChange={(e) => setFXConfig({ sat2Speed: parseFloat(e.target.value) })}
                        className="w-full cursor-pointer accent-slider-rose" 
                      />
                      <span className="text-[7.5px] text-slate-500 font-mono -mt-1 text-center leading-none">
                        Valores negativos atraem, positivos repelem as barras
                      </span>
                    </div>

                    {/* Jatos Cósmicos Relativísticos */}
                    <div className="flex flex-col gap-2.5 bg-yellow-950/10 p-2.5 rounded-lg border border-yellow-500/15">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-yellow-500">Jatos Cósmicos Polares</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFXConfig({ cosmicJetsEnabled: !cosmicJetsEnabled }); }}
                          className={`px-2 py-0.5 rounded text-[8px] font-mono border transition-all duration-300 uppercase ${
                            cosmicJetsEnabled
                              ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                              : 'bg-zinc-900/60 border-zinc-800 text-slate-500 hover:border-zinc-700'
                          }`}
                        >
                          {cosmicJetsEnabled ? 'Ativado' : 'Desativado'}
                        </button>
                      </div>
                      
                      {cosmicJetsEnabled && (
                        <div className="flex flex-col gap-1.5 animate-[fadeIn_0.3s_ease-out]">
                          <div className="flex justify-between items-center text-slate-400">
                            <span className="text-[9px] uppercase text-slate-500 text-left">Intensidade do Jato</span>
                            <span className="led-readout text-[10px] font-mono px-1.5 py-0.5 rounded text-yellow-400 bg-yellow-950/20">{jetIntensity.toFixed(1)}x</span>
                          </div>
                          <input 
                            type="range" min="0.1" max="2.5" step="0.1"
                            value={jetIntensity} 
                            onChange={(e) => setFXConfig({ jetIntensity: parseFloat(e.target.value) })}
                            className="w-full cursor-pointer accent-yellow-500" 
                          />
                        </div>
                      )}
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
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <div className="absolute bottom-4 right-6 pointer-events-none z-10 font-mono text-[9px] text-cyan-500/40 animate-pulse">
        <span>Passe o mouse nos quadrantes para controlar o sistema</span>
      </div>

    </div>
  );
}
