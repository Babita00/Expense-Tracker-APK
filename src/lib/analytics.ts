import type { BsDate, Category, Expense } from '../types';
import { addMonths, fromKey, monthKey, monthKeyOf, toKey } from './nepaliDate';

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
}

export interface MonthTotal {
  key: string;      // "2083-05"
  year: number;
  month: number;    // 0-indexed
  total: number;
  count: number;
}

export interface DayGroup {
  key: string;      // "2083-05-12"
  date: BsDate;
  total: number;
  expenses: Expense[];
}

/* ------------------------------------------------------------------ *
 * slicing
 * ------------------------------------------------------------------ */

export function inMonth(expenses: Expense[], year: number, month: number): Expense[] {
  const key = monthKey(year, month);
  return expenses.filter((e) => monthKeyOf(e.date) === key);
}

export function onDay(expenses: Expense[], date: BsDate): Expense[] {
  const key = toKey(date);
  return expenses.filter((e) => e.date === key);
}

export function inYear(expenses: Expense[], year: number): Expense[] {
  const prefix = `${year}-`;
  return expenses.filter((e) => e.date.startsWith(prefix));
}

export function sum(expenses: Expense[]): number {
  return expenses.reduce((acc, e) => acc + e.amount, 0);
}

/* ------------------------------------------------------------------ *
 * aggregation
 * ------------------------------------------------------------------ */

/** Category totals, biggest first. Categories with no spend are dropped. */
export function byCategory(expenses: Expense[], categories: Map<string, Category>): CategoryTotal[] {
  const totals = new Map<string, { total: number; count: number }>();

  for (const e of expenses) {
    const row = totals.get(e.categoryId) ?? { total: 0, count: 0 };
    row.total += e.amount;
    row.count += 1;
    totals.set(e.categoryId, row);
  }

  return [...totals.entries()]
    .map(([id, row]) => ({
      category: categories.get(id) ?? { id, name: 'Other', icon: '📌', custom: false },
      total: row.total,
      count: row.count,
    }))
    .sort((a, b) => b.total - a.total || a.category.name.localeCompare(b.category.name));
}

/** Expenses grouped into days, newest day first, newest entry first within a day. */
export function byDay(expenses: Expense[]): DayGroup[] {
  const groups = new Map<string, Expense[]>();

  for (const e of expenses) {
    const list = groups.get(e.date);
    if (list) list.push(e);
    else groups.set(e.date, [e]);
  }

  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, list]) => ({
      key,
      date: fromKey(key),
      total: sum(list),
      expenses: [...list].sort((a, b) => b.createdAt - a.createdAt),
    }));
}

/**
 * A run of consecutive BS months ending at `anchor`, so the comparison chart
 * shows real gaps instead of silently skipping months with no spending.
 */
export function monthSeries(
  expenses: Expense[],
  anchor: { year: number; month: number },
  length: number,
): MonthTotal[] {
  const totals = new Map<string, { total: number; count: number }>();

  for (const e of expenses) {
    const key = monthKeyOf(e.date);
    const row = totals.get(key) ?? { total: 0, count: 0 };
    row.total += e.amount;
    row.count += 1;
    totals.set(key, row);
  }

  const series: MonthTotal[] = [];
  for (let i = length - 1; i >= 0; i--) {
    const m = addMonths({ ...anchor, day: 1 }, -i);
    const key = monthKey(m.year, m.month);
    const row = totals.get(key) ?? { total: 0, count: 0 };
    series.push({ key, year: m.year, month: m.month, total: row.total, count: row.count });
  }
  return series;
}

/** Every BS year that has at least one expense, newest first. */
export function yearsWithData(expenses: Expense[]): number[] {
  const set = new Set<number>();
  for (const e of expenses) set.add(Number(e.date.slice(0, 4)));
  return [...set].sort((a, b) => b - a);
}
