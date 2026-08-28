interface NoExpensesProps {
  /** The period being shown, e.g. "Bhadra 2083" or "Today". */
  scopeLabel: string;
  /** Whether a category filter is narrowing the list further. */
  isFiltered: boolean;
}

/** Empty state that says which period came up empty, not just "no data". */
export function NoExpenses({ scopeLabel, isFiltered }: NoExpensesProps) {
  return (
    <div className="empty">
      <div className="glyph" aria-hidden="true">🧾</div>
      <h3>Nothing here yet</h3>
      <p>
        {isFiltered
          ? `No spending in this category during ${scopeLabel}.`
          : `No expenses recorded for ${scopeLabel}.`}
        <br />Tap + to add one.
      </p>
    </div>
  );
}
