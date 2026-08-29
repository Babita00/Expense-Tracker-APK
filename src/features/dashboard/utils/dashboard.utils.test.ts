import { describe, expect, it } from 'vitest';
import type { BsDate, Category, Expense } from '../../../types';
import { DEFAULT_CATEGORIES } from '../../../lib/storage';
import { daysInMonth } from '../../../lib/nepaliDate';
import { buildMonthSummary, daysElapsedIn, previousPeriodOf } from './dashboard.utils';

const categoryById = new Map<string, Category>(DEFAULT_CATEGORIES.map((c) => [c.id, c]));

let seq = 0;
function expense(date: string, amount: number, categoryId: string): Expense {
  seq += 1;
  return {
    id: `e${seq}`, amount, date, categoryId, description: '',
    createdAt: seq, updatedAt: seq,
  };
}

// Bhadra 2083 is month index 4, which is "05" in a date key.
const BHADRA = { year: 2083, month: 4 };
const book: Expense[] = [
  expense('2083-05-10', 500, 'food'),
  expense('2083-05-10', 1200, 'dry-fruits'),
  expense('2083-05-11', 800, 'food'),
  expense('2083-04-20', 1000, 'food'),   // Shrawan, the previous month
  expense('2083-06-02', 9999, 'gym'),    // Ashoj, the next month
];

/** Mid-month "today", so the current-month branches are exercised. */
const midBhadra: BsDate = { year: 2083, month: 4, day: 10 };

describe('period arithmetic', () => {
  it('steps back a month, wrapping the year at Baishakh', () => {
    expect(previousPeriodOf(BHADRA)).toEqual({ year: 2083, month: 3 });
    expect(previousPeriodOf({ year: 2083, month: 0 })).toEqual({ year: 2082, month: 11 });
  });

  it('counts only elapsed days for the month in progress', () => {
    expect(daysElapsedIn(BHADRA, midBhadra)).toBe(10);
  });

  it('counts the whole month for a month that is over', () => {
    const past = { year: 2083, month: 3 };
    expect(daysElapsedIn(past, midBhadra)).toBe(daysInMonth(past.year, past.month));
  });
});

describe('month summary', () => {
  const summary = buildMonthSummary(book, categoryById, BHADRA, midBhadra);

  it('totals only the month asked for', () => {
    expect(summary.entryCount).toBe(3);
    expect(summary.total).toBe(2500);
  });

  it('ranks the categories and names the biggest', () => {
    expect(summary.topCategory?.category.id).toBe('food');   // 500 + 800 beats 1,200
    expect(summary.topCategory?.total).toBe(1300);
    expect(summary.categoryTotals).toHaveLength(2);
  });

  it('reports the largest single entry, which is not the top category', () => {
    expect(summary.biggestExpense).toBe(1200);
  });

  it('averages across elapsed days only, so a part-month is not flattered', () => {
    expect(summary.isCurrentMonth).toBe(true);
    expect(summary.daysElapsed).toBe(10);
    expect(summary.averagePerDay).toBe(250);   // 2,500 over 10 days
  });

  it('compares against the previous month', () => {
    expect(summary.previousPeriod).toEqual({ year: 2083, month: 3 });
    expect(summary.previousTotal).toBe(1000);
    expect(summary.changePercent).toBe(150);   // 1,000 -> 2,500
  });

  it('has no percentage to report when last month was empty', () => {
    const first = buildMonthSummary(
      [expense('2083-05-10', 500, 'food')], categoryById, BHADRA, midBhadra,
    );
    expect(first.changePercent).toBeNull();
  });

  it('reports zeroes for a month with nothing in it', () => {
    const empty = buildMonthSummary(book, categoryById, { year: 2081, month: 0 }, midBhadra);
    expect(empty.total).toBe(0);
    expect(empty.entryCount).toBe(0);
    expect(empty.topCategory).toBeNull();
    expect(empty.biggestExpense).toBe(0);
    expect(empty.averagePerDay).toBe(0);
  });
});
