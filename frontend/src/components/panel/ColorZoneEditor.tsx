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

export function ColorZoneEditor() {
  const customThemeActive = useIrisStore((s) => s.customThemeActive);
  const setFXConfig = useIrisStore((s) => s.setFXConfig);
  const [activeZoneIndex, setActiveZoneIndex] = useState<number>(0);
  const saturation = useIrisStore((s) => s.saturation);

  const activeZoneKey = ZONE_KEYS[activeZoneIndex];
  const activeColor = useIrisStore((s) => s[activeZoneKey]);

  const [localHex, setLocalHex] = useState(activeColor);
  const lastHexSetRef = useRef('');

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

  const rgb = hexToRgb(activeColor);

  const handleChannelChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [channel]: value };
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    lastHexSetRef.current = hex;
    setFXConfig({ [activeZoneKey]: hex });
  };

  return (
    <div className="space-y-4 select-none">
      {/* Seletor de Zona Ativa */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="iris-label text-[10px]">SELECIONAR ZONA PARA AJUSTE:</span>
        <button 
          type="button"
          className="iris-btn py-0.5 px-2 text-[8px] cursor-pointer"
          onClick={triggerEyeDropper}
        >
          CONTA-GOTAS
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1.5 mb-3">
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

      {/* Visualização de Cor e Input HEX */}
      <div className="flex items-center gap-3 bg-black/10 p-2 border border-[var(--iris-border)]">
        <div 
          className="w-8 h-8 border border-[var(--iris-border)] flex-shrink-0"
          style={{ backgroundColor: activeColor }}
        />
        <div className="flex items-center gap-2 text-[10px] font-mono select-text flex-grow">
          <span className="text-[var(--iris-phosphor-dim)] font-bold">HEX:</span>
          <input
            type="text"
            className="bg-black border border-[var(--iris-border)] px-2 py-0.5 text-[var(--iris-phosphor)] w-[75px] uppercase font-bold outline-none text-[10px]"
            value={localHex}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#000000"
            maxLength={7}
          />
        </div>
        
        {/* Saturation Slider */}
        <div className="w-[180px] select-none text-[9px] font-mono">
          <div className="text-[var(--iris-phosphor)] font-bold mb-1 uppercase">SATURAÇÃO</div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
            <span className="text-[var(--iris-phosphor)] font-bold mr-0.5">■</span>
            
            <div className="flex-grow relative flex items-center">
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

      {/* Sliders de Canais RGB */}
      <div className="space-y-2.5 bg-black/10 p-2 border-x border-b border-[var(--iris-border)]">
        {/* Red Channel */}
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="text-[var(--iris-fuchsia)] font-bold w-14 uppercase">CANAL R</span>
          <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
          <span className="text-[var(--iris-fuchsia)] font-bold mr-0.5">■</span>
          <div className="flex-grow relative flex items-center">
            <input
              type="range"
              className="iris-slider w-full"
              data-accent="fuchsia"
              min={0}
              max={255}
              step={1}
              value={rgb.r}
              onChange={(e) => handleChannelChange('r', parseInt(e.target.value, 10))}
            />
          </div>
          <span className="text-[var(--iris-phosphor-dim)] font-bold ml-0.5">·</span>
          <span className="text-[var(--iris-fuchsia)] text-right w-8 font-bold">{rgb.r}</span>
        </div>

        {/* Green Channel */}
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="text-[var(--iris-phosphor)] font-bold w-14 uppercase">CANAL G</span>
          <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
          <span className="text-[var(--iris-phosphor)] font-bold mr-0.5">■</span>
          <div className="flex-grow relative flex items-center">
            <input
              type="range"
              className="iris-slider w-full"
              min={0}
              max={255}
              step={1}
              value={rgb.g}
              onChange={(e) => handleChannelChange('g', parseInt(e.target.value, 10))}
            />
          </div>
          <span className="text-[var(--iris-phosphor-dim)] font-bold ml-0.5">·</span>
          <span className="text-[var(--iris-phosphor)] text-right w-8 font-bold">{rgb.g}</span>
        </div>

        {/* Blue Channel */}
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="text-[var(--iris-cyan)] font-bold w-14 uppercase">CANAL B</span>
          <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
          <span className="text-[var(--iris-cyan)] font-bold mr-0.5">■</span>
          <div className="flex-grow relative flex items-center">
            <input
              type="range"
              className="iris-slider w-full"
              data-accent="cyan"
              min={0}
              max={255}
              step={1}
              value={rgb.b}
              onChange={(e) => handleChannelChange('b', parseInt(e.target.value, 10))}
            />
          </div>
          <span className="text-[var(--iris-phosphor-dim)] font-bold ml-0.5">·</span>
          <span className="text-[var(--iris-cyan)] text-right w-8 font-bold">{rgb.b}</span>
        </div>
      </div>

      <p className="iris-label text-[8px] mt-1.5 text-center leading-normal">
        AJUSTE OS SLIDERS DOS CANAIS R, G, B OU DIGITE O HEX DA COR PARA EDITAR A ZONA.
      </p>
    </div>
  );
}
