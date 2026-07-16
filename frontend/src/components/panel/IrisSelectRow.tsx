import { useIrisStore } from '../../store/irisStore';
import type { FXConfigPatch } from '../../store/irisStore';

type Props<K extends keyof FXConfigPatch> = {
  label: string;
  storeKey: K;
  options: readonly { value: FXConfigPatch[K] & string; label: string }[];
  passiveText?: string;
  accent?: 'cyan' | 'fuchsia';
};

export function IrisSelectRow<K extends keyof FXConfigPatch>({ label, storeKey, options, passiveText, accent }: Props<K>) {
  const value = useIrisStore((s) => s[storeKey]);
  const setFXConfig = useIrisStore((s) => s.setFXConfig);

  const accentClass = accent === 'cyan' ? 'text-[var(--iris-cyan)] border-[var(--iris-cyan)]' :
                      accent === 'fuchsia' ? 'text-[var(--iris-fuchsia)] border-[var(--iris-fuchsia)]' :
                      'text-[var(--iris-phosphor)] border-[var(--iris-border)]';

  const labelClass = accent === 'cyan' ? 'text-[var(--iris-cyan)]' :
                     accent === 'fuchsia' ? 'text-[var(--iris-fuchsia)]' :
                     'text-[var(--iris-phosphor)]';

  // Alinhamento horizontal do MODO do satélite
  const labelWidth = accent ? 'w-[180px]' : 'w-[60px]';

  return (
    <div className="flex items-center gap-2 mb-2 select-none text-[9px] font-mono">
      <span className={`${labelClass} font-bold flex-shrink-0 uppercase ${labelWidth}`}>{label}</span>
      
      {accent && (
        <span className={`${labelClass} font-bold mr-1`}>▼</span>
      )}

      <select
        className={`iris-select bg-black border px-1 py-0.5 ${accentClass}`}
        value={value as string}
        onChange={(e) => setFXConfig({ [storeKey]: e.target.value } as FXConfigPatch)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-black text-current">
            {o.label}
          </option>
        ))}
      </select>

      {passiveText && (
        <span className="text-[var(--iris-phosphor-dim)] ml-2">{passiveText}</span>
      )}
    </div>
  );
}
