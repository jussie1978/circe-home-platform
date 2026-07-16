import { FACTORY_PRESETS, applyPreset, saveUserPreset, loadUserPreset } from '../../config/irisPresets';
import { useIrisStore } from '../../store/irisStore';

export function PresetBar() {
  const currentStore = useIrisStore();
  
  const isActive = (presetSnapshot: any) => {
    // Check main characteristics to highlight matching preset
    return Object.keys(presetSnapshot).every(
      (key) => (currentStore as any)[key] === presetSnapshot[key]
    );
  };

  return (
    <div className="space-y-3 font-mono text-[9px]">
      <div className="flex gap-4 w-full">
        <button 
          type="button" 
          className="iris-btn flex-1 text-center truncate py-1.5 border border-[var(--iris-phosphor)] text-[var(--iris-phosphor)] bg-transparent" 
          onClick={() => loadUserPreset()}
        >
          [APLICAR PRESET USUÁRIO]
        </button>
        <button 
          type="button" 
          className="iris-btn flex-1 text-center truncate py-1.5 border border-[var(--iris-phosphor)] text-[var(--iris-phosphor)] bg-transparent" 
          onClick={() => saveUserPreset()}
        >
          [SALVAR PRESET USUÁRIO]
        </button>
      </div>

      <div className="flex items-center gap-2 select-none">
        <span className="text-[var(--iris-phosphor-dim)] font-bold">PRESETS:</span>
        <div className="flex gap-2 flex-wrap">
          {FACTORY_PRESETS.map((p) => {
            const active = isActive(p.snapshot);
            return (
              <button 
                key={p.id} 
                type="button" 
                className={`iris-btn py-0.5 px-3 border transition-colors ${
                  active 
                    ? 'bg-[var(--iris-phosphor)] text-black border-[var(--iris-phosphor)]' 
                    : 'bg-transparent text-[var(--iris-phosphor)] border-[var(--iris-border)]'
                }`}
                onClick={() => applyPreset(p.snapshot)}
              >
                {p.name.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
