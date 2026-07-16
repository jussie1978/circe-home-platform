import type { IrisStore } from '../store/irisStore';

export type SliderFXKey =
  | 'rotationSpeed' | 'repulsionStrength' | 'starSpeed' | 'ringSpeed'
  | 'sat1Force' | 'sat1Speed' | 'sat2Force' | 'sat2Speed'
  | 'glowIntensityBars' | 'glowIntensityLines'
  | 'barGlowPulseSpeed' | 'barPulseSpeed' | 'pulseSpeed'
  | 'saturation' | 'jetIntensity';

export const PHYSICS_OPTIONS = [
  { value: 'gel', label: 'GEL' },
  { value: 'mechanical', label: 'RÍGIDA' },
  { value: 'liquid', label: 'LÍQUIDA' },
] as const satisfies readonly { value: IrisStore['physicsMode']; label: string }[];

export const SAT_MODE_OPTIONS = [
  { value: 'manual', label: 'MANUAL' },
  { value: 'gravitational', label: 'GRAVITACIONAL' },
  { value: 'orbital', label: 'ORBITAL 3D' },
] as const satisfies readonly { value: IrisStore['sat1Mode']; label: string }[];

export type SliderSection =
  | 'physics' | 'sat1' | 'sat2' | 'effects' | 'colors' | 'glow';

export const SLIDER_PARAMS: {
  key: SliderFXKey;
  label: string;
  min: number;
  max: number;
  step: number;
  section: SliderSection;
}[] = [
  { key: 'rotationSpeed', label: 'ROTAÇÃO ORBE PRINCIPAL', min: 0.1, max: 3, step: 0.05, section: 'physics' },
  { key: 'repulsionStrength', label: 'REPULSÃO MOUSE', min: 0, max: 2.5, step: 0.05, section: 'physics' },
  { key: 'starSpeed', label: 'VÓRTICE ESTRELAS', min: 0, max: 3, step: 0.05, section: 'physics' },
  { key: 'ringSpeed', label: 'VELOCIDADE ANEL PARTÍCULAS', min: 0, max: 3, step: 0.05, section: 'physics' },
  { key: 'sat1Force', label: 'FORÇA IMPACTO', min: -2, max: 2, step: 0.05, section: 'sat1' },
  { key: 'sat1Speed', label: 'VELOCIDADE ORBITAL', min: 0, max: 3, step: 0.05, section: 'sat1' },
  { key: 'sat2Force', label: 'FORÇA IMPACTO', min: -2, max: 2, step: 0.05, section: 'sat2' },
  { key: 'sat2Speed', label: 'VELOCIDADE ORBITAL', min: 0, max: 3, step: 0.05, section: 'sat2' },
  { key: 'jetIntensity', label: 'INTENSIDADE JATO', min: 0.1, max: 2.5, step: 0.05, section: 'effects' },
  { key: 'saturation', label: 'SATURAÇÃO', min: 0, max: 2, step: 0.05, section: 'colors' },
  { key: 'glowIntensityBars', label: 'INTENSIDADE GLOW BARRA', min: 0.2, max: 2.5, step: 0.05, section: 'glow' },
  { key: 'barGlowPulseSpeed', label: 'PULSAÇÃO GLOW BARRA', min: 0, max: 3, step: 0.05, section: 'glow' },
  { key: 'barPulseSpeed', label: 'PULSAÇÃO BARRA', min: 0, max: 3, step: 0.05, section: 'glow' },
  { key: 'glowIntensityLines', label: 'INTENSIDADE GLOW LINHA', min: 0.2, max: 2.5, step: 0.05, section: 'glow' },
  { key: 'pulseSpeed', label: 'PULSAÇÃO LINHA', min: 0, max: 4, step: 0.05, section: 'glow' },
];

export const COLOR_ZONE_KEYS = [
  'primaryColor',
  'secondaryColor',
  'tertiaryColor',
  'quaternaryColor',
  'quinaryColor',
  'senaryColor',
  'septenaryColor',
  'octonaryColor',
] as const;

export type ColorZoneKey = (typeof COLOR_ZONE_KEYS)[number];

export const COLOR_ZONE_LABELS = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'] as const;
