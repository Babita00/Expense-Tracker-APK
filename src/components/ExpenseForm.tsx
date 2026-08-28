import { useMemo, useState } from 'react';
import type { BsDate, Expense } from '../types';
import { useApp } from '../store';
import { fromKey, toKey, todayBs } from '../lib/nepaliDate';
import { parseAmount, rs } from '../lib/money';
import { NepaliDateField } from './NepaliDatePicker';
import { Sheet } from './Sheet';
import { TrashIcon } from './Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  /** When set, the form edits this expense instead of creating a new one. */
  editing?: Expense | null;
  /** The date a new expense starts on. Defaults to today. */
  defaultDate?: BsDate;
}

export function ExpenseForm({ open, onClose, editing, defaultDate }: Props) {
  const { categories, expenses, addExpense, updateExpense, deleteExpense, toast } = useApp();

  // The caller remounts this component whenever the sheet opens on a
  // different subject, so plain initialisers are enough - a cancelled edit
  // can never leak its values into the next entry.
  const [amount, setAmount] = useState(() => (editing ? String(editing.amount) : ''));
  const [date, setDate] = useState<BsDate>(
    () => (editing ? fromKey(editing.date) : defaultDate ?? todayBs()),
  );
  const [categoryId, setCategoryId] = useState(() => editing?.categoryId ?? '');
  const [description, setDescription] = useState(() => editing?.description ?? '');
  const [touched, setTouched] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Days that already have entries get a dot in the calendar.
  const marked = useMemo(() => new Set(expenses.map((e) => e.date)), [expenses]);

  const parsed = parseAmount(amount);
  const amountError = touched && parsed === null
    ? amount.trim() === '' ? 'Enter an amount' : 'Enter a valid amount above zero'
    : null;
  const categoryError = touched && !categoryId ? 'Pick a category' : null;
  const canSave = parsed !== null && categoryId !== '';

  const submit = () => {
    setTouched(true);
    if (parsed === null || !categoryId) return;

    const payload = {
      amount: parsed,
      date: toKey(date),
      categoryId,
      description: description.trim(),
    };

    if (editing) {
      updateExpense(editing.id, payload);
      toast(`Updated · ${rs(parsed)}`);
    } else {
      addExpense(payload);
      toast(`Added ${rs(parsed)}`);
    }
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    deleteExpense(editing.id);
    toast('Expense deleted');
    onClose();
  };

  return (
    <Sheet
      open={open}
      title={editing ? 'Edit expense' : 'Add expense'}
      onClose={onClose}
      footer={
        confirmDelete ? (
          <>
            <button className="btn btn-block" onClick={() => setConfirmDelete(false)}>
              Keep it
            </button>
            <button className="btn btn-primary btn-block" style={{ background: 'var(--critical)' }} onClick={remove}>
              Delete
            </button>
          </>
        ) : (
          <>
            {editing && (
              <button
                className="btn btn-danger"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete expense"
              >
                <TrashIcon />
              </button>
            )}
            <button
              className="btn btn-primary btn-block"
              onClick={submit}
              disabled={touched && !canSave}
            >
              {editing ? 'Save changes' : 'Save expense'}
            </button>
          </>
        )
      }
    >
      {confirmDelete && (
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
          Delete this {rs(editing?.amount ?? 0)} expense? This cannot be undone.
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
            onBlur={() => setTouched(true)}
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
        <NepaliDateField value={date} onChange={setDate} marked={marked} label="Pick a date" />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="note">Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>· optional</span></label>
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
