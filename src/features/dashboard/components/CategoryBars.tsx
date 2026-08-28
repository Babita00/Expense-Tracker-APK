import { useState } from 'react';
import type { CategoryTotal } from '../../../lib/analytics';
import type { ChartView } from '../../../components/ViewToggle';
import { num, rs, share } from '../../../lib/money';
import { countOf } from '../../../lib/text';
import { ViewToggle } from '../../../components/ViewToggle';

interface CategoryBarsProps {
  rows: CategoryTotal[];
  total: number;
  /** Clicking a bar drills into that category. */
  onSelect?: (categoryId: string) => void;
}

/**
 * Spending by category - a ranked horizontal bar chart.
 *
 * One series, so one colour for every bar: the categories are told apart by
 * their label and icon, never by hue. Values are direct-labelled at the tip,
 * and the same numbers are available in the table view.
 */
export function CategoryBars({ rows, total, onSelect }: CategoryBarsProps) {
  const [view, setView] = useState<ChartView>('chart');

  const max = rows.length > 0 ? rows[0].total : 0;

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Spending by category</h3>
          <p className="card-note">{countOf(rows.length, 'category', 'categories')} used</p>
        </div>
        <ViewToggle view={view} onChange={setView} label="category chart" />
      </div>

      {rows.length === 0 ? (
        <p className="chart-empty">No spending recorded for this month.</p>
      ) : view === 'chart' ? (
        <div className="hbar-list">
          {rows.map((row) => {
            const pct = share(row.total, total);
            const width = max > 0 ? (row.total / max) * 100 : 0;

            return (
              <button
                key={row.category.id}
                type="button"
                className="hbar-row"
                onClick={() => onSelect?.(row.category.id)}
                title={`${row.category.name}: ${rs(row.total)} across ${countOf(row.count, 'entry', 'entries')} (${pct.toFixed(1)}% of the month)`}
              >
                <span className="hbar-head">
                  <span className="hbar-name">
                    <span aria-hidden="true">{row.category.icon}</span>
                    <span className="label">{row.category.name}</span>
                  </span>
                  <span className="hbar-value">
                    {rs(row.total)}
                    <span className="hbar-share">{pct.toFixed(0)}%</span>
                  </span>
                </span>
                <span className="hbar-track">
                  <span className="hbar-fill" style={{ width: `${Math.max(width, 1)}%` }} />
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <table className="dtable">
          <thead>
            <tr>
              <th>Category</th>
              <th className="num">Entries</th>
              <th className="num">Rs.</th>
              <th className="num">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.category.id}>
                <td>{row.category.icon} {row.category.name}</td>
                <td className="num">{row.count}</td>
                <td className="num">{num(row.total)}</td>
                <td className="num">{share(row.total, total).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td className="num">{rows.reduce((acc, r) => acc + r.count, 0)}</td>
              <td className="num">{num(total)}</td>
              <td className="num">100%</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
