import { useState } from 'react';
import type { CategoryFormValues, CategorySheetState } from './types';
import { useApp } from '../../store';
import { countOf } from '../../lib/text';
import { usageOf } from './utils/category.utils';
import { useCategoryList } from './hooks/useCategoryList';
import { CategoryRow } from './components/CategoryRow';
import { CategorySheet } from './components/CategorySheet';
import { PlusIcon } from '../../components/Icons';

export function CategoriesPage() {
  const { addCategory, updateCategory, deleteCategory, toast } = useApp();
  const { sortedCategories, categoryUsage } = useCategoryList();

  const [sheet, setSheet] = useState<CategorySheetState | null>(null);
  const editingCategory = sheet?.mode === 'edit' ? sheet.category : null;

  const closeSheet = () => setSheet(null);

  const saveCategory = ({ name, icon }: CategoryFormValues) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, name, icon);
      toast('Category updated');
    } else {
      addCategory(name, icon);
      toast(`Added ${name}`);
    }
    closeSheet();
  };

  const removeCategory = () => {
    if (!editingCategory) return;

    const movedCount = usageOf(categoryUsage, editingCategory.id).count;
    deleteCategory(editingCategory.id);
    toast(movedCount > 0 ? `Deleted · ${movedCount} moved to Other` : 'Category deleted');
    closeSheet();
  };

  return (
    <div className="screen">
      <header className="topbar">
        <div className="topbar-row">
          <div className="topbar-heading">
            <h1 className="screen-title">Categories</h1>
            <p className="screen-sub">
              {countOf(sortedCategories.length, 'category', 'categories')} · all-time totals
            </p>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => setSheet({ mode: 'create' })}>
            <PlusIcon size={16} strokeWidth={2.4} /> New
          </button>
        </div>
      </header>

      <ul className="rows is-spaced">
        {sortedCategories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            usage={usageOf(categoryUsage, category.id)}
            onEdit={(picked) => setSheet({ mode: 'edit', category: picked })}
          />
        ))}
      </ul>

      <p className="card-note is-block">
        Deleting a category moves its expenses to <strong>Other</strong> so no
        spending disappears from your totals.
      </p>

      {/* Mounted only while open, and keyed by subject, so the form starts from
          clean state every time rather than resetting itself mid-render. */}
      {sheet && (
        <CategorySheet
          key={sheet.mode === 'edit' ? sheet.category.id : 'new'}
          category={editingCategory}
          categories={sortedCategories}
          usageCount={editingCategory ? usageOf(categoryUsage, editingCategory.id).count : 0}
          onClose={closeSheet}
          onSave={saveCategory}
          onDelete={editingCategory?.custom ? removeCategory : undefined}
        />
      )}
    </div>
  );
}
