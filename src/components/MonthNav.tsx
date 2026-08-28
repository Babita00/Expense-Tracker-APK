import { useMemo, useState } from 'react';
import { MAX_BS_YEAR, MIN_BS_YEAR, addMonths, formatMonth, todayBs } from '../lib/nepaliDate';
import { ChevronLeft, ChevronRight } from './Icons';
import { MonthYearPicker } from './MonthYearPicker';
import { Sheet } from './Sheet';

interface MonthNavProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

/** The single filter row that scopes everything below it. */
export function MonthNav({ year, month, onChange }: MonthNavProps) {
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
