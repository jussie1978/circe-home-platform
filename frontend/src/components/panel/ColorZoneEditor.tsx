import { useState } from 'react';
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

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

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
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function ColorZoneEditor() {
  const customThemeActive = useIrisStore((s) => s.customThemeActive);
  const setFXConfig = useIrisStore((s) => s.setFXConfig);
  const [activeZoneIndex, setActiveZoneIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const saturation = useIrisStore((s) => s.saturation);

  const activeZoneKey = ZONE_KEYS[activeZoneIndex];
  const activeColor = useIrisStore((s) => s[activeZoneKey]);

  if (!customThemeActive) {
    return <p className="iris-label">ATIVE PALETA PERSONALIZADA PARA EDITAR ZONAS.</p>;
  }

  // Converter cor ativa para coordenadas x, y para o cursor na Color Wheel
  const hsl = hexToHsl(activeColor);
  const angle = (hsl.h / 180) * Math.PI;
  const radius = 36;
  const dist = (hsl.s / 100) * radius;
  const cursorX = 40 + Math.cos(angle) * dist;
  const cursorY = 40 + Math.sin(angle) * dist;

  const updateColorFromEvent = (clientX: number, clientY: number, rect: DOMRect) => {
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;

    const clickAngle = Math.atan2(y, x);
    const clickDist = Math.sqrt(x * x + y * y);
    const maxRadius = rect.width / 2;
    const normalizedDist = Math.min(1.0, clickDist / maxRadius);

    const h = (clickAngle * 180 / Math.PI + 360) % 360;
    const s = normalizedDist * 100;
    const l = 50;

    const hex = hslToHex(h, s, l);
    setFXConfig({ [activeZoneKey]: hex });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateColorFromEvent(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateColorFromEvent(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      {/* Seletor de Zona Ativa */}
      <div className="iris-label mb-1.5">SELECIONAR ZONA PARA AJUSTE:</div>
      <div className="grid grid-cols-5 gap-1.5 mb-3 select-none">
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

      {/* Editor Radial & Slider Saturation */}
      <div className="flex items-center gap-6 bg-black/10 p-2 border border-[var(--iris-border)]">
        {/* Color Wheel */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="color-wheel-circle flex-shrink-0"
        >
          {/* Cursor Cruz de seleção */}
          <div 
            className="color-wheel-pointer"
            style={{ left: `${cursorX}px`, top: `${cursorY}px` }}
          >
            +
          </div>
        </div>

        {/* Saturation Slider */}
        <div className="flex-1 min-w-0 pr-1 select-none">
          <div className="text-[var(--iris-phosphor)] font-bold mb-1.5 uppercase text-[9px]">SATURAÇÃO</div>
          <div className="flex items-center gap-2 text-[9px] font-mono">
            <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
            <span className="text-[var(--iris-phosphor)] font-bold mr-0.5">■</span>
            
            <div className="flex-1 relative flex items-center">
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
        </div>
      </div>

      <p className="iris-label text-[8px] mt-1.5 text-center leading-normal">
        CLIQUE OU ARRASTE NO CÍRCULO CONCENTRICO PARA ESCOLHER O TOM DA ZONA SELECIONADA.
      </p>
    </div>
  );
}
