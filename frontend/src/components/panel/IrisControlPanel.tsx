import { useRef } from 'react';
import { IrisSection } from './IrisSection';
import { IrisSliderRow } from './IrisSliderRow';
import { IrisSelectRow } from './IrisSelectRow';
import { IrisToggleRow } from './IrisToggleRow';
import { SatelliteBlock } from './SatelliteBlock';
import { PresetBar } from './PresetBar';
import { ColorZoneEditor } from './ColorZoneEditor';
import { SLIDER_PARAMS, PHYSICS_OPTIONS } from '../../config/irisPanelParams';
import { useIrisStore } from '../../store/irisStore';

type Props = {
  onClose?: () => void;
  position: { x: number; y: number };
  onPositionChange?: (pos: { x: number; y: number }) => void;
  onDragEnd?: (x: number, y: number) => void;
};

export function IrisControlPanel({ onClose, position, onPositionChange, onDragEnd }: Props) {
  const setFXConfig = useIrisStore((s) => s.setFXConfig);
  const glowBarsEnabled = useIrisStore((s) => s.glowBarsEnabled);
  const glowLinesEnabled = useIrisStore((s) => s.glowLinesEnabled);
  
  // Parametros para a grade da Seção 5
  const glowIntensityBars = useIrisStore((s) => s.glowIntensityBars);
  const barPulseSpeed = useIrisStore((s) => s.barPulseSpeed);
  const pulseSpeed = useIrisStore((s) => s.pulseSpeed);

  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: position.x, origY: position.y };
  };

  const onHeaderPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    onPositionChange?.({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  };

  const onHeaderPointerUp = () => {
    if (dragRef.current.dragging) onDragEnd?.(position.x, position.y);
    dragRef.current.dragging = false;
  };

  return (
    <div 
      className="iris-panel-container select-none"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Detalhes de cantos metálicos no Bezel */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--iris-border)]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[var(--iris-border)]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[var(--iris-border)]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--iris-border)]" />

      <aside className="iris-panel shrink-0">
        <div className="iris-panel-screen-glow" />

        <header 
          className="iris-panel-header mb-4 flex justify-between items-center border-b border-[var(--iris-border)] pb-2 cursor-move font-mono font-bold text-[10px] tracking-widest text-[var(--iris-phosphor)]"
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
        >
          <span>IRIS_CONTROL // PANEL_R2</span>
          {onClose && (
            <button 
              type="button" 
              className="iris-btn py-0.5 px-2 text-[8px] cursor-pointer" 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
            >
              FECHAR
            </button>
          )}
        </header>

        <IrisSection title="SECTION 1 - PRESETS VISUAIS">
          <PresetBar />
        </IrisSection>

        <IrisSection title="SECTION 2 - FÍSICA E DINÂMICA">
          <IrisSelectRow 
            label="FÍSICA" 
            storeKey="physicsMode" 
            options={PHYSICS_OPTIONS} 
            passiveText="GEL | RÍGIDA | LÍQUIDA" 
          />
          <IrisToggleRow 
            label="ORB SNAP" 
            storeKey="snapToCenter" 
            passiveText="[ON/OFF]" 
          />
          
          {/* Barra de nível decorativa do mockup */}
          <div className="flex items-center gap-2 mb-3 select-none text-[9px] font-mono">
            <div className="w-[180px] flex items-center">
              <span className="text-[var(--iris-phosphor)] border border-[var(--iris-border)] px-1.5 py-0.5 bg-black tracking-widest">
                ████████████░░░░░
              </span>
            </div>
            <div className="flex-grow h-[1px] bg-[var(--iris-border)] opacity-20" />
          </div>

          {SLIDER_PARAMS.filter((p) => p.section === 'physics').map(({ key, ...rest }) => (
            <IrisSliderRow key={key} paramKey={key} {...rest} />
          ))}
          
          <SatelliteBlock title="SATÉLITE CIANO" accentClass="sat-block--ciano" modeKey="sat1Mode" section="sat1" />
          <SatelliteBlock title="SATÉLITE FUCSIA" accentClass="sat-block--fucsia" modeKey="sat2Mode" section="sat2" />
        </IrisSection>

        <IrisSection title="SECTION 3 - PRESETS EFEITOS FÍSICA E LUZ" defaultOpen={false}>
          <div className="text-center py-2 text-[10px] text-[var(--iris-phosphor-dim)] font-bold tracking-widest uppercase">
            A DEFINIR
          </div>
        </IrisSection>

        <IrisSection title="SECTION 4 - PERSONALIZAÇÃO DE CORES">
          <IrisToggleRow label="PALETA PERSONALIZADA" storeKey="customThemeActive" />
          <ColorZoneEditor />
        </IrisSection>

        <IrisSection title="SECTION 5 - GLOW">
          {/* Row 1: GLOW BARRA (left toggle) + slider (glowIntensityBars) + GLOW LINHA (right toggle) */}
          <div className="flex items-center gap-2 mb-2 select-none text-[9px] font-mono">
            <span className="text-[var(--iris-phosphor)] font-bold w-[120px] uppercase">GLOW BARRA</span>
            
            <button
              type="button"
              className={`px-2 py-0.5 border text-[9px] ${
                glowBarsEnabled 
                  ? 'bg-[var(--iris-phosphor)] text-black border-[var(--iris-phosphor)]' 
                  : 'bg-black text-[var(--iris-phosphor)] border-[var(--iris-border)]'
              }`}
              onClick={() => setFXConfig({ glowBarsEnabled: !glowBarsEnabled })}
            >
              {glowBarsEnabled ? 'ON' : 'OFF'}
            </button>

            <span className="text-[var(--iris-phosphor-dim)] font-bold ml-1">·</span>
            <span className="text-[var(--iris-phosphor)] font-bold mr-0.5">■</span>
            
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                className="iris-slider w-full"
                min={0}
                max={2.5}
                step={0.05}
                value={glowIntensityBars}
                disabled={!glowBarsEnabled}
                onChange={(e) => setFXConfig({ glowIntensityBars: parseFloat(e.target.value) })}
              />
            </div>

            <span className="text-[var(--iris-phosphor-dim)] font-bold ml-0.5">·</span>
            
            <button
              type="button"
              className={`px-2 py-0.5 border text-[9px] w-10 text-center ${
                glowLinesEnabled 
                  ? 'bg-[var(--iris-phosphor)] text-black border-[var(--iris-phosphor)]' 
                  : 'bg-black text-[var(--iris-phosphor)] border-[var(--iris-border)]'
              }`}
              onClick={() => setFXConfig({ glowLinesEnabled: !glowLinesEnabled })}
            >
              {glowLinesEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Row 2: PULSAÇÃO BARRA (label) + slider (barPulseSpeed) + value */}
          <div className="flex items-center gap-2 mb-2 select-none text-[9px] font-mono">
            <span className="text-[var(--iris-phosphor)] font-bold w-[156px] uppercase">PULSAÇÃO BARRA</span>
            <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
            <span className="text-[var(--iris-phosphor)] font-bold mr-0.5">■</span>
            
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                className="iris-slider w-full"
                min={0}
                max={3}
                step={0.1}
                value={barPulseSpeed}
                disabled={!glowBarsEnabled}
                onChange={(e) => setFXConfig({ barPulseSpeed: parseFloat(e.target.value) })}
              />
            </div>

            <span className="text-[var(--iris-phosphor-dim)] font-bold ml-0.5">·</span>
            <span className="iris-value text-right w-8">{barPulseSpeed.toFixed(2)}</span>
          </div>

          {/* Row 3: PULSAÇÃO LINHA (label) + slider (pulseSpeed) + value */}
          <div className="flex items-center gap-2 mb-2 select-none text-[9px] font-mono">
            <span className="text-[var(--iris-phosphor)] font-bold w-[156px] uppercase">PULSAÇÃO LINHA</span>
            <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
            <span className="text-[var(--iris-phosphor)] font-bold mr-0.5">■</span>
            
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                className="iris-slider w-full"
                min={0}
                max={4}
                step={0.1}
                value={pulseSpeed}
                disabled={!glowLinesEnabled}
                onChange={(e) => setFXConfig({ pulseSpeed: parseFloat(e.target.value) })}
              />
            </div>

            <span className="text-[var(--iris-phosphor-dim)] font-bold ml-0.5">·</span>
            <span className="iris-value text-right w-8">{pulseSpeed.toFixed(2)}</span>
          </div>
        </IrisSection>

        <footer className="sticky bottom-0 py-2 mt-6 text-[9px] border-t border-[var(--iris-border)] bg-black font-mono font-bold text-center">
          SCROLL // ALL SYSTEMS NOMINAL
        </footer>
      </aside>
    </div>
  );
}
