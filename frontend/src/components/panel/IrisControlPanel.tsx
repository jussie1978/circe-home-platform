import { useRef } from 'react';
import { IrisSection } from './IrisSection';
import { IrisSliderRow } from './IrisSliderRow';
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
  
  const customStars = useIrisStore((s) => s.customStars);
  const addCustomStar = useIrisStore((s) => s.addCustomStar);
  const updateCustomStar = useIrisStore((s) => s.updateCustomStar);
  const removeCustomStar = useIrisStore((s) => s.removeCustomStar);
  
  // Parametros para a grade da Seção 5
  const glowIntensityBars = useIrisStore((s) => s.glowIntensityBars);
  const glowIntensityLines = useIrisStore((s) => s.glowIntensityLines);
  const nanobotTremorSpeed = useIrisStore((s) => s.nanobotTremorSpeed);
  const pulseSpeed = useIrisStore((s) => s.pulseSpeed);
  const barGlowPulseSpeed = useIrisStore((s) => s.barGlowPulseSpeed);
  const barPulseSpeed = useIrisStore((s) => s.barPulseSpeed);

  const physicsMode = useIrisStore((s) => s.physicsMode);
  const snapToCenter = useIrisStore((s) => s.snapToCenter);
  const repulsionStrength = useIrisStore((s) => s.repulsionStrength);

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
          {/* Row 3: NANOBOTS SPD */}
          <div className="flex items-center gap-3 mb-3">
            <span className="iris-label text-cyan-400/70 w-24">NANOBOTS SPD</span>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              className="iris-slider flex-1"
              value={nanobotTremorSpeed}
              onChange={(e) => setFXConfig({ nanobotTremorSpeed: parseFloat(e.target.value) })}
            />
            <span className="iris-value text-right w-8">{nanobotTremorSpeed.toFixed(1)}x</span>
          </div>

          {/* Linha combinada: FÍSICA + ORB SNAP */}
          <div className="flex items-center justify-between mb-3 select-none text-[9px] font-mono">
            {/* Física Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[var(--iris-phosphor)] font-bold uppercase w-[60px]">FÍSICA</span>
              <select
                className="iris-select bg-black border px-1 py-0.5 text-[var(--iris-phosphor)] border-[var(--iris-border)]"
                value={physicsMode}
                onChange={(e) => setFXConfig({ physicsMode: e.target.value as any })}
              >
                {PHYSICS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-black text-current">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Orb Snap Toggle */}
            <div className="flex items-center gap-2 pr-1">
              <span className="text-[var(--iris-phosphor)] font-bold uppercase">ORB SNAP</span>
              <button
                type="button"
                onClick={() => setFXConfig({ snapToCenter: !snapToCenter })}
                className={`iris-btn-toggle px-2 py-0.5 border ${
                  snapToCenter 
                    ? 'bg-[var(--iris-phosphor)] text-black border-[var(--iris-phosphor)]' 
                    : 'bg-black text-[var(--iris-phosphor)] border-[var(--iris-border)]'
                }`}
              >
                {snapToCenter ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          
          {/* Barra de nível reativa ao slider de Repulsão do Mouse */}
          {(() => {
            const totalBlocks = 15;
            const activeBlocks = Math.min(totalBlocks, Math.max(0, Math.round((repulsionStrength / 2.5) * totalBlocks)));
            const progressStr = '█'.repeat(activeBlocks) + '░'.repeat(totalBlocks - activeBlocks);
            return (
              <div className="flex items-center gap-2 mb-3 select-none text-[9px] font-mono">
                <span className="text-[var(--iris-phosphor-dim)] font-bold uppercase w-[110px]">REPULSION FORCE</span>
                <div className="flex items-center">
                  <span className="text-[var(--iris-phosphor)] border border-[var(--iris-border)] px-1.5 py-0.5 bg-black tracking-widest font-bold">
                    {progressStr}
                  </span>
                </div>
                <div className="flex-grow h-[1px] bg-[var(--iris-border)] opacity-20" />
              </div>
            );
          })()}

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
          {/* Row 1: GLOW BARRA (label) + toggle + slider (glowIntensityBars) + value */}
          <div className="flex items-center gap-2 mb-2 select-none text-[9px] font-mono">
            <span className="text-[var(--iris-phosphor)] font-bold w-[120px] uppercase">GLOW BARRA</span>
            <button
              type="button"
              className={`px-2 py-0.5 border text-[9px] w-10 text-center ${
                glowBarsEnabled 
                  ? 'bg-[var(--iris-phosphor)] text-black border-[var(--iris-phosphor)]' 
                  : 'bg-black text-[var(--iris-phosphor)] border-[var(--iris-border)]'
              }`}
              onClick={() => setFXConfig({ glowBarsEnabled: !glowBarsEnabled })}
            >
              {glowBarsEnabled ? 'ON' : 'OFF'}
            </button>
            <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
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
            <span className="iris-value text-right w-8">{glowIntensityBars.toFixed(2)}</span>
          </div>

          {/* Row 2: GLOW LINHA (label) + toggle + slider (glowIntensityLines) + value */}
          <div className="flex items-center gap-2 mb-2 select-none text-[9px] font-mono">
            <span className="text-[var(--iris-phosphor)] font-bold w-[120px] uppercase">GLOW LINHA</span>
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
            <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
            <span className="text-[var(--iris-phosphor)] font-bold mr-0.5">■</span>
            
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                className="iris-slider w-full"
                min={0}
                max={2.5}
                step={0.05}
                value={glowIntensityLines}
                disabled={!glowLinesEnabled}
                onChange={(e) => setFXConfig({ glowIntensityLines: parseFloat(e.target.value) })}
              />
            </div>
            <span className="text-[var(--iris-phosphor-dim)] font-bold ml-0.5">·</span>
            <span className="iris-value text-right w-8">{glowIntensityLines.toFixed(2)}</span>
          </div>

          {/* Row 3: PULSAÇÃO BARRA (label) + slider (barPulseSpeed) + value */}
          <div className="flex items-center gap-2 mb-2 select-none text-[9px] font-mono">
            <span className="text-[var(--iris-phosphor)] font-bold w-[168px] uppercase">PULSAÇÃO BARRA</span>
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

          {/* Row 4: PULSAÇÃO GLOW BARRA (label) + slider (barGlowPulseSpeed) + value */}
          <div className="flex items-center gap-2 mb-2 select-none text-[9px] font-mono">
            <span className="text-[var(--iris-phosphor)] font-bold w-[168px] uppercase">PULSAÇÃO GLOW BARRA</span>
            <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
            <span className="text-[var(--iris-phosphor)] font-bold mr-0.5">■</span>
            
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                className="iris-slider w-full"
                min={0}
                max={3}
                step={0.1}
                value={barGlowPulseSpeed}
                disabled={!glowBarsEnabled}
                onChange={(e) => setFXConfig({ barGlowPulseSpeed: parseFloat(e.target.value) })}
              />
            </div>
            <span className="text-[var(--iris-phosphor-dim)] font-bold ml-0.5">·</span>
            <span className="iris-value text-right w-8">{barGlowPulseSpeed.toFixed(2)}</span>
          </div>

          {/* Row 5: PULSAÇÃO GLOW LINHA (label) + slider (pulseSpeed) + value */}
          <div className="flex items-center gap-2 mb-2 select-none text-[9px] font-mono">
            <span className="text-[var(--iris-phosphor)] font-bold w-[168px] uppercase">PULSAÇÃO GLOW LINHA</span>
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

        <IrisSection title="SECTION 6 - ESTRELAS CUSTOMIZADAS">
          <button 
            type="button"
            className="iris-btn w-full mb-4 text-[10px] py-1 border border-[var(--iris-border)] text-[var(--iris-phosphor)] hover:bg-[var(--iris-phosphor)] hover:text-black transition-colors"
            onClick={addCustomStar}
          >
            + ADICIONAR ESTRELA
          </button>
          
          {customStars.map((star) => (
            <div key={star.id} className="mb-4 border border-[var(--iris-border)] p-2 bg-black/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-mono text-[var(--iris-phosphor)] font-bold">ESTRELA [{star.id.split('-').pop()?.slice(-4)}]</span>
                <button 
                  type="button"
                  className="iris-btn py-0.5 px-2 text-[8px] border border-[var(--iris-border)] text-[var(--iris-phosphor)] hover:bg-[var(--iris-phosphor)] hover:text-black transition-colors"
                  onClick={() => removeCustomStar(star.id)}
                >
                  REMOVER
                </button>
              </div>
              
              {[
                { label: 'X', field: 'x', min: -5, max: 5, step: 0.1 },
                { label: 'Y', field: 'y', min: -5, max: 5, step: 0.1 },
                { label: 'Z', field: 'z', min: -10, max: 2, step: 0.1 },
                { label: 'LUZ', field: 'intensity', min: 0, max: 20, step: 0.5 },
                { label: 'TAM', field: 'size', min: 0.01, max: 0.3, step: 0.01 },
                { label: 'H. TAM', field: 'haloSize', min: 1.0, max: 20.0, step: 0.5 },
                { label: 'H. INT', field: 'haloIntensity', min: 0, max: 1, step: 0.05 },
              ].map((ctrl) => (
                <div key={ctrl.field} className="flex items-center gap-2 mb-1 select-none text-[8px] font-mono">
                  <span className="text-[var(--iris-phosphor)] w-[24px] uppercase">{ctrl.label}</span>
                  <input
                    type="range"
                    className="iris-slider flex-1"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step}
                    value={star[ctrl.field as keyof typeof star]}
                    onChange={(e) => updateCustomStar(star.id, { [ctrl.field]: parseFloat(e.target.value) })}
                  />
                  <span className="iris-value text-right w-6">{(star[ctrl.field as keyof typeof star] as number).toFixed(1)}</span>
                </div>
              ))}
            </div>
          ))}
        </IrisSection>

        <footer className="sticky bottom-0 py-2 mt-6 text-[9px] border-t border-[var(--iris-border)] bg-black font-mono font-bold text-center">
          SCROLL // ALL SYSTEMS NOMINAL
        </footer>
      </aside>
    </div>
  );
}
