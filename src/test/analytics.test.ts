import { describe, expect, it } from 'vitest';
import type { Category, Expense } from '../types';
import { byCategory, byDay, inMonth, monthSeries, onDay, sum, yearsWithData } from '../lib/analytics';
import { compact, parseAmount, rs, share } from '../lib/money';
import { DEFAULT_CATEGORIES, normalise } from '../lib/storage';

const categories = new Map<string, Category>(DEFAULT_CATEGORIES.map((c) => [c.id, c]));

let seq = 0;
function expense(date: string, amount: number, categoryId: string, description = ''): Expense {
  seq += 1;
  return {
    id: `e${seq}`, amount, date, categoryId, description,
    createdAt: seq, updatedAt: seq,
  };
}

// The worked example from the spec: three entries on Bhadra 10, 2083.
const book: Expense[] = [
  expense('2083-05-10', 500, 'food', 'Lunch with friends'),
  expense('2083-05-10', 1200, 'dry-fruits', 'Almonds and cashews'),
  expense('2083-05-10', 300, 'ride-sharing', 'Pathao ride'),
  expense('2083-05-11', 800, 'food'),
  expense('2083-06-02', 2000, 'gym'),
  expense('2082-05-10', 999, 'food'),
];

describe('slicing', () => {
  it('filters to one BS month without bleeding into the next', () => {
    const bhadra = inMonth(book, 2083, 4);   // month index 4 -> "05" in the key
    expect(bhadra).toHaveLength(4);
    expect(sum(bhadra)).toBe(2800);
  });

  it('does not match the same month in a different year', () => {
    expect(inMonth(book, 2082, 4)).toHaveLength(1);
  });

  it('filters to a single day', () => {
    const day = onDay(book, { year: 2083, month: 4, day: 10 });
    expect(day).toHaveLength(3);
    expect(sum(day)).toBe(2000);   // the spec's "Total Spent Today: Rs. 2,000"
  });

  it('lists the years that hold data, newest first', () => {
    expect(yearsWithData(book)).toEqual([2083, 2082]);
  });
});

describe('aggregation', () => {
  it('ranks categories by spend, biggest first', () => {
    const rows = byCategory(inMonth(book, 2083, 4), categories);
    // Food wins the month on its two entries combined (500 + 800), even though
    // the single biggest entry is the 1,200 of dry fruits.
    expect(rows.map((r) => r.category.id)).toEqual(['food', 'dry-fruits', 'ride-sharing']);
    expect(rows[0].total).toBe(1300);
    expect(rows[1].total).toBe(1200);
  });

  it('counts entries per category', () => {
    const rows = byCategory(inMonth(book, 2083, 4), categories);
    expect(rows.find((r) => r.category.id === 'food')?.count).toBe(2);
  });

  it('falls back to a placeholder for an unknown category id', () => {
    const rows = byCategory([expense('2083-05-01', 10, 'ghost')], categories);
    expect(rows[0].category.name).toBe('Other');
  });

  it('groups days newest first with per-day totals', () => {
    const groups = byDay(inMonth(book, 2083, 4));
    expect(groups.map((g) => g.key)).toEqual(['2083-05-11', '2083-05-10']);
    expect(groups[1].total).toBe(2000);
    expect(groups[1].expenses).toHaveLength(3);
  });
});

describe('month series', () => {
  it('returns a contiguous run ending at the anchor, gaps included', () => {
    const series = monthSeries(book, { year: 2083, month: 5 }, 6);
    expect(series).toHaveLength(6);
    expect(series[series.length - 1].key).toBe('2083-06');
    expect(series[series.length - 1].total).toBe(2000);
    expect(series[series.length - 2].key).toBe('2083-05');
    expect(series[series.length - 2].total).toBe(2800);
    // A month with nothing recorded is present with a zero, not skipped.
    expect(series[0].total).toBe(0);
  });

  it('walks back across a year boundary', () => {
    const series = monthSeries(book, { year: 2084, month: 1 }, 4);
    expect(series.map((m) => m.key)).toEqual(['2083-11', '2083-12', '2084-01', '2084-02']);
  });
});

describe('money', () => {
  it('groups rupees the South Asian way', () => {
    expect(rs(24200)).toBe('Rs. 24,200');
    expect(rs(124200)).toBe('Rs. 1,24,200');
  });

  it('parses what a user might type', () => {
    expect(parseAmount('500')).toBe(500);
    expect(parseAmount('1,200')).toBe(1200);
    expect(parseAmount('99.5')).toBe(99.5);
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('-40')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('.')).toBeNull();
  });

  it('compacts for axis ticks', () => {
    expect(compact(940)).toBe('940');
    expect(compact(24200)).toBe('24K');
    expect(compact(124200)).toBe('1.2L');
  });

  it('guards a zero total when computing share', () => {
    expect(share(10, 0)).toBe(0);
    expect(share(25, 100)).toBe(25);
  });
});

describe('storage normalisation', () => {
  it('drops malformed expenses and keeps valid ones', () => {
    const data = normalise({
      expenses: [
        { id: 'a', amount: 100, date: '2083-05-10', categoryId: 'food', description: '' },
        { id: 'b', amount: -5, date: '2083-05-10', categoryId: 'food' },
        { id: 'c', amount: 100, date: 'not-a-date', categoryId: 'food' },
        null,
      ],
      categories: [],
    });
    expect(data.expenses).toHaveLength(1);
    expect(data.expenses[0].id).toBe('a');
  });

  it('restores the built-in categories even if a backup dropped them', () => {
    const data = normalise({ expenses: [], categories: [] });
    expect(data.categories).toHaveLength(DEFAULT_CATEGORIES.length);
  });

  it('reassigns an expense whose category no longer exists', () => {
    const data = normalise({
      expenses: [{ id: 'a', amount: 100, date: '2083-05-10', categoryId: 'gone' }],
      categories: [],
    });
    expect(data.expenses[0].categoryId).toBe('other');
  });

  it('survives complete garbage', () => {
    expect(normalise(null).expenses).toEqual([]);
    expect(normalise('nonsense').expenses).toEqual([]);
  });
});
