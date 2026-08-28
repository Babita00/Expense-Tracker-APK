import type { Category } from '../../types';

/** All-time spending recorded against a single category. */
export interface CategoryUsage {
  count: number;
  total: number;
}

/** Usage keyed by category id. A category with no expenses is simply absent. */
export type CategoryUsageMap = ReadonlyMap<string, CategoryUsage>;

/** The editable part of a category - exactly what the sheet collects. */
export interface CategoryFormValues {
  name: string;
  icon: string;
}

/**
 * What the one category sheet is open on.
 *
 * A single nullable value rather than a `isCreatingCategory` / `editingCategory`
 * pair, so "creating and editing at the same time" cannot be represented, and
 * closing the sheet is one assignment instead of two.
 */
export type CategorySheetState =
  | { mode: 'create' }
  | { mode: 'edit'; category: Category };
