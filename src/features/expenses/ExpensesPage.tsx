import { useMemo, useState } from 'react';
import type { BsDate, Expense } from '../../types';
import type { ExpenseScope } from './types';
import type { ScopeMode } from './components/ScopeToggle';
import { todayBs, toKey } from '../../lib/nepaliDate';
import { rs } from '../../lib/money';
import { countOf } from '../../lib/text';
import { useScopedExpenses } from './hooks/useScopedExpenses';
import { ScopeToggle } from './components/ScopeToggle';
import { CategoryFilterChips } from './components/CategoryFilterChips';
import { DayTotalCard } from './components/DayTotalCard';
import { NoExpenses } from './components/NoExpenses';
import { ExpenseRows } from './components/ExpenseRows';
import { MonthNav } from '../../components/MonthNav';
import { NepaliDateField } from '../../components/NepaliDatePicker';

interface ExpensesPageProps {
  year: number;
  month: number;
  onChangeMonth: (year: number, month: number) => void;
  categoryFilter: string;
  onChangeCategory: (categoryId: string) => void;
  onEdit: (expense: Expense) => void;
}

export function ExpensesPage({
  year, month, onChangeMonth, categoryFilter, onChangeCategory, onEdit,
}: ExpensesPageProps) {
  const [scopeMode, setScopeMode] = useState<ScopeMode>('month');
  const [selectedDay, setSelectedDay] = useState<BsDate>(() => todayBs());

  const scope = useMemo<ExpenseScope>(
    () => (scopeMode === 'day'
      ? { mode: 'day', date: selectedDay }
      : { mode: 'month', year, month }),
    [scopeMode, selectedDay, year, month],
  );

  const {
    visibleExpenses, dayGroups, total, filterCategories, markedDates, scopeLabel,
  } = useScopedExpenses(scope, categoryFilter);

  const isDayScope = scope.mode === 'day';

  return (
    <div className="screen">
      <header className="topbar">
        <div className="topbar-row">
          <div className="topbar-heading">
            <h1 className="screen-title">Expenses</h1>
            <p className="screen-sub">
              {countOf(visibleExpenses.length, 'entry', 'entries')} · {rs(total)}
            </p>
          </div>
          <ScopeToggle mode={scopeMode} onChange={setScopeMode} />
        </div>
      </header>

      {isDayScope ? (
        <div className="daypicker">
          <NepaliDateField
            value={selectedDay}
            onChange={setSelectedDay}
            marked={markedDates}
            label="Pick a day"
          />
        </div>
      ) : (
        <MonthNav year={year} month={month} onChange={onChangeMonth} />
      )}

      <CategoryFilterChips
        categories={filterCategories}
        selectedId={categoryFilter}
        onSelect={onChangeCategory}
      />

      {isDayScope && <DayTotalCard date={selectedDay} total={total} />}

      {dayGroups.length === 0 ? (
        <NoExpenses scopeLabel={scopeLabel} isFiltered={categoryFilter !== ''} />
      ) : (
        <ExpenseRows groups={dayGroups} onEdit={onEdit} showDayHeaders={!isDayScope} />
      )}

      {isDayScope && dayGroups.length > 0 && (
        <p className="card-note is-centered">{toKey(selectedDay)} BS</p>
      )}
    </div>
  );
}
