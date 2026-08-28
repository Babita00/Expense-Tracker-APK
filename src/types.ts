/** A Bikram Sambat calendar date. `month` is 0-indexed (0 = Baishakh). */
export interface BsDate {
  year: number;
  month: number;
  day: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  /** false for the built-in defaults, which cannot be deleted while in use. */
  custom: boolean;
}

export interface Expense {
  id: string;
  /** Rupees. Stored as a plain number, rounded to 2dp on save. */
  amount: number;
  /** BS date, stored as "YYYY-MM-DD" with a 1-indexed month. */
  date: string;
  categoryId: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppData {
  version: number;
  expenses: Expense[];
  categories: Category[];
}

/** The Nepali month a screen is scoped to. `month` is 0-indexed. */
export interface MonthPeriod {
  year: number;
  month: number;
}

export type Screen = 'dashboard' | 'expenses' | 'categories' | 'settings';
