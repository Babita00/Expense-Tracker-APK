import { useMemo, useState } from 'react';
import { MONTHS, MONTHS_NP, availableYears, todayBs } from '../lib/nepaliDate';

interface MonthYearPickerProps {
  year: number;
  month: number;
  onPick: (year: number, month: number) => void;
}

/** Year dropdown plus a month grid - the contents of the jump-to-month sheet. */
export function MonthYearPicker({ year, month, onPick }: MonthYearPickerProps) {
  const [viewYear, setViewYear] = useState(year);
  const years = useMemo(() => availableYears(), []);
  const today = useMemo(() => todayBs(), []);

  return (
    <div>
      <div className="field">
        <label className="field-label" htmlFor="year-select">Nepali year</label>
        <select
          id="year-select"
          className="select"
          value={viewYear}
          onChange={(e) => setViewYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}{y === today.year ? ' · current' : ''}
            </option>
          ))}
        </select>
      </div>

      <span className="field-label">Month</span>
      <div className="month-grid">
        {MONTHS.map((name, index) => {
          const isSelected = viewYear === year && index === month;
          const isCurrent = viewYear === today.year && index === today.month;

          return (
            <button
              key={name}
              type="button"
              className="cat-chip"
              aria-pressed={isSelected}
              onClick={() => onPick(viewYear, index)}
            >
              <span className="name">{name}</span>
              <span className="name is-alt">
                {MONTHS_NP[index]}{isCurrent ? ' ·' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
