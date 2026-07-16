// src/components/panel/ColorZoneCell.tsx
import { useIrisStore } from '../../store/irisStore';
import { COLOR_ZONE_LABELS } from '../../config/irisPanelParams';

type ZoneKey =
  | 'primaryColor' | 'secondaryColor' | 'tertiaryColor' | 'quaternaryColor'
  | 'quinaryColor' | 'senaryColor' | 'septenaryColor' | 'octonaryColor'
  | 'ringColorCustom';

type Props = {
  index: number;
  zoneKey: ZoneKey;
  isRing: boolean;
  active: boolean;
  onSelect: () => void;
  onDeselect?: () => void;
};

export function ColorZoneCell({ index, zoneKey, isRing, active, onSelect, onDeselect }: Props) {
  const color = useIrisStore((s) => s[zoneKey]);
  const enabled = useIrisStore((s) =>
    isRing ? true : (s.colorZonesEnabled[index] ?? true),
  );
  const setFXConfig = useIrisStore((s) => s.setFXConfig);
  const colorZonesEnabled = useIrisStore((s) => s.colorZonesEnabled);

  const label = isRing ? 'ANEL' : COLOR_ZONE_LABELS[index];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => enabled && onSelect()}
      onKeyDown={(e) => e.key === 'Enter' && enabled && onSelect()}
      className={`flex flex-col items-center p-1 border cursor-pointer ${
        active
          ? 'border-[var(--iris-phosphor)] bg-[rgba(26,107,56,0.15)]'
          : 'border-[var(--iris-border)] bg-transparent hover:border-[var(--iris-phosphor-dim)]'
      } ${!enabled ? 'opacity-25 pointer-events-none' : ''}`}
    >
      <span className="text-[8px] font-mono font-bold text-[var(--iris-phosphor-dim)]">{label}</span>
      <div
        className="w-3.5 h-3.5 mt-1 border border-black"
        style={{ backgroundColor: color }}
      />
      {!isRing && (
        <input
          type="checkbox"
          className="mt-1 accent-[var(--iris-phosphor)] cursor-pointer"
          checked={enabled}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const next = [...colorZonesEnabled];
            next[index] = e.target.checked;
            setFXConfig({ colorZonesEnabled: next });
            if (!e.target.checked && active && onDeselect) {
              onDeselect();
            }
          }}
        />
      )}
    </div>
  );
}
