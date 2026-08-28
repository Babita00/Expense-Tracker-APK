import type { AppData, Category, Expense } from '../types';

const KEY = 'nepali-expense-tracker/v1';
const VERSION = 1;

/** The starting category set. `custom: false` marks them as built-in. */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: '🍛', custom: false },
  { id: 'meat', name: 'Meat', icon: '🍗', custom: false },
  { id: 'dry-fruits', name: 'Dry Fruits', icon: '🥜', custom: false },
  { id: 'gym', name: 'Gym', icon: '🏋️', custom: false },
  { id: 'gym-clothes', name: 'Gym Clothes', icon: '🎽', custom: false },
  { id: 'clothes', name: 'Clothes', icon: '👕', custom: false },
  { id: 'ride-sharing', name: 'Ride Sharing', icon: '🛵', custom: false },
  { id: 'mobile-topup', name: 'Mobile Top-up', icon: '📱', custom: false },
  { id: 'festive', name: 'Festive Expenses', icon: '🎉', custom: false },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', custom: false },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', custom: false },
  { id: 'health', name: 'Health', icon: '💊', custom: false },
  { id: 'education', name: 'Education', icon: '📚', custom: false },
  { id: 'travel', name: 'Travel', icon: '✈️', custom: false },
  { id: 'other', name: 'Other', icon: '📌', custom: false },
];

/** Fallback so a deleted-but-still-referenced category never renders blank. */
export const UNKNOWN_CATEGORY: Category = {
  id: 'other',
  name: 'Other',
  icon: '📌',
  custom: false,
};

export function emptyData(): AppData {
  return { version: VERSION, expenses: [], categories: DEFAULT_CATEGORIES };
}

/* ------------------------------------------------------------------ *
 * load / save
 * ------------------------------------------------------------------ */

export function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyData();
    return normalise(JSON.parse(raw));
  } catch {
    // Corrupt or unreadable storage (private mode, cleared site data) must not
    // brick the app - fall back to an empty book rather than throwing.
    return emptyData();
  }
}

export function save(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Quota or blocked storage. Nothing useful to do here; the in-memory state
    // stays correct for the session.
  }
}

/* ------------------------------------------------------------------ *
 * validation - anything read back from disk or an import file goes through
 * here, so a hand-edited backup can never put the UI into a broken state.
 * ------------------------------------------------------------------ */

export function normalise(input: unknown): AppData {
  const raw = (input ?? {}) as Partial<AppData>;

  const categories: Category[] = Array.isArray(raw.categories)
    ? raw.categories.filter(isCategory).map((c) => ({
        id: String(c.id),
        name: String(c.name).slice(0, 40),
        icon: String(c.icon || '📌').slice(0, 8),
        custom: Boolean(c.custom),
      }))
    : [];

  // Always keep the built-ins present, even if a backup dropped them.
  const byId = new Map(categories.map((c) => [c.id, c]));
  for (const d of DEFAULT_CATEGORIES) if (!byId.has(d.id)) byId.set(d.id, d);

  const expenses: Expense[] = Array.isArray(raw.expenses)
    ? raw.expenses.filter(isExpense).map((e) => ({
        id: String(e.id),
        amount: Number(e.amount),
        date: String(e.date),
        categoryId: byId.has(String(e.categoryId)) ? String(e.categoryId) : 'other',
        description: String(e.description ?? '').slice(0, 200),
        createdAt: Number(e.createdAt) || 0,
        updatedAt: Number(e.updatedAt) || Number(e.createdAt) || 0,
      }))
    : [];

  return { version: VERSION, expenses, categories: [...byId.values()] };
}

function isCategory(c: unknown): c is Category {
  return !!c && typeof c === 'object' && typeof (c as Category).id === 'string'
    && typeof (c as Category).name === 'string';
}

function isExpense(e: unknown): e is Expense {
  if (!e || typeof e !== 'object') return false;
  const x = e as Expense;
  return typeof x.id === 'string'
    && Number.isFinite(Number(x.amount))
    && Number(x.amount) > 0
    && typeof x.date === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(x.date);
}

/* ------------------------------------------------------------------ *
 * backup - the only safety net for data that lives on one device
 * ------------------------------------------------------------------ */

export function toBackupJson(data: AppData): string {
  return JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2);
}

export function fromBackupJson(text: string): AppData {
  return normalise(JSON.parse(text));
}

/** Crypto-backed where available, with a plain fallback for old WebViews. */
export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
