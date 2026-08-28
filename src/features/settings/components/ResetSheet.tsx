import { rs } from '../../../lib/money';
import { countOf } from '../../../lib/text';
import { Sheet } from '../../../components/Sheet';

interface ResetSheetProps {
  expenseCount: number;
  total: number;
  onClose: () => void;
  onConfirm: () => void;
}

/** Delete-everything confirmation. Names exactly what is about to be lost. */
export function ResetSheet({ expenseCount, total, onClose, onConfirm }: ResetSheetProps) {
  return (
    <Sheet
      open
      title="Delete all data"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-block" onClick={onClose}>Cancel</button>
          <button className="btn btn-critical btn-block" onClick={onConfirm}>
            Delete everything
          </button>
        </>
      }
    >
      <p className="sheet-note">
        This permanently removes <strong>{countOf(expenseCount, 'expense', 'expenses')}</strong> ({rs(total)})
        and any custom categories. It cannot be undone.
        <br /><br />
        Download a backup first if you might want this data again.
      </p>
    </Sheet>
  );
}
