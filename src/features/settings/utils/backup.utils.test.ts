import { describe, expect, it } from 'vitest';
import type { AppData } from '../../../types';
import { DEFAULT_CATEGORIES, fromBackupJson, toBackupJson } from '../../../lib/storage';
import { backupFileName, summariseData } from './backup.utils';

const data: AppData = {
  version: 1,
  categories: [...DEFAULT_CATEGORIES, { id: 'momo', name: 'Momo runs', icon: '🥟', custom: true }],
  expenses: [
    { id: 'a', amount: 500, date: '2083-05-10', categoryId: 'food', description: '', createdAt: 1, updatedAt: 1 },
    { id: 'b', amount: 250.5, date: '2083-05-11', categoryId: 'momo', description: '', createdAt: 2, updatedAt: 2 },
  ],
};

describe('data summary', () => {
  it('counts entries, spend, and how many categories are custom', () => {
    expect(summariseData(data)).toEqual({
      expenseCount: 2,
      total: 750.5,
      categoryCount: DEFAULT_CATEGORIES.length + 1,
      customCategoryCount: 1,
    });
  });
});

describe('backup file', () => {
  it('names the file after the BS date, zero-padded', () => {
    // month is 0-indexed in BsDate, 1-indexed in the file name
    expect(backupFileName({ year: 2083, month: 4, day: 9 })).toBe('expenses-2083-05-09.json');
    expect(backupFileName({ year: 2083, month: 11, day: 30 })).toBe('expenses-2083-12-30.json');
  });

  it('survives an export and import round trip without losing anything', () => {
    const restored = fromBackupJson(toBackupJson(data));
    expect(restored.expenses).toEqual(data.expenses);
    expect(restored.categories).toEqual(data.categories);
  });
});
