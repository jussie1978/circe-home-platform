import { useState, useEffect, useRef } from 'react';
import { useIrisStore } from '../../store/irisStore';
import { ColorZoneCell } from './ColorZoneCell';

const ZONE_KEYS = [
  'primaryColor',
  'secondaryColor',
  'tertiaryColor',
  'quaternaryColor',
  'quinaryColor',
  'senaryColor',
  'septenaryColor',
  'octonaryColor',
  'ringColorCustom'
] as const;

const CYBER_PRESETS = [
  { name: 'CIANO', value: '#00f3ff' },
  { name: 'ROXO', value: '#9d4edd' },
  { name: 'VERDE', value: '#39ff14' },
  { name: 'VERMELHO', value: '#dc2626' },
  { name: 'LARANJA', value: '#ff5500' },
  { name: 'ÂMBAR', value: '#f59e0b' },
  { name: 'AZUL', value: '#1d4ed8' },
  { name: 'BRANCO', value: '#f8fafc' },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const num = parseInt(hex, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)));
  const toHex = (val: number) => {
    const hex = clamp(val).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r = l, g = l, b = l;

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function ColorZoneEditor() {
  const customThemeActive = useIrisStore((s) => s.customThemeActive);
  const setFXConfig = useIrisStore((s) => s.setFXConfig);
  const [activeZoneIndex, setActiveZoneIndex] = useState<number>(0);
  const saturation = useIrisStore((s) => s.saturation);

  const activeZoneKey = ZONE_KEYS[activeZoneIndex];
  const activeColor = useIrisStore((s) => s[activeZoneKey]);

  const [localHex, setLocalHex] = useState(activeColor);
  const lastHexSetRef = useRef('');

  const [sliderMode, setSliderMode] = useState<'hsl' | 'rgb'>('hsl');

  useEffect(() => {
    if (activeColor.toLowerCase() !== lastHexSetRef.current.toLowerCase()) {
      setLocalHex(activeColor.toUpperCase());
    }
  }, [activeColor]);

  if (!customThemeActive) {
    return <p className="iris-label">ATIVE PALETA PERSONALIZADA PARA EDITAR ZONAS.</p>;
  }

  const triggerEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        setFXConfig({ [activeZoneKey]: result.sRGBHex });
      } catch (err) {
        console.log('EyeDropper cancelled or failed:', err);
      }
    } else {
      const input = document.createElement('input');
      input.type = 'color';
      input.value = activeColor;
      input.onchange = (e) => {
        const val = (e.target as HTMLInputElement).value;
        if (val) {
          setFXConfig({ [activeZoneKey]: val });
        }
      };
      input.click();
    }
  };

  const handleHexChange = (val: string) => {
    setLocalHex(val);
    const hexRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    if (hexRegex.test(val)) {
      const normalized = val.startsWith('#') ? val : `#${val}`;
      lastHexSetRef.current = normalized;
      setFXConfig({ [activeZoneKey]: normalized });
    }
  };

  const activeRgb = hexToRgb(activeColor);
  const activeHsl = rgbToHsl(activeRgb.r, activeRgb.g, activeRgb.b);

  const handleHslChange = (channel: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...activeHsl, [channel]: value };
    const rgbVal = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hex = rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b);
    lastHexSetRef.current = hex;
    setFXConfig({ [activeZoneKey]: hex });
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...activeRgb, [channel]: value };
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    lastHexSetRef.current = hex;
    setFXConfig({ [activeZoneKey]: hex });
  };

  const updateColorFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const radius = width / 2;

    const x = e.clientX - rect.left - radius;
    const y = e.clientY - rect.top - radius;

    const r = Math.sqrt(x * x + y * y);
    const thetaRad = Math.atan2(y, x);
    const thetaDeg = (thetaRad * 180) / Math.PI;
    const h = Math.round((thetaDeg + 90 + 360) % 360);
    const s = Math.min(100, Math.round((r / radius) * 100));

    // Keep active lightness constant to preserve brightness context
    const rgbVal = hslToRgb(h, s, activeHsl.l);
    const hexVal = rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b);
    lastHexSetRef.current = hexVal;
    setFXConfig({ [activeZoneKey]: hexVal });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    updateColorFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.stopPropagation();
      updateColorFromPointer(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="space-y-3.5 select-none">
      {/* Seletor de Zona Ativa */}
      <div className="flex justify-between items-center mb-1">
        <span className="iris-label text-[10px]">SELECIONAR ZONA PARA AJUSTE:</span>
        <button
          type="button"
          className="iris-btn py-0.5 px-2 text-[8px] cursor-pointer"
          onClick={triggerEyeDropper}
        >
          CONTA-GOTAS
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1.5 mb-2">
        {ZONE_KEYS.map((key, i) => {
          const isRing = key === 'ringColorCustom';
          return (
            <ColorZoneCell
              key={key}
              index={isRing ? -1 : i}
              zoneKey={key}
              isRing={isRing}
              active={activeZoneIndex === i}
              onSelect={() => setActiveZoneIndex(i)}
              onDeselect={() => setActiveZoneIndex(0)}
            />
          );
        })}
      </div>

      {/* HUD Principal Unificado de Cores (Radar + Sliders) */}
      <div className="flex gap-4 items-stretch bg-black/10 p-2.5 border border-[var(--iris-border)]">
        {/* Coluna Esquerda: Radar Scope */}
        <div className="flex flex-col items-center justify-center flex-shrink-0 w-[110px]">
          <div
            className="radar-wheel-wrapper"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="radar-wheel-circle" />
            <div className="radar-overlay" />
            <div className="radar-crosshair-h" />
            <div className="radar-crosshair-v" />
            <div className="radar-sweep" />

            {(() => {
              const h = activeHsl.h;
              const s = activeHsl.s;
              const radius = 55; // 110 / 2

              const thetaDeg = (h - 90 + 360) % 360;
              const thetaRad = (thetaDeg * Math.PI) / 180;

              const x = radius * (s / 100) * Math.cos(thetaRad);
              const y = radius * (s / 100) * Math.sin(thetaRad);

              const leftPercent = 50 + (x / 110) * 100;
              const topPercent = 50 + (y / 110) * 100;

              return (
                <div
                  className="radar-reticle"
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                  }}
                />
              );
            })()}
          </div>
          <span className="text-[7.5px] text-[var(--iris-phosphor-dim)] mt-1.5 font-mono text-center tracking-tighter">
            H:{activeHsl.h}° S:{activeHsl.s}%
          </span>
        </div>

        {/* Coluna Direita: Sliders e Ajustes Numéricos */}
        <div className="flex flex-col justify-between flex-grow space-y-2">
          {/* Visualização de Cor Ativa + Input HEX + Modo Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 border border-[var(--iris-border)] flex-shrink-0"
                style={{ backgroundColor: activeColor }}
              />
              <div className="flex items-center gap-1 text-[9px] font-mono select-text">
                <span className="text-[var(--iris-phosphor-dim)] font-bold">HEX:</span>
                <input
                  type="text"
                  className="bg-black border border-[var(--iris-border)] px-1 py-0.5 text-[var(--iris-phosphor)] w-[54px] uppercase font-bold outline-none text-[9px]"
                  value={localHex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#0000"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Alternador HSL/RGB */}
            <div className="flex gap-0.5">
              <button
                type="button"
                className={`iris-btn-toggle py-0.5 px-1.5 text-[8px] cursor-pointer ${
                  sliderMode === 'hsl' ? 'active' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSliderMode('hsl');
                }}
              >
                HSL
              </button>
              <button
                type="button"
                className={`iris-btn-toggle py-0.5 px-1.5 text-[8px] cursor-pointer ${
                  sliderMode === 'rgb' ? 'active' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSliderMode('rgb');
                }}
              >
                RGB
              </button>
            </div>
          </div>

          {/* Área de Sliders de Canal */}
          {sliderMode === 'hsl' ? (
            <div className="space-y-1.5">
              {/* Matiz */}
              <div className="flex items-center gap-1.5 text-[9px] font-mono">
                <span className="text-[var(--iris-phosphor)] font-bold w-4">H</span>
                <input
                  type="range"
                  className="iris-channel-slider flex-grow"
                  style={{
                    background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)',
                  }}
                  min={0}
                  max={360}
                  step={1}
                  value={activeHsl.h}
                  onChange={(e) => handleHslChange('h', parseInt(e.target.value, 10))}
                />
                <input
                  type="text"
                  className="custom-slider-num-input"
                  value={activeHsl.h}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed)) handleHslChange('h', Math.min(360, Math.max(0, parsed)));
                  }}
                />
              </div>

              {/* Saturação */}
              <div className="flex items-center gap-1.5 text-[9px] font-mono">
                <span className="text-[var(--iris-phosphor)] font-bold w-4">S</span>
                <input
                  type="range"
                  className="iris-channel-slider flex-grow"
                  style={{
                    background: `linear-gradient(to right, hsl(${activeHsl.h}, 0%, ${activeHsl.l}%), hsl(${activeHsl.h}, 100%, ${activeHsl.l}%))`,
                  }}
                  min={0}
                  max={100}
                  step={1}
                  value={activeHsl.s}
                  onChange={(e) => handleHslChange('s', parseInt(e.target.value, 10))}
                />
                <input
                  type="text"
                  className="custom-slider-num-input"
                  value={activeHsl.s}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed)) handleHslChange('s', Math.min(100, Math.max(0, parsed)));
                  }}
                />
              </div>

              {/* Luminosidade/Brilho */}
              <div className="flex items-center gap-1.5 text-[9px] font-mono">
                <span className="text-[var(--iris-phosphor)] font-bold w-4">L</span>
                <input
                  type="range"
                  className="iris-channel-slider flex-grow"
                  style={{
                    background: `linear-gradient(to right, hsl(${activeHsl.h}, ${activeHsl.s}%, 0%), hsl(${activeHsl.h}, ${activeHsl.s}%, 50%), hsl(${activeHsl.h}, ${activeHsl.s}%, 100%))`,
                  }}
                  min={0}
                  max={100}
                  step={1}
                  value={activeHsl.l}
                  onChange={(e) => handleHslChange('l', parseInt(e.target.value, 10))}
                />
                <input
                  type="text"
                  className="custom-slider-num-input"
                  value={activeHsl.l}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed)) handleHslChange('l', Math.min(100, Math.max(0, parsed)));
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Vermelho */}
              <div className="flex items-center gap-1.5 text-[9px] font-mono">
                <span className="text-[var(--iris-fuchsia)] font-bold w-4">R</span>
                <input
                  type="range"
                  className="iris-channel-slider flex-grow"
                  style={{
                    background: `linear-gradient(to right, rgb(0, ${activeRgb.g}, ${activeRgb.b}), rgb(255, ${activeRgb.g}, ${activeRgb.b}))`,
                  }}
                  min={0}
                  max={255}
                  step={1}
                  value={activeRgb.r}
                  onChange={(e) => handleRgbChange('r', parseInt(e.target.value, 10))}
                />
                <input
                  type="text"
                  className="custom-slider-num-input"
                  value={activeRgb.r}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed)) handleRgbChange('r', Math.min(255, Math.max(0, parsed)));
                  }}
                />
              </div>

              {/* Verde */}
              <div className="flex items-center gap-1.5 text-[9px] font-mono">
                <span className="text-[var(--iris-phosphor)] font-bold w-4">G</span>
                <input
                  type="range"
                  className="iris-channel-slider flex-grow"
                  style={{
                    background: `linear-gradient(to right, rgb(${activeRgb.r}, 0, ${activeRgb.b}), rgb(${activeRgb.r}, 255, ${activeRgb.b}))`,
                  }}
                  min={0}
                  max={255}
                  step={1}
                  value={activeRgb.g}
                  onChange={(e) => handleRgbChange('g', parseInt(e.target.value, 10))}
                />
                <input
                  type="text"
                  className="custom-slider-num-input"
                  value={activeRgb.g}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed)) handleRgbChange('g', Math.min(255, Math.max(0, parsed)));
                  }}
                />
              </div>

              {/* Azul */}
              <div className="flex items-center gap-1.5 text-[9px] font-mono">
                <span className="text-[var(--iris-cyan)] font-bold w-4">B</span>
                <input
                  type="range"
                  className="iris-channel-slider flex-grow"
                  style={{
                    background: `linear-gradient(to right, rgb(${activeRgb.r}, ${activeRgb.g}, 0), rgb(${activeRgb.r}, ${activeRgb.g}, 255))`,
                  }}
                  min={0}
                  max={255}
                  step={1}
                  value={activeRgb.b}
                  onChange={(e) => handleRgbChange('b', parseInt(e.target.value, 10))}
                />
                <input
                  type="text"
                  className="custom-slider-num-input"
                  value={activeRgb.b}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed)) handleRgbChange('b', Math.min(255, Math.max(0, parsed)));
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paleta Rápida (Swatches) */}
      <div className="cyber-swatches-container">
        {CYBER_PRESETS.map((preset) => {
          const isActive = activeColor.toLowerCase() === preset.value.toLowerCase();
          return (
            <button
              key={preset.name}
              type="button"
              className={`cyber-swatch-btn ${isActive ? 'active' : ''}`}
              title={preset.name}
              style={{ color: preset.value }}
              onClick={(e) => {
                e.stopPropagation();
                lastHexSetRef.current = preset.value;
                setFXConfig({ [activeZoneKey]: preset.value });
              }}
            >
              <div className="w-2.5 h-2.5" style={{ backgroundColor: preset.value }} />
            </button>
          );
        })}
      </div>

      {/* Saturação Efeito Global */}
      <div className="flex items-center justify-between bg-black/10 p-2 border border-[var(--iris-border)] select-none text-[9px] font-mono">
        <span className="text-[var(--iris-phosphor-dim)] font-bold uppercase w-[130px]">SATURAÇÃO EFEITO</span>
        <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
        <span className="text-[var(--iris-phosphor)] font-bold mr-0.5">■</span>

        <div className="flex-grow relative flex items-center mx-2">
          <input
            type="range"
            className="iris-slider w-full"
            min={0}
            max={2}
            step={0.05}
            value={saturation}
            onChange={(e) => setFXConfig({ saturation: parseFloat(e.target.value) })}
          />
        </div>

        <span className="text-[var(--iris-phosphor-dim)] font-bold ml-0.5">·</span>
        <span className="iris-value text-right w-8">{saturation.toFixed(2)}</span>
      </div>

      <p className="iris-label text-[8px] text-center leading-normal">
        RADAR E SLIDERS ACOPLADOS EM TEMPO REAL. ATALHOS RÁPIDOS NA FILEIRA CENTRAL.
      </p>
    </div>
  );
}
