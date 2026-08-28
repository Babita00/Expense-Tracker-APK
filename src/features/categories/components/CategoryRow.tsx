import type { Category } from '../../../types';
import type { CategoryUsage } from '../types';
import { describeUsage } from '../utils/category.utils';
import { PencilIcon } from '../../../components/Icons';

interface CategoryRowProps {
  category: Category;
  usage: CategoryUsage;
  onEdit: (category: Category) => void;
}

/** One line of the category list: icon, name, what it has cost, edit. */
export function CategoryRow({ category, usage, onEdit }: CategoryRowProps) {
  return (
    <li>
      <div className="setrow">
        <span className="cat-avatar" aria-hidden="true">{category.icon}</span>
        <span className="setrow-main">
          <span className="setrow-title">{category.name}</span>
          <span className="setrow-sub">{describeUsage(usage)}</span>
        </span>
        {category.custom && <span className="badge">Custom</span>}
        <button
          className="icon-btn"
          onClick={() => onEdit(category)}
          aria-label={`Edit ${category.name}`}
        >
          <PencilIcon />
        </button>
      </div>
    </li>
  );
}
