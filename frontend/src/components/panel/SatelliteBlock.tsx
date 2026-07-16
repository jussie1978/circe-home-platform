import { IrisSelectRow } from './IrisSelectRow';
import { IrisSliderRow } from './IrisSliderRow';
import { SAT_MODE_OPTIONS, SLIDER_PARAMS } from '../../config/irisPanelParams';

type Props = {
  title: string;
  accentClass: 'sat-block--ciano' | 'sat-block--fucsia';
  modeKey: 'sat1Mode' | 'sat2Mode';
  section: 'sat1' | 'sat2';
};

export function SatelliteBlock({ title, accentClass, modeKey, section }: Props) {
  const accent = section === 'sat1' ? 'cyan' : 'fuchsia';
  const textClass = accent === 'cyan' ? 'text-[var(--iris-cyan)]' : 'text-[var(--iris-fuchsia)]';

  return (
    <div className={`${accentClass} mt-4 mb-2`}>
      <div className={`flex items-center gap-2 mb-2 font-mono font-bold text-[9px] ${textClass} uppercase select-none`}>
        <span className="bg-current w-2 h-2.5 inline-block shrink-0" />
        <span>{title}</span>
        <div className="flex-1 h-[1px] bg-current opacity-30" />
      </div>

      <IrisSelectRow
        label="MODO"
        storeKey={modeKey}
        options={SAT_MODE_OPTIONS}
        passiveText="MANUAL | GRAVITACIONAL | ORBITAL 3D ▼"
        accent={accent}
      />

      {SLIDER_PARAMS.filter((p) => p.section === section).map((p) => (
        <IrisSliderRow 
          key={p.key} 
          paramKey={p.key} 
          label={p.label} 
          min={p.min} 
          max={p.max} 
          step={p.step} 
          accent={accent} 
        />
      ))}
    </div>
  );
}
