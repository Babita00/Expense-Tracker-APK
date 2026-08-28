import { useMemo } from 'react';
import { useApp } from '../store';
import { byCategory, inMonth, monthSeries, sum } from '../lib/analytics';
import { MONTHS_NP, addMonths, daysInMonth, formatMonth, monthKey, todayBs } from '../lib/nepaliDate';
import { rs, rsCompact } from '../lib/money';
import { MonthNav } from '../components/MonthNav';
import { CategoryBars } from '../components/CategoryBars';
import { MonthColumns } from '../components/MonthColumns';

interface Props {
  year: number;
  month: number;
  onChangeMonth: (year: number, month: number) => void;
  onDrillCategory: (categoryId: string) => void;
}

export function Dashboard({ year, month, onChangeMonth, onDrillCategory }: Props) {
  const { expenses, categoryById } = useApp();
  const today = useMemo(() => todayBs(), []);

  const monthExpenses = useMemo(
    () => inMonth(expenses, year, month),
    [expenses, year, month],
  );

  const total = useMemo(() => sum(monthExpenses), [monthExpenses]);
  const categories = useMemo(
    () => byCategory(monthExpenses, categoryById),
    [monthExpenses, categoryById],
  );

  const previous = useMemo(() => {
    const p = addMonths({ year, month, day: 1 }, -1);
    return sum(inMonth(expenses, p.year, p.month));
  }, [expenses, year, month]);

  const series = useMemo(
    () => monthSeries(expenses, { year, month }, 6),
    [expenses, year, month],
  );

  // Average across the days that have actually elapsed, so the current month
  // is not flattered by dividing a part-month by its full length.
  const isCurrentMonth = year === today.year && month === today.month;
  const daysElapsed = isCurrentMonth ? today.day : daysInMonth(year, month);
  const perDay = total > 0 ? total / Math.max(daysElapsed, 1) : 0;

  const biggest = useMemo(
    () => monthExpenses.reduce<number>((max, e) => Math.max(max, e.amount), 0),
    [monthExpenses],
  );

  const changePct = previous > 0 ? ((total - previous) / previous) * 100 : null;
  const topCategory = categories[0];

  return (
    <div className="screen">
      <header className="topbar">
        <div className="topbar-row">
          <div>
            <h1 className="screen-title">Dashboard</h1>
            <p className="screen-sub">{MONTHS_NP[month]} {year}</p>
          </div>
        </div>
      </header>

      <MonthNav year={year} month={month} onChange={onChangeMonth} />

      <div className="card">
        <div className="hero">
          <p className="hero-label">Total spent in {formatMonth(year, month)}</p>
          <p className="hero-value">{rs(total)}</p>

          <div className="hero-delta">
            {changePct === null ? (
              <span>{previous === 0 && total > 0 ? 'First month with any spending' : 'No spending last month to compare'}</span>
            ) : (
              <>
                <span className={`delta-pill ${changePct >= 0 ? 'is-up' : 'is-down'}`}>
                  {changePct >= 0 ? '▲' : '▼'} {Math.abs(changePct).toFixed(0)}%
                </span>
                <span>vs {formatMonth(addMonths({ year, month, day: 1 }, -1).year, addMonths({ year, month, day: 1 }, -1).month)} ({rsCompact(previous)})</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="tiles">
        <div className="tile">
          <p className="tile-label">Transactions</p>
          <p className="tile-value">{monthExpenses.length}</p>
          <p className="tile-sub">
            {isCurrentMonth ? `over ${daysElapsed} days so far` : `over ${daysElapsed} days`}
          </p>
        </div>

        <div className="tile">
          <p className="tile-label">Highest category</p>
          <p className="tile-value">
            {topCategory ? `${topCategory.category.icon} ${topCategory.category.name}` : '—'}
          </p>
          <p className="tile-sub">{topCategory ? rs(topCategory.total) : 'nothing recorded'}</p>
        </div>

        <div className="tile">
          <p className="tile-label">Average per day</p>
          <p className="tile-value">{rs(perDay)}</p>
          <p className="tile-sub">{isCurrentMonth ? 'month to date' : 'across the month'}</p>
        </div>

        <div className="tile">
          <p className="tile-label">Biggest single expense</p>
          <p className="tile-value">{biggest > 0 ? rs(biggest) : '—'}</p>
          <p className="tile-sub">{biggest > 0 ? 'one entry' : 'nothing recorded'}</p>
        </div>
      </div>

      <p className="section-label">Where the money went</p>
      <CategoryBars rows={categories} total={total} onSelect={onDrillCategory} />

      <p className="section-label">Trend</p>
      <MonthColumns
        series={series}
        currentKey={monthKey(year, month)}
        onSelect={onChangeMonth}
      />
    </div>
  );
}
