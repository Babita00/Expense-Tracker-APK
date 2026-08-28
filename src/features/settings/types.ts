/** What the "Your data" section reports about the book. */
export interface DataSummary {
  expenseCount: number;
  /** All-time spend across every expense. */
  total: number;
  categoryCount: number;
  customCategoryCount: number;
}
