import type { DayGroup } from '../../../lib/analytics';
import type { Expense } from '../../../types';
import { useApp } from '../../../store';
import { UNKNOWN_CATEGORY } from '../../../lib/storage';
import { WEEKDAYS_LONG, formatBs, formatRelative, weekdayOf } from '../../../lib/nepaliDate';
import { rs } from '../../../lib/money';

interface ExpenseRowsProps {
  groups: DayGroup[];
  onEdit: (expense: Expense) => void;
  /** Hide the per-day header when the list is already scoped to one day. */
  showDayHeaders?: boolean;
}

export function ExpenseRows({ groups, onEdit, showDayHeaders = true }: ExpenseRowsProps) {
  const { categoryById } = useApp();

  return (
    <>
      {groups.map((group) => {
        const relative = formatRelative(group.date);
        const absolute = formatBs(group.date);

        return (
          <section className="daygroup" key={group.key}>
            {showDayHeaders && (
              <header className="daygroup-head">
                <h3 className="daygroup-date">
                  {relative}
                  <span className="weekday">
                    {relative === absolute
                      ? WEEKDAYS_LONG[weekdayOf(group.date)]
                      : absolute}
                  </span>
                </h3>
                <span className="daygroup-total">{rs(group.total)}</span>
              </header>
            )}

            <ul className="rows">
              {group.expenses.map((expense) => {
                const category = categoryById.get(expense.categoryId) ?? UNKNOWN_CATEGORY;

                return (
                  <li key={expense.id}>
                    <button className="row" onClick={() => onEdit(expense)}>
                      <span className="cat-avatar" aria-hidden="true">{category.icon}</span>
                      <span className="row-main">
                        <span className="row-title">{category.name}</span>
                        {expense.description && (
                          <span className="row-sub">{expense.description}</span>
                        )}
                      </span>
                      <span className="row-amount">{rs(expense.amount)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
