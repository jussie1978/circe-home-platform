import type { FXConfigPatch } from '../store/irisStore';
import { useIrisStore } from '../store/irisStore';

const USER_KEY = 'iris_preset_usuario';

export const PRESET_SNAPSHOT_KEYS: (keyof FXConfigPatch)[] = [
  'rotationSpeed', 'repulsionStrength', 'starSpeed', 'ringSpeed', 'pulseSpeed',
  'physicsMode', 'snapToCenter',
  'glowBarsEnabled', 'glowLinesEnabled',
  'glowIntensityBars', 'glowIntensityLines',
  'barPulseSpeed', 'barGlowPulseSpeed',
  'customThemeActive', 'saturation',
  'primaryColor', 'secondaryColor', 'tertiaryColor', 'quaternaryColor',
  'quinaryColor', 'senaryColor', 'septenaryColor', 'octonaryColor',
  'ringColorCustom', 'colorZonesEnabled',
  'sat1Mode', 'sat1Force', 'sat1Speed',
  'sat2Mode', 'sat2Force', 'sat2Speed',
  'cosmicJetsEnabled', 'jetIntensity',
];

export const FACTORY_PRESETS: { id: string; name: string; snapshot: FXConfigPatch }[] = [
  {
    id: 'padrao-iris',
    name: 'PADRÃO IRIS',
    snapshot: {
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
      physicsMode: 'gel',
      customThemeActive: false,
      primaryColor: '#00f3ff',
      secondaryColor: '#00aaff',
      tertiaryColor: '#d946ef',
      quaternaryColor: '#ff007f',
      quinaryColor: '#ff5500',
      senaryColor: '#aaff00',
      septenaryColor: '#ffff00',
      octonaryColor: '#00ff55',
      ringColorCustom: '#00f3ff',
      snapToCenter: true,
      glowBarsEnabled: true,
      glowLinesEnabled: true,
      colorZonesEnabled: [true, true, true, true, true, true, true, true],
      sat1Mode: 'manual',
      sat2Mode: 'manual',
      sat1Force: 1.0,
      sat2Force: 1.0,
      sat1Speed: 1.0,
      sat2Speed: 1.0,
      cosmicJetsEnabled: false,
      jetIntensity: 1.0,
    },
  },
  {
    id: 'preset-02',
    name: 'PRESET_02',
    snapshot: {
      rotationSpeed: 1.8,
      repulsionStrength: 1.5,
      glowIntensityBars: 2.0,
      glowIntensityLines: 2.0,
      barPulseSpeed: 2.0,
      barGlowPulseSpeed: 2.0,
      starSpeed: 2.5,
      saturation: 1.5,
      ringSpeed: 2.0,
      pulseSpeed: 2.0,
      physicsMode: 'mechanical',
      customThemeActive: true,
      primaryColor: '#ff007f',
      secondaryColor: '#d946ef',
      tertiaryColor: '#00f3ff',
      quaternaryColor: '#00ff55',
      quinaryColor: '#ffff00',
      senaryColor: '#ff5500',
      septenaryColor: '#ff007f',
      octonaryColor: '#aaff00',
      ringColorCustom: '#d946ef',
      snapToCenter: true,
      glowBarsEnabled: true,
      glowLinesEnabled: true,
      colorZonesEnabled: [true, true, true, true, true, true, true, true],
      sat1Mode: 'orbital',
      sat2Mode: 'orbital',
      sat1Force: 1.5,
      sat2Force: 1.5,
      sat1Speed: 1.8,
      sat2Speed: 1.8,
      cosmicJetsEnabled: true,
      jetIntensity: 1.5,
    },
  },
  {
    id: 'preset-03',
    name: 'PRESET_03',
    snapshot: {
      rotationSpeed: 0.4,
      repulsionStrength: 0.6,
      glowIntensityBars: 0.5,
      glowIntensityLines: 0.5,
      barPulseSpeed: 0.5,
      barGlowPulseSpeed: 0.5,
      starSpeed: 0.3,
      saturation: 0.8,
      ringSpeed: 0.5,
      pulseSpeed: 0.5,
      physicsMode: 'liquid',
      customThemeActive: true,
      primaryColor: '#ff5500',
      secondaryColor: '#ffff00',
      tertiaryColor: '#aaff00',
      quaternaryColor: '#00ff55',
      quinaryColor: '#00f3ff',
      senaryColor: '#00aaff',
      septenaryColor: '#d946ef',
      octonaryColor: '#ff007f',
      ringColorCustom: '#ff5500',
      snapToCenter: false,
      glowBarsEnabled: false,
      glowLinesEnabled: false,
      colorZonesEnabled: [true, false, true, false, true, false, true, false],
      sat1Mode: 'gravitational',
      sat2Mode: 'gravitational',
      sat1Force: 0.8,
      sat2Force: 0.8,
      sat1Speed: 0.6,
      sat2Speed: 0.6,
      cosmicJetsEnabled: false,
      jetIntensity: 0.5,
    },
  },
];

function pickSnapshot(): FXConfigPatch {
  const state = useIrisStore.getState();
  const out: FXConfigPatch = {};
  for (const k of PRESET_SNAPSHOT_KEYS) {
    (out as Record<string, unknown>)[k] = state[k as keyof typeof state];
  }
  return out;
}

export function applyPreset(snapshot: FXConfigPatch) {
  useIrisStore.getState().setFXConfig(snapshot);
}

export function saveUserPreset(): void {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ name: 'Usuário', savedAt: Date.now(), ...pickSnapshot() }),
  );
}

export function loadUserPreset(): boolean {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as FXConfigPatch;
    applyPreset(data);
    return true;
  } catch {
    return false;
  }
}
