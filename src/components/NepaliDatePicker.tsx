import { useMemo, useState } from 'react';
import type { BsDate } from '../types';
import {
  MAX_BS_YEAR, MIN_BS_YEAR, MONTHS, MONTHS_NP, WEEKDAYS,
  addMonths, availableYears, compareBs, formatAd, formatBs, monthGrid, toKey, todayBs,
} from '../lib/nepaliDate';
import { CalendarIcon, ChevronLeft, ChevronRight } from './Icons';
import { Sheet } from './Sheet';

/* ------------------------------------------------------------------ *
 * the calendar grid
 * ------------------------------------------------------------------ */

interface CalendarProps {
  value: BsDate;
  onSelect: (date: BsDate) => void;
  /** Date keys ("2083-05-12") that already have expenses - shown with a dot. */
  marked?: Set<string>;
}

export function NepaliCalendar({ value, onSelect, marked }: CalendarProps) {
  const [view, setView] = useState({ year: value.year, month: value.month });
  const today = useMemo(() => todayBs(), []);

  const cells = useMemo(() => monthGrid(view.year, view.month), [view.year, view.month]);
  const years = useMemo(() => availableYears(), []);

  const step = (delta: number) => {
    const next = addMonths({ ...view, day: 1 }, delta);
    setView({ year: next.year, month: next.month });
  };

  const atStart = view.year === MIN_BS_YEAR && view.month === 0;
  const atEnd = view.year === MAX_BS_YEAR && view.month === 11;

  return (
    <div>
      <div className="cal-head">
        <button
          className="icon-btn"
          onClick={() => step(-1)}
          disabled={atStart}
          aria-label="Previous month"
        >
          <ChevronLeft />
        </button>

        <div className="cal-selects">
          <select
            className="select is-compact"
            value={view.month}
            onChange={(e) => setView((v) => ({ ...v, month: Number(e.target.value) }))}
            aria-label="Month"
          >
            {MONTHS.map((name, index) => (
              <option key={name} value={index}>{name}</option>
            ))}
          </select>
          <select
            className="select is-compact"
            value={view.year}
            onChange={(e) => setView((v) => ({ ...v, year: Number(e.target.value) }))}
            aria-label="Year"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <button
          className="icon-btn"
          onClick={() => step(1)}
          disabled={atEnd}
          aria-label="Next month"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="cal-grid" role="grid" aria-label={`${MONTHS[view.month]} ${view.year}`}>
        {WEEKDAYS.map((day) => (
          <div className="cal-dow" key={day}>{day}</div>
        ))}

        {cells.map((day, index) => {
          if (day === null) {
            return <div className="cal-day is-blank" key={`blank-${index}`} aria-hidden="true" />;
          }

          const date: BsDate = { year: view.year, month: view.month, day };
          const selected = compareBs(date, value) === 0;
          const isToday = compareBs(date, today) === 0;
          const future = compareBs(date, today) > 0;
          const hasData = marked?.has(toKey(date)) ?? false;

          const classes = [
            'cal-day',
            selected && 'is-selected',
            isToday && !selected && 'is-today',
            future && !selected && 'is-future',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={day}
              type="button"
              className={classes}
              onClick={() => onSelect(date)}
              aria-pressed={selected}
              aria-label={`${formatBs(date)}${hasData ? ', has expenses' : ''}`}
            >
              {day}
              {hasData ? <span className="dot" /> : <span className="dot-placeholder" />}
            </button>
          );
        })}
      </div>

      <div className="cal-foot">
        <span>{MONTHS_NP[view.month]} {view.year}</span>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => {
            setView({ year: today.year, month: today.month });
            onSelect(today);
          }}
        >
          Go to today
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * the field that opens it
 * ------------------------------------------------------------------ */

interface FieldProps {
  value: BsDate;
  onChange: (date: BsDate) => void;
  marked?: Set<string>;
  label?: string;
}

export function NepaliDateField({ value, onChange, marked, label = 'Date' }: FieldProps) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => todayBs(), []);
  const isToday = compareBs(value, today) === 0;

  return (
    <>
      <button type="button" className="datebtn" onClick={() => setOpen(true)}>
        <span className="datebtn-main">
          <span className="datebtn-date">
            {formatBs(value)}{isToday && <span className="datebtn-today"> · Today</span>}
          </span>
          <span className="ad">{formatAd(value)} AD</span>
        </span>
        <span className="datebtn-icon">
          <CalendarIcon />
        </span>
      </button>

      <Sheet open={open} title={label} onClose={() => setOpen(false)}>
        <NepaliCalendar
          value={value}
          marked={marked}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}
