import type { Category, Expense } from '../../../types';
import type { CategoryUsage, CategoryUsageMap } from '../types';
import { rs } from '../../../lib/money';
import { countOf } from '../../../lib/text';

export const DEFAULT_CATEGORY_ICON = '📌';

/** Matches the length the store truncates a saved name to. */
export const MAX_CATEGORY_NAME_LENGTH = 40;

const NO_USAGE: CategoryUsage = { count: 0, total: 0 };

/**
 * All-time entry count and spend per category, so the list can show which
 * categories actually earn their place.
 */
export function getCategoryUsage(expenses: Expense[]): CategoryUsageMap {
  const usage = new Map<string, CategoryUsage>();

  for (const expense of expenses) {
    const row = usage.get(expense.categoryId) ?? { count: 0, total: 0 };
    row.count += 1;
    row.total += expense.amount;
    usage.set(expense.categoryId, row);
  }

  return usage;
}

/** Usage for one category, with an unused category reading as zeroes. */
export function usageOf(usage: CategoryUsageMap, categoryId: string): CategoryUsage {
  return usage.get(categoryId) ?? NO_USAGE;
}

/**
 * Display order for the category list. The rules, applied in sequence:
 *
 *   1. categories with entries come before categories with none, so the screen
 *      opens on what is actually in use;
 *   2. more spent first - the question the screen answers is where money goes;
 *   3. more entries first, which separates two categories that tie on amount;
 *   4. name A-Z, so the never-used tail has a findable order rather than
 *      whatever order the categories happened to be created in.
 *
 * Returns a new array; the input is left untouched.
 */
export function sortCategories(
  categories: Category[],
  usage: CategoryUsageMap,
): Category[] {
  return [...categories].sort((a, b) => {
    const left = usageOf(usage, a.id);
    const right = usageOf(usage, b.id);

    if ((left.count > 0) !== (right.count > 0)) return left.count > 0 ? -1 : 1;

    return right.total - left.total
      || right.count - left.count
      || a.name.localeCompare(b.name);
  });
}

/** The row subtitle: what the category has cost, or that it is unused. */
export function describeUsage(usage: CategoryUsage): string {
  if (usage.count === 0) return 'not used yet';
  return `${countOf(usage.count, 'entry', 'entries')} · ${rs(usage.total)}`;
}

/** Names are compared trimmed and case-insensitively: "Food" is "food". */
function nameKey(name: string): string {
  return name.trim().toLocaleLowerCase();
}

/**
 * The category already using `name`, if any. `excludeId` is the category being
 * edited - renaming "Food" to "Food" is not a clash with itself.
 */
export function findCategoryByName(
  name: string,
  categories: Category[],
  excludeId?: string,
): Category | undefined {
  const key = nameKey(name);
  if (key === '') return undefined;
  return categories.find((c) => c.id !== excludeId && nameKey(c.name) === key);
}

/**
 * The error to show for a name, or null when it is fine to save. Duplicates
 * are rejected here rather than merged, because two categories with the same
 * name split a total that the user reads as one number.
 */
export function validateCategoryName(
  name: string,
  categories: Category[],
  excludeId?: string,
): string | null {
  if (name.trim() === '') return 'Give the category a name';

  const clash = findCategoryByName(name, categories, excludeId);
  if (clash) return `${clash.name} already exists - pick another name`;

  return null;
}
