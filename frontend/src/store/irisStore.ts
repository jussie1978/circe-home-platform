import { create } from 'zustand';

export interface CustomStar {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  intensity: number;
  color: string;
  haloSize: number;
  haloIntensity: number;
}

export interface IrisStore {
  temperature: number;
  irisState: 'idle' | 'listening' | 'speaking' | 'critical';
  setTemperature: (temp: number) => void;
  setIrisState: (state: IrisStore['irisState']) => void;

  humidity: number;
  tempHistory: number[];
  fan1Speed: number;
  fan1Rpm: number;
  fan2Speed: number;
  fan2Rpm: number;
  fanMode: 'auto' | 'manual' | 'silent';
  finsState: 'open' | 'closed' | 'moving' | 'error' | 'homing';
  pcState: 'on' | 'off';
  roofAngle: number;
  setHumidity: (humidity: number) => void;
  setTempHistory: (history: number[]) => void;
  setFan1Speed: (speed: number) => void;
  setFan1Rpm: (rpm: number) => void;
  setFan2Speed: (speed: number) => void;
  setFan2Rpm: (rpm: number) => void;
  setFanMode: (mode: IrisStore['fanMode']) => void;
  setFinsState: (state: IrisStore['finsState']) => void;
  setPcState: (state: IrisStore['pcState']) => void;
  setRoofAngle: (angle: number) => void;

  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  quaternaryColor: string;
  quinaryColor: string;
  senaryColor: string;
  septenaryColor: string;
  octonaryColor: string;
  // Configurações do App
  customThemeActive: boolean;
  ringColorCustom: string;
  rotationSpeed: number;
  physicsMode: 'gel' | 'mechanical' | 'liquid';
  repulsionStrength: number;
  starSpeed: number;
  glowIntensityBars: number;
  glowIntensityLines: number;
  nanobotTremorSpeed: number;
  clearcoat: number;
  barPulseSpeed: number;
  barGlowPulseSpeed: number;
  saturation: number;
  ringSpeed: number;
  pulseSpeed: number;
  activePanel: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[];
  setActivePanel: (panel: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null) => void;
  dragOffset: { x: number; y: number };
  snapToCenter: boolean;
  glowBarsEnabled: boolean;
  glowLinesEnabled: boolean;
  colorZonesEnabled: boolean[];
  satelliteCoords: { x: number; y: number; z?: number };
  satellite2Coords: { x: number; y: number; z?: number };
  sat1Mode: 'manual' | 'gravitational' | 'orbital';
  sat2Mode: 'manual' | 'gravitational' | 'orbital';
  sat1Force: number;
  sat2Force: number;
  sat1Speed: number;
  sat2Speed: number;
  isDraggingSat1: boolean;
  isDraggingSat2: boolean;
  cosmicJetsEnabled: boolean;
  jetIntensity: number;
  faceDetected: boolean;
  faceX: number;
  faceY: number;
  voiceText: string;

  customStars: CustomStar[];
  addCustomStar: () => void;
  updateCustomStar: (id: string, updates: Partial<CustomStar>) => void;
  removeCustomStar: (id: string) => void;

  setFXConfig: (config: FXConfigPatch) => void;
}

type StoreMethods =
  | 'setTemperature' | 'setIrisState' | 'setHumidity' | 'setTempHistory'
  | 'setFan1Speed' | 'setFan1Rpm' | 'setFan2Speed' | 'setFan2Rpm'
  | 'setFanMode' | 'setFinsState' | 'setPcState' | 'setRoofAngle'
  | 'setActivePanel' | 'setFXConfig' | 'addCustomStar' | 'updateCustomStar' | 'removeCustomStar';

export type FXConfigPatch = Partial<Omit<IrisStore, StoreMethods | 'temperature' | 'irisState'>>;

export const useIrisStore = create<IrisStore>((set) => ({
  temperature: 42,
  irisState: 'idle',
  setTemperature: (temp) => set({ temperature: temp }),
  setIrisState: (state) => set({ irisState: state }),

  humidity: 62.5,
  tempHistory: Array(24).fill(42.0),
  fan1Speed: 60,
  fan1Rpm: 1200,
  fan2Speed: 60,
  fan2Rpm: 1150,
  fanMode: 'auto',
  finsState: 'open',
  pcState: 'on',
  roofAngle: 90,
  setHumidity: (h) => set({ humidity: h }),
  setTempHistory: (hist) => set({ tempHistory: hist }),
  setFan1Speed: (speed) => set({ fan1Speed: speed }),
  setFan1Rpm: (rpm) => set({ fan1Rpm: rpm }),
  setFan2Speed: (speed) => set({ fan2Speed: speed }),
  setFan2Rpm: (rpm) => set({ fan2Rpm: rpm }),
  setFanMode: (mode) => set({ fanMode: mode }),
  setFinsState: (fins) => set({ finsState: fins }),
  setPcState: (pc) => set({ pcState: pc }),
  setRoofAngle: (angle) => set({ roofAngle: angle }),

  glowBarsEnabled: true,
  glowLinesEnabled: true,
  colorZonesEnabled: [true, true, true, true, true, true, true, true],
  primaryColor: '#00f3ff',
  secondaryColor: '#00aaff',
  tertiaryColor: '#d946ef',
  quaternaryColor: '#ff007f',
  quinaryColor: '#ff5500',
  senaryColor: '#aaff00',
  septenaryColor: '#ffff00',
  octonaryColor: '#00ff55',
  // Configurações do App
  customThemeActive: false,
  ringColorCustom: '#06B6D4',
  rotationSpeed: 1.0,
  physicsMode: 'gel',
  repulsionStrength: 1.0,
  starSpeed: 1.0,
  glowIntensityBars: 1.0,
  glowIntensityLines: 1.2,
  nanobotTremorSpeed: 1.0,
  clearcoat: 1.0,
  barPulseSpeed: 1.0,
  barGlowPulseSpeed: 1.0,
  saturation: 1.0,
  ringColorCustom: '#00f3ff',
  ringSpeed: 1.0,
  pulseSpeed: 1.0,
  activePanel: [],
  setActivePanel: (panel) =>
    set((state) => {
      if (panel === null) return { activePanel: [] };
      const current = state.activePanel || [];
      const exists = current.includes(panel);
      return { activePanel: exists ? current.filter((p) => p !== panel) : [...current, panel] };
    }),
  dragOffset: { x: 0, y: 0 },
  snapToCenter: true,
  satelliteCoords: { x: 180, y: 0, z: 0 },
  satellite2Coords: { x: -180, y: 0, z: 0 },
  sat1Mode: 'manual',
  sat2Mode: 'manual',
  sat1Force: 1.0,
  sat2Force: 1.0,
  sat1Speed: 1.0,
  sat2Speed: 1.0,
  isDraggingSat1: false,
  isDraggingSat2: false,
  cosmicJetsEnabled: false,
  jetIntensity: 1.0,
  faceDetected: false,
  faceX: 0.0,
  faceY: 0.0,
  voiceText: '',
  
  customStars: [
    { id: 'star-initial', x: 0.8, y: -2.2, z: -3.0, size: 0.08, intensity: 8.0, color: '#ffebb8', haloSize: 4.5, haloIntensity: 0.2 }
  ],
  addCustomStar: () => set((state) => ({
    customStars: [
      ...state.customStars,
      {
        id: `star-${Date.now()}`,
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
        z: -2.0 - Math.random() * 2,
        size: 0.06 + Math.random() * 0.04,
        intensity: 5.0,
        color: '#ffffff',
        haloSize: 4.0,
        haloIntensity: 0.15
      }
    ]
  })),
  updateCustomStar: (id, updates) => set((state) => ({
    customStars: state.customStars.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  removeCustomStar: (id) => set((state) => ({
    customStars: state.customStars.filter(s => s.id !== id)
  })),

  setFXConfig: (config) => set((state) => ({ ...state, ...config })),
}));
