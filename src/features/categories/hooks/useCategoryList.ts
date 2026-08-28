import { useMemo } from 'react';
import type { Category } from '../../../types';
import type { CategoryUsageMap } from '../types';
import { useApp } from '../../../store';
import { getCategoryUsage, sortCategories } from '../utils/category.utils';

interface CategoryList {
  /** Every category, in display order. */
  sortedCategories: Category[];
  /** All-time usage, keyed by category id. */
  categoryUsage: CategoryUsageMap;
}

/**
 * Everything the categories screen renders from.
 *
 * The page reads this instead of the store directly, so it deals only in
 * ready-to-render values and the derived work stays memoised in one place.
 */
export function useCategoryList(): CategoryList {
  const { categories, expenses } = useApp();

  const categoryUsage = useMemo(() => getCategoryUsage(expenses), [expenses]);

  const sortedCategories = useMemo(
    () => sortCategories(categories, categoryUsage),
    [categories, categoryUsage],
  );

  return { sortedCategories, categoryUsage };
}
