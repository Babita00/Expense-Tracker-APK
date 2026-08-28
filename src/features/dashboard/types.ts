import type { Expense, MonthPeriod } from '../../types';
import type { CategoryTotal } from '../../lib/analytics';

/** Everything the dashboard reports about one month, derived in one pass. */
export interface MonthSummary {
  period: MonthPeriod;
  expenses: Expense[];
  entryCount: number;
  total: number;
  categoryTotals: CategoryTotal[];
  /** The biggest category, or null when nothing was recorded. */
  topCategory: CategoryTotal | null;
  /** Largest single expense; 0 when the month is empty. */
  biggestExpense: number;
  isCurrentMonth: boolean;
  /** Days counted for the average - elapsed so far in the current month. */
  daysElapsed: number;
  averagePerDay: number;
  previousPeriod: MonthPeriod;
  previousTotal: number;
  /** Change against the previous month, or null when there is nothing to compare. */
  changePercent: number | null;
}
