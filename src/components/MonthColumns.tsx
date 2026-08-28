import { useState } from 'react';
import type { MonthTotal } from '../lib/analytics';
import { MONTHS } from '../lib/nepaliDate';
import { compact, num, rs } from '../lib/money';
import { ViewToggle } from './CategoryBars';

const PLOT_H = 148;   // drawable height for the bars, in px
const CAP_ROOM = 20;  // headroom so a direct label never clips off the top

interface Props {
  series: MonthTotal[];
  /** The month the dashboard is currently scoped to - emphasised, not recoloured. */
  currentKey: string;
  onSelect?: (year: number, month: number) => void;
}

/**
 * Month-over-month totals - a single-series column chart.
 *
 * Emphasis, not a value ramp: every column is the same hue, and only the
 * selected month is stepped up to the full-strength colour. Labels ride the
 * selected column and the biggest one; the rest are carried by the gridlines,
 * the hover title, and the table view.
 */
export function MonthColumns({ series, currentKey, onSelect }: Props) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const peak = Math.max(...series.map((m) => m.total), 0);
  const top = niceMax(peak);
  const maxKey = peak > 0 ? series.find((m) => m.total === peak)?.key : undefined;

  const ticks = [0, top / 2, top];
  const hasAny = peak > 0;

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Month comparison</h3>
          <p className="card-note" style={{ marginTop: 2 }}>
            Last {series.length} Nepali months
          </p>
        </div>
        <ViewToggle view={view} onChange={setView} label="month comparison" />
      </div>

      {!hasAny ? (
        <p className="chart-empty">Nothing recorded in these months yet.</p>
      ) : view === 'chart' ? (
        <div className="colchart">
          <div style={{ paddingLeft: 38 }}>
            <div className="col-grid" style={{ position: 'relative', paddingTop: CAP_ROOM }}>
              {ticks.map((value) => (
                <div
                  key={value}
                  className={`col-gridline${value === 0 ? ' is-base' : ''}`}
                  style={{ bottom: (value / top) * PLOT_H }}
                >
                  <span className="col-gridlabel">{compact(value)}</span>
                </div>
              ))}

              <div className="col-plot" style={{ height: PLOT_H }}>
                {series.map((month) => {
                  const isCurrent = month.key === currentKey;
                  const height = top > 0 ? (month.total / top) * PLOT_H : 0;
                  const showCap = isCurrent || month.key === maxKey;

                  return (
                    <button
                      key={month.key}
                      type="button"
                      className={[
                        'col-slot',
                        isCurrent && 'is-current',
                        month.total === 0 && 'is-empty',
                      ].filter(Boolean).join(' ')}
                      style={{ height: '100%' }}
                      onClick={() => onSelect?.(month.year, month.month)}
                      title={`${MONTHS[month.month]} ${month.year}: ${rs(month.total)} across ${month.count} ${month.count === 1 ? 'entry' : 'entries'}`}
                      aria-label={`${MONTHS[month.month]} ${month.year}, ${rs(month.total)}`}
                    >
                      {showCap && month.total > 0 && (
                        <span className="col-cap">{compact(month.total)}</span>
                      )}
                      <span className="col-bar" style={{ height: Math.max(height, 2) }} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-axis">
              {series.map((month) => (
                <span
                  key={month.key}
                  className={`col-tick${month.key === currentKey ? ' is-current' : ''}`}
                >
                  {MONTHS[month.month].slice(0, 3)}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <table className="dtable">
          <thead>
            <tr>
              <th>Month</th>
              <th className="num">Entries</th>
              <th className="num">Rs.</th>
            </tr>
          </thead>
          <tbody>
            {series.map((month) => (
              <tr key={month.key}>
                <td style={{ fontWeight: month.key === currentKey ? 650 : 400 }}>
                  {MONTHS[month.month]} {month.year}
                </td>
                <td className="num">{month.count}</td>
                <td className="num">{num(month.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td className="num">{series.reduce((acc, m) => acc + m.count, 0)}</td>
              <td className="num">{num(series.reduce((acc, m) => acc + m.total, 0))}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

/** Round an axis maximum up to a clean 1 / 2 / 2.5 / 5 x 10^n value. */
function niceMax(value: number): number {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const scaled = value / magnitude;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
  return step * magnitude;
}
