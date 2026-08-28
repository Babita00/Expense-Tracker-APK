import type { MonthSummary } from '../types';
import { formatMonth } from '../../../lib/nepaliDate';
import { rs, rsCompact } from '../../../lib/money';

/** The one figure the screen exists for, and how it compares to last month. */
export function MonthHero({ summary }: { summary: MonthSummary }) {
  const { period, total, previousPeriod, previousTotal, changePercent } = summary;
  const isUp = changePercent !== null && changePercent >= 0;

  return (
    <div className="card">
      <div className="hero">
        <p className="hero-label">Total spent in {formatMonth(period.year, period.month)}</p>
        <p className="hero-value">{rs(total)}</p>

        <div className="hero-delta">
          {changePercent === null ? (
            <span>
              {total > 0
                ? 'First month with any spending'
                : 'No spending last month to compare'}
            </span>
          ) : (
            <>
              <span className={`delta-pill ${isUp ? 'is-up' : 'is-down'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(changePercent).toFixed(0)}%
              </span>
              <span>
                vs {formatMonth(previousPeriod.year, previousPeriod.month)} ({rsCompact(previousTotal)})
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
