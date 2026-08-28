import type { BsDate } from '../../../types';
import { formatBs } from '../../../lib/nepaliDate';
import { rs } from '../../../lib/money';

interface DayTotalCardProps {
  date: BsDate;
  total: number;
}

/** The single-day headline, shown when the list is scoped to one day. */
export function DayTotalCard({ date, total }: DayTotalCardProps) {
  return (
    <div className="card daytotal">
      <div className="daytotal-main">
        <p className="tile-label">Total spent</p>
        <p className="card-note">{formatBs(date)}</p>
      </div>
      <p className="daytotal-amount">{rs(total)}</p>
    </div>
  );
}
