import { useMemo } from 'react';
import type { Category, Expense } from '../../../types';
import type { DayGroup } from '../../../lib/analytics';
import type { ExpenseScope } from '../types';
import { useApp } from '../../../store';
import { byDay, sum } from '../../../lib/analytics';
import {
  datesWithExpenses, describeScope, expensesInScope, filterByCategory, filterableCategories,
} from '../utils/expense.utils';

interface ScopedExpenses {
  /** What the list shows: in scope and past the category filter. */
  visibleExpenses: Expense[];
  dayGroups: DayGroup[];
  total: number;
  /** Categories worth offering as filter chips for this scope. */
  filterCategories: Category[];
  /** Every date that has an entry, for the calendar's dots. */
  markedDates: Set<string>;
  scopeLabel: string;
}

/**
 * The expense list for one scope. The slicing rules live in `expense.utils`;
 * this binds them to the store and memoises each step.
 */
export function useScopedExpenses(
  scope: ExpenseScope,
  categoryFilter: string,
): ScopedExpenses {
  const { expenses, categories } = useApp();

  const scopedExpenses = useMemo(() => expensesInScope(expenses, scope), [expenses, scope]);

  const visibleExpenses = useMemo(
    () => filterByCategory(scopedExpenses, categoryFilter),
    [scopedExpenses, categoryFilter],
  );

  const dayGroups = useMemo(() => byDay(visibleExpenses), [visibleExpenses]);
  const total = useMemo(() => sum(visibleExpenses), [visibleExpenses]);

  const filterCategories = useMemo(
    () => filterableCategories(categories, scopedExpenses, categoryFilter),
    [categories, scopedExpenses, categoryFilter],
  );

  const markedDates = useMemo(() => datesWithExpenses(expenses), [expenses]);

  return {
    visibleExpenses,
    dayGroups,
    total,
    filterCategories,
    markedDates,
    scopeLabel: describeScope(scope),
  };
}
