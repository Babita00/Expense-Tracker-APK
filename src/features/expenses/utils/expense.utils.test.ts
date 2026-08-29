import { describe, expect, it } from 'vitest';
import type { Expense } from '../../../types';
import type { ExpenseScope } from '../types';
import { DEFAULT_CATEGORIES } from '../../../lib/storage';
import {
  datesWithExpenses, describeScope, expensesInScope, filterByCategory, filterableCategories,
} from './expense.utils';

let seq = 0;
function expense(date: string, categoryId: string): Expense {
  seq += 1;
  return {
    id: `e${seq}`, amount: 100, date, categoryId, description: '',
    createdAt: seq, updatedAt: seq,
  };
}

const book = [
  expense('2083-05-10', 'food'),
  expense('2083-05-10', 'gym'),
  expense('2083-05-11', 'food'),
  expense('2083-06-01', 'travel'),
];

const monthScope: ExpenseScope = { mode: 'month', year: 2083, month: 4 };
const dayScope: ExpenseScope = { mode: 'day', date: { year: 2083, month: 4, day: 10 } };

describe('scoping', () => {
  it('slices to a month', () => {
    expect(expensesInScope(book, monthScope)).toHaveLength(3);
  });

  it('slices to a single day', () => {
    expect(expensesInScope(book, dayScope)).toHaveLength(2);
  });

  it('names the scope for headings and empty states', () => {
    expect(describeScope(monthScope)).toBe('Bhadra 2083');
    expect(describeScope(dayScope)).toMatch(/Bhadra 10, 2083|Today|Yesterday/);
  });
});

describe('category filtering', () => {
  it('treats an empty id as all categories', () => {
    expect(filterByCategory(book, '')).toHaveLength(4);
    expect(filterByCategory(book, 'food')).toHaveLength(2);
  });

  it('offers a chip only for categories used in the scope', () => {
    const scoped = expensesInScope(book, monthScope);
    const chips = filterableCategories(DEFAULT_CATEGORIES, scoped, '');
    expect(chips.map((c) => c.id).sort()).toEqual(['food', 'gym']);
  });

  it('keeps the selected chip when the scope no longer contains it', () => {
    // Drilling in from the dashboard and then stepping to an empty month must
    // not make the active filter vanish from under the user.
    const chips = filterableCategories(DEFAULT_CATEGORIES, [], 'travel');
    expect(chips.map((c) => c.id)).toEqual(['travel']);
  });
});

describe('calendar dots', () => {
  it('collects the distinct dates that have entries', () => {
    expect(datesWithExpenses(book)).toEqual(
      new Set(['2083-05-10', '2083-05-11', '2083-06-01']),
    );
  });
});
