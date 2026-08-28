import { useMemo } from 'react';
import type { MonthSummary } from '../types';
import type { MonthTotal } from '../../../lib/analytics';
import { useApp } from '../../../store';
import { monthSeries } from '../../../lib/analytics';
import { todayBs } from '../../../lib/nepaliDate';
import { TREND_MONTHS, buildMonthSummary } from '../utils/dashboard.utils';

interface DashboardData {
  summary: MonthSummary;
  /** Consecutive months ending at the selected one, for the trend chart. */
  trend: MonthTotal[];
}

/**
 * The dashboard's figures for one month. All of the arithmetic lives in
 * `dashboard.utils`; this only binds it to the store and memoises it.
 */
export function useDashboardData(year: number, month: number): DashboardData {
  const { expenses, categoryById } = useApp();

  // Fixed for the lifetime of the screen: "today" moving mid-session would
  // silently change what the averages mean.
  const today = useMemo(() => todayBs(), []);

  const summary = useMemo(
    () => buildMonthSummary(expenses, categoryById, { year, month }, today),
    [expenses, categoryById, year, month, today],
  );

  const trend = useMemo(
    () => monthSeries(expenses, { year, month }, TREND_MONTHS),
    [expenses, year, month],
  );

  return { summary, trend };
}
