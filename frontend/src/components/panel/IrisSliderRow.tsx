import { useIrisStore } from '../../store/irisStore';
import type { SliderFXKey } from '../../config/irisPanelParams';

type Props = {
  paramKey: SliderFXKey;
  label: string;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  accent?: 'cyan' | 'fuchsia';
};

export function IrisSliderRow({ paramKey, label, min, max, step, disabled, accent }: Props) {
  const value = useIrisStore((s) => s[paramKey]);
  const setFXConfig = useIrisStore((s) => s.setFXConfig);

  const accentColor = accent === 'cyan' ? 'var(--iris-cyan)' :
                      accent === 'fuchsia' ? 'var(--iris-fuchsia)' :
                      'var(--iris-phosphor)';

  const labelColor = accent === 'cyan' ? 'text-[var(--iris-cyan)]' :
                     accent === 'fuchsia' ? 'text-[var(--iris-fuchsia)]' :
                     'text-[var(--iris-phosphor)]';

  const dimColor = accent === 'cyan' ? 'rgba(0, 243, 255, 0.4)' :
                   accent === 'fuchsia' ? 'rgba(217, 70, 239, 0.4)' :
                   'var(--iris-phosphor-dim)';

  return (
    <div className={`flex items-center gap-2 mb-2 ${disabled ? 'opacity-30 pointer-events-none' : ''} text-[9px] font-mono`}>
      <span className={`${labelColor} font-bold flex-shrink-0 uppercase w-[180px] truncate`}>{label}</span>
      <span className="text-[var(--iris-phosphor-dim)] font-bold">·</span>
      <span style={{ color: accentColor }} className="font-bold mr-0.5">■</span>
      
      <div className="flex-1 relative flex items-center">
        <input
          type="range"
          className="iris-slider w-full"
          style={{ 
            background: dimColor,
            color: accentColor,
          }}
          data-accent={accent}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => setFXConfig({ [paramKey]: parseFloat(e.target.value) })}
        />
      </div>

      <span className="text-[var(--iris-phosphor-dim)] font-bold ml-0.5">·</span>
      <span style={{ color: accentColor }} className="iris-value text-right w-8">{value.toFixed(2)}</span>
    </div>
  );
}
