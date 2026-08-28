import type { ReactNode } from 'react';

interface SettingsInfoRowProps {
  title: string;
  note: string;
}

/** A row that only reports something. */
export function SettingsInfoRow({ title, note }: SettingsInfoRowProps) {
  return (
    <li>
      <div className="setrow">
        <span className="setrow-main">
          <span className="setrow-title">{title}</span>
          <span className="setrow-sub">{note}</span>
        </span>
      </div>
    </li>
  );
}

interface SettingsActionRowProps {
  title: string;
  note: string;
  onClick: () => void;
  icon?: ReactNode;
  /** Destructive actions take the critical colour. */
  critical?: boolean;
}

/** A row that does something when tapped. */
export function SettingsActionRow({
  title, note, onClick, icon, critical = false,
}: SettingsActionRowProps) {
  return (
    <li>
      <button className="setrow" onClick={onClick}>
        {icon && <span className="cat-avatar sm" aria-hidden="true">{icon}</span>}
        <span className="setrow-main">
          <span className={`setrow-title${critical ? ' is-critical' : ''}`}>{title}</span>
          <span className="setrow-sub">{note}</span>
        </span>
      </button>
    </li>
  );
}
