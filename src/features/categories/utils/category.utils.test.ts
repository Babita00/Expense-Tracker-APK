import { describe, expect, it } from 'vitest';
import type { Category, Expense } from '../../../types';
import {
  describeUsage, getCategoryUsage, sortCategories, usageOf, validateCategoryName,
} from './category.utils';

function category(id: string, name: string, custom = true): Category {
  return { id, name, icon: '📌', custom };
}

let seq = 0;
function expense(categoryId: string, amount: number): Expense {
  seq += 1;
  return {
    id: `e${seq}`, amount, date: '2083-05-10', categoryId, description: '',
    createdAt: seq, updatedAt: seq,
  };
}

const food = category('food', 'Food');
const gym = category('gym', 'Gym');
const travel = category('travel', 'Travel');
const books = category('books', 'Books');

describe('usage', () => {
  const expenses = [
    expense('food', 500),
    expense('food', 800),
    expense('gym', 1300),
  ];

  it('counts entries and totals per category', () => {
    const usage = getCategoryUsage(expenses);
    expect(usage.get('food')).toEqual({ count: 2, total: 1300 });
    expect(usage.get('gym')).toEqual({ count: 1, total: 1300 });
  });

  it('leaves an unused category out of the map, and reads it as zero', () => {
    const usage = getCategoryUsage(expenses);
    expect(usage.has('travel')).toBe(false);
    expect(usageOf(usage, 'travel')).toEqual({ count: 0, total: 0 });
  });

  it('describes usage for the row subtitle', () => {
    expect(describeUsage({ count: 0, total: 0 })).toBe('not used yet');
    expect(describeUsage({ count: 1, total: 500 })).toBe('1 entry · Rs. 500');
    expect(describeUsage({ count: 2, total: 1300 })).toBe('2 entries · Rs. 1,300');
  });
});

describe('sorting', () => {
  it('puts the biggest spend first and every unused category last', () => {
    const usage = getCategoryUsage([
      expense('gym', 1300),
      expense('food', 500),
    ]);

    const sorted = sortCategories([travel, food, gym, books], usage);
    expect(sorted.map((c) => c.id)).toEqual(['gym', 'food', 'books', 'travel']);
  });

  it('breaks a tie on money with the entry count', () => {
    const usage = getCategoryUsage([
      expense('food', 1000),
      expense('gym', 500),
      expense('gym', 500),
    ]);

    expect(sortCategories([food, gym], usage).map((c) => c.id)).toEqual(['gym', 'food']);
  });

  it('falls back to name order, so unused categories are findable', () => {
    const sorted = sortCategories([travel, gym, books, food], new Map());
    expect(sorted.map((c) => c.name)).toEqual(['Books', 'Food', 'Gym', 'Travel']);
  });

  it('leaves the input array untouched', () => {
    const input = [travel, food];
    sortCategories(input, getCategoryUsage([expense('food', 500)]));
    expect(input.map((c) => c.id)).toEqual(['travel', 'food']);
  });
});

describe('name validation', () => {
  const existing = [food, gym];

  it('rejects a blank name', () => {
    expect(validateCategoryName('', existing)).toBe('Give the category a name');
    expect(validateCategoryName('   ', existing)).toBe('Give the category a name');
  });

  it('rejects a duplicate, whatever its casing or padding', () => {
    expect(validateCategoryName('food', existing)).toMatch(/already exists/);
    expect(validateCategoryName('  FOOD  ', existing)).toMatch(/already exists/);
  });

  it('accepts a name nothing else is using', () => {
    expect(validateCategoryName('Momo runs', existing)).toBeNull();
  });

  it('does not count a category as a clash with itself', () => {
    expect(validateCategoryName('Food', existing, 'food')).toBeNull();
    expect(validateCategoryName('Gym', existing, 'food')).toMatch(/already exists/);
  });
});
