import type { BsDate, Category, Expense, MonthPeriod } from '../../../types';
import type { MonthSummary } from '../types';
import { byCategory, inMonth, sum } from '../../../lib/analytics';
import { addMonths, daysInMonth } from '../../../lib/nepaliDate';

/** How many months the comparison chart shows, including the current one. */
export const TREND_MONTHS = 6;

export function previousPeriodOf({ year, month }: MonthPeriod): MonthPeriod {
  const previous = addMonths({ year, month, day: 1 }, -1);
  return { year: previous.year, month: previous.month };
}

/**
 * Days the month has actually had. The current month counts only the days that
 * have elapsed, so a part-month average is not flattered by dividing by a full
 * month's length.
 */
export function daysElapsedIn(period: MonthPeriod, today: BsDate): number {
  const isCurrentMonth = period.year === today.year && period.month === today.month;
  return isCurrentMonth ? today.day : daysInMonth(period.year, period.month);
}

/**
 * Every figure the dashboard shows for one month.
 *
 * Pure: pass the same expenses, categories, period and date and you get the
 * same summary, which is what makes the numbers testable outside React.
 */
export function buildMonthSummary(
  expenses: Expense[],
  categoryById: Map<string, Category>,
  period: MonthPeriod,
  today: BsDate,
): MonthSummary {
  const monthExpenses = inMonth(expenses, period.year, period.month);
  const total = sum(monthExpenses);
  const categoryTotals = byCategory(monthExpenses, categoryById);

  const previousPeriod = previousPeriodOf(period);
  const previousTotal = sum(inMonth(expenses, previousPeriod.year, previousPeriod.month));

  const isCurrentMonth = period.year === today.year && period.month === today.month;
  const daysElapsed = daysElapsedIn(period, today);

  return {
    period,
    expenses: monthExpenses,
    entryCount: monthExpenses.length,
    total,
    categoryTotals,
    topCategory: categoryTotals[0] ?? null,
    biggestExpense: monthExpenses.reduce((max, e) => Math.max(max, e.amount), 0),
    isCurrentMonth,
    daysElapsed,
    averagePerDay: total > 0 ? total / Math.max(daysElapsed, 1) : 0,
    previousPeriod,
    previousTotal,
    // A month with no previous spending has no meaningful percentage change -
    // "up 100%" from zero would be noise, so the caller shows wording instead.
    changePercent: previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : null,
  };
}
