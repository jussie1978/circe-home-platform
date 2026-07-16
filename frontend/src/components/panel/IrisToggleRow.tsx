import { useIrisStore } from '../../store/irisStore';
import type { FXConfigPatch } from '../../store/irisStore';

type Props<K extends keyof FXConfigPatch> = {
  label: string;
  storeKey: K;
  passiveText?: string;
};

export function IrisToggleRow<K extends keyof FXConfigPatch>({ label, storeKey, passiveText }: Props<K>) {
  const checked = useIrisStore((s) => Boolean(s[storeKey]));
  const setFXConfig = useIrisStore((s) => s.setFXConfig);

  const toggle = () => {
    setFXConfig({ [storeKey]: !checked } as FXConfigPatch);
  };

  return (
    <div className="flex items-center gap-2 mb-2 select-none text-[9px] font-mono">
      <span className="text-[var(--iris-phosphor)] font-bold flex-shrink-0 uppercase w-[180px] truncate">{label}</span>
      
      <button
        type="button"
        onClick={toggle}
        className={`iris-btn-toggle px-2 py-0.5 border ${
          checked 
            ? 'bg-[var(--iris-phosphor)] text-black border-[var(--iris-phosphor)]' 
            : 'bg-black text-[var(--iris-phosphor)] border-[var(--iris-border)]'
        }`}
      >
        {checked ? 'ON' : 'OFF'}
      </button>

      {passiveText && (
        <span className="text-[var(--iris-phosphor-dim)] ml-2">{passiveText}</span>
      )}
    </div>
  );
}
