import { useState } from 'react';
import type { Category } from '../../../types';
import type { CategoryFormValues } from '../types';
import {
  DEFAULT_CATEGORY_ICON, MAX_CATEGORY_NAME_LENGTH, validateCategoryName,
} from '../utils/category.utils';
import { countOf } from '../../../lib/text';
import { Sheet } from '../../../components/Sheet';
import { EmojiPicker } from './EmojiPicker';

interface CategorySheetProps {
  /** The category being edited, or null when creating a new one. */
  category: Category | null;
  /** Every existing category, so a duplicate name can be caught before saving. */
  categories: Category[];
  /** Expenses filed under the category being edited - what a delete would move. */
  usageCount: number;
  onClose: () => void;
  onSave: (values: CategoryFormValues) => void;
  /** Omitted when the category cannot be deleted, which hides the delete path. */
  onDelete?: () => void;
}

/**
 * The create/edit form for one category.
 *
 * The page mounts this only while the sheet is open and keys it by subject, so
 * the fields below are plain `useState` initialisers: there is no reset to keep
 * in sync, and a cancelled edit cannot leak into the next one.
 */
export function CategorySheet({
  category, categories, usageCount, onClose, onSave, onDelete,
}: CategorySheetProps) {
  const isEditing = category !== null;

  const [name, setName] = useState(() => category?.name ?? '');
  const [icon, setIcon] = useState(() => category?.icon ?? DEFAULT_CATEGORY_ICON);
  const [isTouched, setIsTouched] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Validate on every keystroke, but only show the message once the user has
  // committed to the field - an empty form should not open covered in red.
  const nameError = validateCategoryName(name, categories, category?.id);
  const visibleError = isTouched ? nameError : null;

  const submit = () => {
    setIsTouched(true);
    if (nameError) return;
    onSave({ name: name.trim(), icon });
  };

  return (
    <Sheet
      open
      title={isEditing ? 'Edit category' : 'New category'}
      onClose={onClose}
      footer={
        isConfirmingDelete ? (
          <>
            <button className="btn btn-block" onClick={() => setIsConfirmingDelete(false)}>
              Keep it
            </button>
            <button className="btn btn-critical btn-block" onClick={onDelete}>
              Delete
            </button>
          </>
        ) : (
          <>
            {onDelete && (
              <button className="btn btn-danger" onClick={() => setIsConfirmingDelete(true)}>
                Delete
              </button>
            )}
            <button className="btn btn-primary btn-block" onClick={submit}>
              {isEditing ? 'Save changes' : 'Add category'}
            </button>
          </>
        )
      }
    >
      {isConfirmingDelete ? (
        <p className="sheet-note">
          Delete <strong>{category?.name}</strong>?
          {usageCount > 0
            ? ` Its ${countOf(usageCount, 'expense', 'expenses')} will move to Other.`
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
              maxLength={MAX_CATEGORY_NAME_LENGTH}
              placeholder="e.g. Momo runs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setIsTouched(true)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              aria-invalid={visibleError ? true : undefined}
            />
            {visibleError && <p className="field-error">{visibleError}</p>}
          </div>

          <EmojiPicker value={icon} onChange={setIcon} />
        </>
      )}
    </Sheet>
  );
}
