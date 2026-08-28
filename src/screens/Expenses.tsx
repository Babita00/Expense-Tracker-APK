import { useMemo, useState } from 'react';
import type { BsDate, Expense } from '../types';
import { useApp } from '../store';
import { byDay, inMonth, onDay, sum } from '../lib/analytics';
import { formatBs, formatMonth, formatRelative, todayBs, toKey } from '../lib/nepaliDate';
import { rs } from '../lib/money';
import { MonthNav } from '../components/MonthNav';
import { NepaliDateField } from '../components/NepaliDatePicker';
import { ExpenseRows } from '../components/ExpenseRows';

type Mode = 'month' | 'day';

interface Props {
  year: number;
  month: number;
  onChangeMonth: (year: number, month: number) => void;
  categoryFilter: string;
  onChangeCategory: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

export function Expenses({
  year, month, onChangeMonth, categoryFilter, onChangeCategory, onEdit,
}: Props) {
  const { expenses, categories } = useApp();
  const [mode, setMode] = useState<Mode>('month');
  const [day, setDay] = useState<BsDate>(() => todayBs());

  const marked = useMemo(() => new Set(expenses.map((e) => e.date)), [expenses]);

  // Scope: month or single day, then the category chip.
  const scoped = useMemo(() => {
    const base = mode === 'day' ? onDay(expenses, day) : inMonth(expenses, year, month);
    return categoryFilter ? base.filter((e) => e.categoryId === categoryFilter) : base;
  }, [expenses, mode, day, year, month, categoryFilter]);

  const groups = useMemo(() => byDay(scoped), [scoped]);
  const total = useMemo(() => sum(scoped), [scoped]);

  // Only offer chips for categories that appear in the current period, plus
  // whatever is already selected, so the row stays short and relevant.
  const chipCategories = useMemo(() => {
    const period = mode === 'day' ? onDay(expenses, day) : inMonth(expenses, year, month);
    const used = new Set(period.map((e) => e.categoryId));
    if (categoryFilter) used.add(categoryFilter);
    return categories.filter((c) => used.has(c.id));
  }, [expenses, categories, mode, day, year, month, categoryFilter]);

  const scopeLabel = mode === 'day' ? formatRelative(day) : formatMonth(year, month);

  return (
    <div className="screen">
      <header className="topbar">
        <div className="topbar-row">
          <div style={{ minWidth: 0 }}>
            <h1 className="screen-title">Expenses</h1>
            <p className="screen-sub">
              {scoped.length} {scoped.length === 1 ? 'entry' : 'entries'} · {rs(total)}
            </p>
          </div>
          <div className="viewtoggle" role="group" aria-label="Filter period">
            <button aria-pressed={mode === 'month'} onClick={() => setMode('month')}>Month</button>
            <button aria-pressed={mode === 'day'} onClick={() => setMode('day')}>Day</button>
          </div>
        </div>
      </header>

      {mode === 'month' ? (
        <MonthNav year={year} month={month} onChange={onChangeMonth} />
      ) : (
        <div style={{ padding: '2px 0 12px' }}>
          <NepaliDateField value={day} onChange={setDay} marked={marked} label="Pick a day" />
        </div>
      )}

      {chipCategories.length > 0 && (
        <div className="chiprow">
          <button
            className="chip"
            aria-pressed={categoryFilter === ''}
            onClick={() => onChangeCategory('')}
          >
            All
          </button>
          {chipCategories.map((category) => (
            <button
              key={category.id}
              className="chip"
              aria-pressed={categoryFilter === category.id}
              onClick={() => onChangeCategory(categoryFilter === category.id ? '' : category.id)}
            >
              <span aria-hidden="true">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      )}

      {mode === 'day' && (
        <div className="card" style={{ padding: '13px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <p className="tile-label">Total spent</p>
              <p className="card-note" style={{ marginTop: 2 }}>{formatBs(day)}</p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 650, letterSpacing: '-0.02em' }}>{rs(total)}</p>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="empty">
          <div className="glyph" aria-hidden="true">🧾</div>
          <h3>Nothing here yet</h3>
          <p>
            {categoryFilter
              ? `No spending in this category during ${scopeLabel}.`
              : `No expenses recorded for ${scopeLabel}.`}
            <br />Tap + to add one.
          </p>
        </div>
      ) : (
        <ExpenseRows
          groups={groups}
          onEdit={onEdit}
          showDayHeaders={mode === 'month'}
        />
      )}

      {mode === 'day' && groups.length > 0 && (
        <p className="card-note" style={{ textAlign: 'center', paddingTop: 4 }}>
          {toKey(day)} BS
        </p>
      )}
    </div>
  );
}
