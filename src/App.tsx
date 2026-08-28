import { useEffect, useState } from 'react';
import type { Expense, Screen } from './types';
import { useApp } from './store';
import { todayBs } from './lib/nepaliDate';
import { applyTheme, loadTheme } from './lib/theme';
import type { Theme } from './lib/theme';
import { Dashboard } from './screens/Dashboard';
import { Expenses } from './screens/Expenses';
import { Categories } from './screens/Categories';
import { Settings } from './screens/Settings';
import { ExpenseForm } from './components/ExpenseForm';
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
  const [period, setPeriod] = useState(() => {
    const t = todayBs();
    return { year: t.year, month: t.month };
  });
  const [categoryFilter, setCategoryFilter] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  useEffect(() => { applyTheme(theme); }, [theme]);

  const changeMonth = (year: number, month: number) => setPeriod({ year, month });

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setFormOpen(true);
  };

  const drillIntoCategory = (categoryId: string) => {
    setCategoryFilter(categoryId);
    setScreen('expenses');
  };

  return (
    <div className="app">
      {screen === 'dashboard' && (
        <Dashboard
          year={period.year}
          month={period.month}
          onChangeMonth={changeMonth}
          onDrillCategory={drillIntoCategory}
        />
      )}

      {screen === 'expenses' && (
        <Expenses
          year={period.year}
          month={period.month}
          onChangeMonth={changeMonth}
          categoryFilter={categoryFilter}
          onChangeCategory={setCategoryFilter}
          onEdit={openEdit}
        />
      )}

      {screen === 'categories' && <Categories />}

      {screen === 'settings' && <Settings theme={theme} onChangeTheme={setTheme} />}

      {screen !== 'settings' && (
        <button className="fab" onClick={openAdd} aria-label="Add expense">
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

      {/* Keyed so each open starts from a clean form rather than resetting
          itself in an effect. */}
      <ExpenseForm
        key={formOpen ? editing?.id ?? 'new' : 'closed'}
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
      />

      {toastMessage && (
        <div className="toast" role="status" aria-live="polite">{toastMessage}</div>
      )}
    </div>
  );
}
