import {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState,
} from 'react';
import type { ReactNode } from 'react';
import type { AppData, Category, Expense } from './types';
import { emptyData, load, newId, save } from './lib/storage';
import { round2 } from './lib/money';

/* ------------------------------------------------------------------ *
 * reducer
 * ------------------------------------------------------------------ */

export type NewExpense = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;

type Action =
  | { type: 'add-expense'; payload: NewExpense }
  | { type: 'update-expense'; id: string; payload: NewExpense }
  | { type: 'delete-expense'; id: string }
  | { type: 'add-category'; name: string; icon: string }
  | { type: 'update-category'; id: string; name: string; icon: string }
  | { type: 'delete-category'; id: string }
  | { type: 'replace'; data: AppData };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'add-expense': {
      const now = Date.now();
      const expense: Expense = {
        ...action.payload,
        amount: round2(action.payload.amount),
        id: newId(),
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, expenses: [...state.expenses, expense] };
    }

    case 'update-expense':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.id
            ? { ...e, ...action.payload, amount: round2(action.payload.amount), updatedAt: Date.now() }
            : e,
        ),
      };

    case 'delete-expense':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };

    case 'add-category': {
      const category: Category = {
        id: newId(),
        name: action.name.trim().slice(0, 40),
        icon: action.icon || '📌',
        custom: true,
      };
      return { ...state, categories: [...state.categories, category] };
    }

    case 'update-category':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.id ? { ...c, name: action.name.trim().slice(0, 40), icon: action.icon } : c,
        ),
      };

    case 'delete-category':
      // Expenses are never orphaned: anything filed under the removed category
      // moves to "Other" so no money silently disappears from the totals.
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
        expenses: state.expenses.map((e) =>
          e.categoryId === action.id ? { ...e, categoryId: 'other' } : e,
        ),
      };

    case 'replace':
      return action.data;

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ *
 * context
 * ------------------------------------------------------------------ */

interface Store {
  expenses: Expense[];
  categories: Category[];
  categoryById: Map<string, Category>;
  data: AppData;
  addExpense: (e: NewExpense) => void;
  updateExpense: (id: string, e: NewExpense) => void;
  deleteExpense: (id: string) => void;
  addCategory: (name: string, icon: string) => void;
  updateCategory: (id: string, name: string, icon: string) => void;
  deleteCategory: (id: string) => void;
  replaceAll: (data: AppData) => void;
  resetAll: () => void;
  toast: (message: string) => void;
  toastMessage: string | null;
}

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, load);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // Persist on every change. Cheap for a personal-scale dataset.
  useEffect(() => { save(data); }, [data]);

  const toast = useCallback((message: string) => {
    setToastMessage(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2600);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const categoryById = useMemo(
    () => new Map(data.categories.map((c) => [c.id, c])),
    [data.categories],
  );

  const value = useMemo<Store>(() => ({
    data,
    expenses: data.expenses,
    categories: data.categories,
    categoryById,
    addExpense: (e) => dispatch({ type: 'add-expense', payload: e }),
    updateExpense: (id, e) => dispatch({ type: 'update-expense', id, payload: e }),
    deleteExpense: (id) => dispatch({ type: 'delete-expense', id }),
    addCategory: (name, icon) => dispatch({ type: 'add-category', name, icon }),
    updateCategory: (id, name, icon) => dispatch({ type: 'update-category', id, name, icon }),
    deleteCategory: (id) => dispatch({ type: 'delete-category', id }),
    replaceAll: (next) => dispatch({ type: 'replace', data: next }),
    resetAll: () => dispatch({ type: 'replace', data: emptyData() }),
    toast,
    toastMessage,
  }), [data, categoryById, toast, toastMessage]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): Store {
  const store = useContext(Ctx);
  if (!store) throw new Error('useApp must be used inside <AppProvider>');
  return store;
}
