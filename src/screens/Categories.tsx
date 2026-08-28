import { useMemo, useState } from 'react';
import type { Category } from '../types';
import { useApp } from '../store';
import { rs } from '../lib/money';
import { Sheet } from '../components/Sheet';
import { PencilIcon, PlusIcon } from '../components/Icons';

const EMOJI_CHOICES = [
  '🍛', '🍗', '🥜', '🍎', '☕', '🍺', '🏋️', '🎽', '👕', '👟',
  '🛵', '🚕', '🚌', '⛽', '📱', '💡', '🏠', '🎉', '🎬', '🎮',
  '🛍️', '💊', '🏥', '📚', '✏️', '✈️', '🏕️', '🎁', '💇', '🧾',
  '🐕', '👶', '💰', '📌',
];

export function Categories() {
  const { categories, expenses, addCategory, updateCategory, deleteCategory, toast } = useApp();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  // All-time usage, so the list shows which categories actually earn their place.
  const usage = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    for (const e of expenses) {
      const row = map.get(e.categoryId) ?? { count: 0, total: 0 };
      row.count += 1;
      row.total += e.amount;
      map.set(e.categoryId, row);
    }
    return map;
  }, [expenses]);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => (usage.get(b.id)?.total ?? 0) - (usage.get(a.id)?.total ?? 0)),
    [categories, usage],
  );

  return (
    <div className="screen">
      <header className="topbar">
        <div className="topbar-row">
          <div>
            <h1 className="screen-title">Categories</h1>
            <p className="screen-sub">{categories.length} categories · all-time totals</p>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => setCreating(true)}>
            <PlusIcon size={16} strokeWidth={2.4} /> New
          </button>
        </div>
      </header>

      <ul className="rows" style={{ marginTop: 12 }}>
        {sorted.map((category) => {
          const stats = usage.get(category.id);
          return (
            <li key={category.id}>
              <div className="setrow">
                <span className="cat-avatar" aria-hidden="true">{category.icon}</span>
                <span className="setrow-main">
                  <span className="setrow-title">{category.name}</span>
                  <span className="setrow-sub">
                    {stats
                      ? `${stats.count} ${stats.count === 1 ? 'entry' : 'entries'} · ${rs(stats.total)}`
                      : 'not used yet'}
                  </span>
                </span>
                {category.custom && <span className="badge">Custom</span>}
                <button
                  className="icon-btn"
                  onClick={() => setEditing(category)}
                  aria-label={`Edit ${category.name}`}
                >
                  <PencilIcon />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="card-note" style={{ padding: '14px 4px 0', lineHeight: 1.5 }}>
        Deleting a category moves its expenses to <strong>Other</strong> so no
        spending disappears from your totals.
      </p>

      <CategorySheet
        open={creating}
        title="New category"
        onClose={() => setCreating(false)}
        onSave={(name, icon) => {
          addCategory(name, icon);
          toast(`Added ${name}`);
          setCreating(false);
        }}
      />

      <CategorySheet
        open={editing !== null}
        title="Edit category"
        category={editing}
        onClose={() => setEditing(null)}
        onSave={(name, icon) => {
          if (editing) updateCategory(editing.id, name, icon);
          toast('Category updated');
          setEditing(null);
        }}
        onDelete={editing?.custom ? () => {
          const moved = usage.get(editing.id)?.count ?? 0;
          deleteCategory(editing.id);
          toast(moved > 0 ? `Deleted · ${moved} moved to Other` : 'Category deleted');
          setEditing(null);
        } : undefined}
        usageCount={editing ? usage.get(editing.id)?.count ?? 0 : 0}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface SheetProps {
  open: boolean;
  title: string;
  category?: Category | null;
  onClose: () => void;
  onSave: (name: string, icon: string) => void;
  onDelete?: () => void;
  usageCount?: number;
}

function CategorySheet({
  open, title, category, onClose, onSave, onDelete, usageCount = 0,
}: SheetProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📌');
  const [touched, setTouched] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [key, setKey] = useState('');

  // Re-seed the fields whenever the sheet opens on a different subject.
  const subject = `${open}:${category?.id ?? 'new'}`;
  if (key !== subject) {
    setKey(subject);
    setName(category?.name ?? '');
    setIcon(category?.icon ?? '📌');
    setTouched(false);
    setConfirmDelete(false);
  }

  const trimmed = name.trim();
  const error = touched && trimmed === '' ? 'Give the category a name' : null;

  const submit = () => {
    setTouched(true);
    if (trimmed === '') return;
    onSave(trimmed, icon);
  };

  return (
    <Sheet
      open={open}
      title={title}
      onClose={onClose}
      footer={
        confirmDelete ? (
          <>
            <button className="btn btn-block" onClick={() => setConfirmDelete(false)}>Keep it</button>
            <button
              className="btn btn-primary btn-block"
              style={{ background: 'var(--critical)' }}
              onClick={onDelete}
            >
              Delete
            </button>
          </>
        ) : (
          <>
            {onDelete && (
              <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
                Delete
              </button>
            )}
            <button className="btn btn-primary btn-block" onClick={submit}>
              {category ? 'Save changes' : 'Add category'}
            </button>
          </>
        )
      }
    >
      {confirmDelete ? (
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Delete <strong>{trimmed}</strong>?
          {usageCount > 0
            ? ` Its ${usageCount} ${usageCount === 1 ? 'expense' : 'expenses'} will move to Other.`
            : ' It has no expenses filed under it.'}
        </p>
      ) : (
        <>
          <div className="field">
            <label className="field-label" htmlFor="cat-name">Name</label>
            <input
              id="cat-name"
              className="input"
              type="text"
              maxLength={40}
              placeholder="e.g. Momo runs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            />
            {error && <p className="field-error">{error}</p>}
          </div>

          <div className="field">
            <span className="field-label">Icon</span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(46px, 1fr))',
              gap: 6,
            }}>
              {EMOJI_CHOICES.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className="cat-chip"
                  aria-pressed={icon === choice}
                  aria-label={`Icon ${choice}`}
                  onClick={() => setIcon(choice)}
                  style={{ padding: '9px 0' }}
                >
                  <span className="emoji" aria-hidden="true">{choice}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </Sheet>
  );
}
