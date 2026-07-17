import { useState, type ReactNode } from 'react';

type Props = { title: string; defaultOpen?: boolean; children: ReactNode };

export function IrisSection({ title, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mb-4">
      <button
        type="button"
        className="iris-section-title w-full text-left flex justify-between items-center transition-colors duration-200 font-mono font-bold text-[10px] tracking-wide"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{open ? 'v' : '>'} {title}</span>
        <span>{open ? 'v' : '>'}</span>
      </button>
      {open && <div className="mt-2.5 pl-1.5">{children}</div>}
    </section>
  );
}
