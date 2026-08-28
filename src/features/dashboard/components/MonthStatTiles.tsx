import type { MonthSummary } from '../types';
import { rs } from '../../../lib/money';
import { countOf } from '../../../lib/text';

/** The four supporting numbers under the hero figure. */
export function MonthStatTiles({ summary }: { summary: MonthSummary }) {
  const {
    entryCount, topCategory, averagePerDay, biggestExpense, daysElapsed, isCurrentMonth,
  } = summary;

  const spread = `over ${countOf(daysElapsed, 'day', 'days')}${isCurrentMonth ? ' so far' : ''}`;

  return (
    <div className="tiles">
      <div className="tile">
        <p className="tile-label">Transactions</p>
        <p className="tile-value">{entryCount}</p>
        <p className="tile-sub">{spread}</p>
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
        <p className="tile-value">{rs(averagePerDay)}</p>
        <p className="tile-sub">{isCurrentMonth ? 'month to date' : 'across the month'}</p>
      </div>

      <div className="tile">
        <p className="tile-label">Biggest single expense</p>
        <p className="tile-value">{biggestExpense > 0 ? rs(biggestExpense) : '—'}</p>
        <p className="tile-sub">{biggestExpense > 0 ? 'one entry' : 'nothing recorded'}</p>
      </div>
    </div>
  );
}
