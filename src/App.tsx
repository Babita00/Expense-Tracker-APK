import { useEffect, useState } from 'react';
import type { Expense, MonthPeriod, Screen } from './types';
import type { Theme } from './lib/theme';
import type { ExpenseSheetState } from './features/expenses/types';
import { useApp } from './store';
import { todayBs } from './lib/nepaliDate';
import { applyTheme, loadTheme } from './lib/theme';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ExpensesPage } from './features/expenses/ExpensesPage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ExpenseForm } from './features/expenses/components/ExpenseForm';
import { ChartIcon, GearIcon, ListIcon, PlusIcon, TagIcon } from './components/Icons';

const TABS: { id: Screen; label: string; Icon: typeof ChartIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: ChartIcon },
  { id: 'expenses', label: 'Expenses', Icon: ListIcon },
  { id: 'categories', label: 'Categories', Icon: TagIcon },
  { id: 'settings', label: 'Settings', Icon: GearIcon },
];

export default function App() {
  const { toastMessage } = useApp();

  const [screen, setScreen] = useState<Screen>('dashboard');
  const [theme, setTheme] = useState<Theme>(loadTheme);

  // The month filter is shared, so drilling from the dashboard into the
  // expense list keeps the period the user was already looking at.
  const [period, setPeriod] = useState<MonthPeriod>(() => {
    const today = todayBs();
    return { year: today.year, month: today.month };
  });
  const [categoryFilter, setCategoryFilter] = useState('');

  // One value for the expense sheet: what it is open on, or null for closed.
  const [expenseSheet, setExpenseSheet] = useState<ExpenseSheetState | null>(null);

  useEffect(() => { applyTheme(theme); }, [theme]);

  const changeMonth = (year: number, month: number) => setPeriod({ year, month });

  const drillIntoCategory = (categoryId: string) => {
    setCategoryFilter(categoryId);
    setScreen('expenses');
  };

  return (
    <div className="app">
      {screen === 'dashboard' && (
        <DashboardPage
          year={period.year}
          month={period.month}
          onChangeMonth={changeMonth}
          onDrillCategory={drillIntoCategory}
        />
      )}

      {screen === 'expenses' && (
        <ExpensesPage
          year={period.year}
          month={period.month}
          onChangeMonth={changeMonth}
          categoryFilter={categoryFilter}
          onChangeCategory={setCategoryFilter}
          onEdit={(expense: Expense) => setExpenseSheet({ mode: 'edit', expense })}
        />
      )}

      {screen === 'categories' && <CategoriesPage />}

      {screen === 'settings' && <SettingsPage theme={theme} onChangeTheme={setTheme} />}

      {screen !== 'settings' && (
        <button
          className="fab"
          onClick={() => setExpenseSheet({ mode: 'create' })}
          aria-label="Add expense"
        >
          <PlusIcon />
        </button>
      )}

      <nav className="nav" aria-label="Sections">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-item${screen === id ? ' is-active' : ''}`}
            onClick={() => setScreen(id)}
            aria-current={screen === id ? 'page' : undefined}
          >
            <Icon size={21} />
            {label}
          </button>
        ))}
      </nav>

      {/* Mounted only while open, and keyed by subject, so each open starts
          from a clean form rather than resetting itself. */}
      {expenseSheet && (
        <ExpenseForm
          key={expenseSheet.mode === 'edit' ? expenseSheet.expense.id : 'new'}
          state={expenseSheet}
          onClose={() => setExpenseSheet(null)}
        />
      )}

      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">{toastMessage}</div>
      )}
    </div>
  );
}
