export type ScopeMode = 'month' | 'day';

interface ScopeToggleProps {
  mode: ScopeMode;
  onChange: (mode: ScopeMode) => void;
}

/** Month / day switch for the expense list. */
export function ScopeToggle({ mode, onChange }: ScopeToggleProps) {
  return (
    <div className="viewtoggle" role="group" aria-label="Filter period">
      <button aria-pressed={mode === 'month'} onClick={() => onChange('month')}>Month</button>
      <button aria-pressed={mode === 'day'} onClick={() => onChange('day')}>Day</button>
    </div>
  );
}
