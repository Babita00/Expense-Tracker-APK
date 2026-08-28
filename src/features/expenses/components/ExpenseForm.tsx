import { useMemo, useState } from 'react';
import type { BsDate } from '../../../types';
import type { NewExpense } from '../../../store';
import type { ExpenseSheetState } from '../types';
import { useApp } from '../../../store';
import { fromKey, toKey, todayBs } from '../../../lib/nepaliDate';
import { parseAmount, rs } from '../../../lib/money';
import { datesWithExpenses } from '../utils/expense.utils';
import { NepaliDateField } from '../../../components/NepaliDatePicker';
import { Sheet } from '../../../components/Sheet';
import { TrashIcon } from '../../../components/Icons';

interface ExpenseFormProps {
  /** What the sheet is open on. Determines every initial value below. */
  state: ExpenseSheetState;
  onClose: () => void;
}

/** The date a freshly opened form starts on. */
function initialDate(state: ExpenseSheetState): BsDate {
  return state.mode === 'edit' ? fromKey(state.expense.date) : state.date ?? todayBs();
}

/**
 * The add/edit expense sheet.
 *
 * The caller mounts this only while the sheet is open and keys it by subject,
 * so the fields are plain `useState` initialisers - a cancelled edit can never
 * leak its values into the next entry.
 */
export function ExpenseForm({ state, onClose }: ExpenseFormProps) {
  const { categories, expenses, addExpense, updateExpense, deleteExpense, toast } = useApp();
  const editingExpense = state.mode === 'edit' ? state.expense : null;

  const [amount, setAmount] = useState(() => (editingExpense ? String(editingExpense.amount) : ''));
  const [date, setDate] = useState<BsDate>(() => initialDate(state));
  const [categoryId, setCategoryId] = useState(() => editingExpense?.categoryId ?? '');
  const [description, setDescription] = useState(() => editingExpense?.description ?? '');
  const [isTouched, setIsTouched] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Days that already have entries get a dot in the calendar.
  const markedDates = useMemo(() => datesWithExpenses(expenses), [expenses]);

  const parsedAmount = parseAmount(amount);
  const amountError = isTouched && parsedAmount === null
    ? amount.trim() === '' ? 'Enter an amount' : 'Enter a valid amount above zero'
    : null;
  const categoryError = isTouched && !categoryId ? 'Pick a category' : null;
  const canSave = parsedAmount !== null && categoryId !== '';

  const submit = () => {
    setIsTouched(true);
    if (parsedAmount === null || !categoryId) return;

    const payload: NewExpense = {
      amount: parsedAmount,
      date: toKey(date),
      categoryId,
      description: description.trim(),
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
      toast(`Updated · ${rs(parsedAmount)}`);
    } else {
      addExpense(payload);
      toast(`Added ${rs(parsedAmount)}`);
    }
    onClose();
  };

  const remove = () => {
    if (!editingExpense) return;
    deleteExpense(editingExpense.id);
    toast('Expense deleted');
    onClose();
  };

  return (
    <Sheet
      open
      title={editingExpense ? 'Edit expense' : 'Add expense'}
      onClose={onClose}
      footer={
        isConfirmingDelete ? (
          <>
            <button className="btn btn-block" onClick={() => setIsConfirmingDelete(false)}>
              Keep it
            </button>
            <button className="btn btn-critical btn-block" onClick={remove}>
              Delete
            </button>
          </>
        ) : (
          <>
            {editingExpense && (
              <button
                className="btn btn-danger"
                onClick={() => setIsConfirmingDelete(true)}
                aria-label="Delete expense"
              >
                <TrashIcon />
              </button>
            )}
            <button
              className="btn btn-primary btn-block"
              onClick={submit}
              disabled={isTouched && !canSave}
            >
              {editingExpense ? 'Save changes' : 'Save expense'}
            </button>
          </>
        )
      }
    >
      {isConfirmingDelete && (
        <p className="sheet-note is-lead">
          Delete this {rs(editingExpense?.amount ?? 0)} expense? This cannot be undone.
        </p>
      )}

      <div className="field">
        <label className="field-label" htmlFor="amount">Amount</label>
        <div className="amount-wrap">
          <span className="amount-prefix">Rs.</span>
          <input
            id="amount"
            className="input input-amount"
            data-autofocus
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => setIsTouched(true)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            aria-invalid={amountError ? true : undefined}
          />
        </div>
        {amountError && <p className="field-error">{amountError}</p>}
      </div>

      <div className="field">
        <span className="field-label">Category</span>
        <div className="cat-grid">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="cat-chip"
              aria-pressed={categoryId === category.id}
              onClick={() => setCategoryId(category.id)}
            >
              <span className="emoji" aria-hidden="true">{category.icon}</span>
              <span className="name">{category.name}</span>
            </button>
          ))}
        </div>
        {categoryError && <p className="field-error">{categoryError}</p>}
      </div>

      <div className="field">
        <span className="field-label">Date</span>
        <NepaliDateField value={date} onChange={setDate} marked={markedDates} label="Pick a date" />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="note">
          Description <span className="optional">· optional</span>
        </label>
        <textarea
          id="note"
          className="textarea"
          placeholder="Lunch with friends"
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </Sheet>
  );
}
