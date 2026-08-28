export type ChartView = 'chart' | 'table';

interface ViewToggleProps {
  view: ChartView;
  onChange: (view: ChartView) => void;
  /** Names the chart in the group label, e.g. "category chart". */
  label: string;
}

/** Chart / table switch - every chart in the app carries the same numbers. */
export function ViewToggle({ view, onChange, label }: ViewToggleProps) {
  return (
    <div className="viewtoggle" role="group" aria-label={`View ${label} as`}>
      <button aria-pressed={view === 'chart'} onClick={() => onChange('chart')}>Chart</button>
      <button aria-pressed={view === 'table'} onClick={() => onChange('table')}>Table</button>
    </div>
  );
}
