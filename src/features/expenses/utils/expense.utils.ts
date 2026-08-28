import type { Category, Expense } from '../../../types';
import type { ExpenseScope } from '../types';
import { inMonth, onDay } from '../../../lib/analytics';
import { formatMonth, formatRelative } from '../../../lib/nepaliDate';

/** The expenses that fall inside the scope, before any category filter. */
export function expensesInScope(expenses: Expense[], scope: ExpenseScope): Expense[] {
  return scope.mode === 'day'
    ? onDay(expenses, scope.date)
    : inMonth(expenses, scope.year, scope.month);
}

/** An empty `categoryId` means "all categories", which is the default. */
export function filterByCategory(expenses: Expense[], categoryId: string): Expense[] {
  return categoryId ? expenses.filter((e) => e.categoryId === categoryId) : expenses;
}

/**
 * The categories worth offering as filter chips: the ones that appear in the
 * current scope, plus whatever is already selected, so the row stays short and
 * the active chip never vanishes from under the user.
 */
export function filterableCategories(
  categories: Category[],
  scopedExpenses: Expense[],
  selectedCategoryId: string,
): Category[] {
  const used = new Set(scopedExpenses.map((e) => e.categoryId));
  if (selectedCategoryId) used.add(selectedCategoryId);
  return categories.filter((c) => used.has(c.id));
}

/** Date keys that already have entries - the calendar dots them. */
export function datesWithExpenses(expenses: Expense[]): Set<string> {
  return new Set(expenses.map((e) => e.date));
}

/** How the scope is named in headings and empty states. */
export function describeScope(scope: ExpenseScope): string {
  return scope.mode === 'day'
    ? formatRelative(scope.date)
    : formatMonth(scope.year, scope.month);
}
