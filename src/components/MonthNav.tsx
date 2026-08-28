import { useMemo, useState } from 'react';
import {
  MAX_BS_YEAR, MIN_BS_YEAR, MONTHS, MONTHS_NP, addMonths, availableYears, formatMonth, todayBs,
} from '../lib/nepaliDate';
import { ChevronLeft, ChevronRight } from './Icons';
import { Sheet } from './Sheet';

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

/** The single filter row that scopes everything below it. */
export function MonthNav({ year, month, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => todayBs(), []);

  const step = (delta: number) => {
    const next = addMonths({ year, month, day: 1 }, delta);
    onChange(next.year, next.month);
  };

  const atStart = year === MIN_BS_YEAR && month === 0;
  const atEnd = year === MAX_BS_YEAR && month === 11;
  const isThisMonth = year === today.year && month === today.month;

  return (
    <>
      <div className="filterbar">
        <div className="monthnav">
          <button className="icon-btn" onClick={() => step(-1)} disabled={atStart} aria-label="Previous month">
            <ChevronLeft />
          </button>
          <button className="monthnav-label" onClick={() => setOpen(true)}>
            {formatMonth(year, month)}
          </button>
          <button className="icon-btn" onClick={() => step(1)} disabled={atEnd} aria-label="Next month">
            <ChevronRight />
          </button>
        </div>

        {!isThisMonth && (
          <button className="btn btn-sm" onClick={() => onChange(today.year, today.month)}>
            This month
          </button>
        )}
      </div>

      <Sheet open={open} title="Jump to month" onClose={() => setOpen(false)}>
        <MonthYearPicker
          year={year}
          month={month}
          onPick={(y, m) => {
            onChange(y, m);
            setOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}

function MonthYearPicker({
  year, month, onPick,
}: {
  year: number;
  month: number;
  onPick: (year: number, month: number) => void;
}) {
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {MONTHS.map((name, index) => {
          const selected = viewYear === year && index === month;
          const isCurrent = viewYear === today.year && index === today.month;

          return (
            <button
              key={name}
              type="button"
              className="cat-chip"
              aria-pressed={selected}
              onClick={() => onPick(viewYear, index)}
              style={{ padding: '13px 6px' }}
            >
              <span className="name" style={{ fontSize: 13.5, fontWeight: selected ? 650 : 560 }}>
                {name}
              </span>
              <span className="name" style={{ fontSize: 11 }}>
                {MONTHS_NP[index]}{isCurrent ? ' ·' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
