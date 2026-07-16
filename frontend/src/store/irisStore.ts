// src/store/irisStore.ts
import { create } from 'zustand';

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
  finsState: 'open' | 'closed' | 'moving' | 'error';
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
  customThemeActive: boolean;
  rotationSpeed: number;
  physicsMode: 'gel' | 'mechanical' | 'liquid';
  repulsionStrength: number;
  starSpeed: number;
  glowIntensityBars: number;
  glowIntensityLines: number;
  barPulseSpeed: number;
  barGlowPulseSpeed: number;
  saturation: number;
  ringColorCustom: string;
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

  setFXConfig: (config: FXConfigPatch) => void;
}

type StoreMethods =
  | 'setTemperature' | 'setIrisState' | 'setHumidity' | 'setTempHistory'
  | 'setFan1Speed' | 'setFan1Rpm' | 'setFan2Speed' | 'setFan2Rpm'
  | 'setFanMode' | 'setFinsState' | 'setPcState' | 'setRoofAngle'
  | 'setActivePanel' | 'setFXConfig';

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
  customThemeActive: false,
  rotationSpeed: 1.0,
  physicsMode: 'gel',
  repulsionStrength: 1.0,
  starSpeed: 1.0,
  glowIntensityBars: 1.2,
  glowIntensityLines: 1.2,
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
  setFXConfig: (config) => set((state) => ({ ...state, ...config })),
}));
