import { MONTHS_NP, monthKey } from '../../lib/nepaliDate';
import { useDashboardData } from './hooks/useDashboardData';
import { MonthHero } from './components/MonthHero';
import { MonthStatTiles } from './components/MonthStatTiles';
import { CategoryBars } from './components/CategoryBars';
import { MonthColumns } from './components/MonthColumns';
import { MonthNav } from '../../components/MonthNav';

interface DashboardPageProps {
  year: number;
  month: number;
  onChangeMonth: (year: number, month: number) => void;
  onDrillCategory: (categoryId: string) => void;
}

export function DashboardPage({
  year, month, onChangeMonth, onDrillCategory,
}: DashboardPageProps) {
  const { summary, trend } = useDashboardData(year, month);

  return (
    <div className="screen">
      <header className="topbar">
        <div className="topbar-row">
          <div className="topbar-heading">
            <h1 className="screen-title">Dashboard</h1>
            <p className="screen-sub">{MONTHS_NP[month]} {year}</p>
          </div>
        </div>
      </header>

      <MonthNav year={year} month={month} onChange={onChangeMonth} />

      <MonthHero summary={summary} />
      <MonthStatTiles summary={summary} />

      <p className="section-label">Where the money went</p>
      <CategoryBars
        rows={summary.categoryTotals}
        total={summary.total}
        onSelect={onDrillCategory}
      />

      <p className="section-label">Trend</p>
      <MonthColumns
        series={trend}
        currentKey={monthKey(year, month)}
        onSelect={onChangeMonth}
      />
    </div>
  );
}
