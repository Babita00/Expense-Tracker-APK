import type { Category } from '../../../types';

interface CategoryFilterChipsProps {
  categories: Category[];
  /** The selected category id, or '' for all. */
  selectedId: string;
  onSelect: (categoryId: string) => void;
}

/** The category filter row. Tapping the active chip clears the filter. */
export function CategoryFilterChips({
  categories, selectedId, onSelect,
}: CategoryFilterChipsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="chiprow">
      <button className="chip" aria-pressed={selectedId === ''} onClick={() => onSelect('')}>
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className="chip"
          aria-pressed={selectedId === category.id}
          onClick={() => onSelect(selectedId === category.id ? '' : category.id)}
        >
          <span aria-hidden="true">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
}
