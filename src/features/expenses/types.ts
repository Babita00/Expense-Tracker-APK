import type { BsDate, Expense } from '../../types';

/**
 * The slice of the ledger the screen is showing. One value rather than a
 * `mode` plus a `day` that is meaningless half the time.
 */
export type ExpenseScope =
  | { mode: 'month'; year: number; month: number }
  | { mode: 'day'; date: BsDate };

/** What the expense sheet is open on: a new entry, or the one being edited. */
export type ExpenseSheetState =
  | { mode: 'create'; date?: BsDate }
  | { mode: 'edit'; expense: Expense };
