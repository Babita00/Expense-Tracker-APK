import { useMemo, useState } from 'react';
import type { Theme } from '../../lib/theme';
import { useApp } from '../../store';
import { fromBackupJson } from '../../lib/storage';
import { formatAd, formatBs, todayBs } from '../../lib/nepaliDate';
import { rs } from '../../lib/money';
import { countOf } from '../../lib/text';
import { copyBackup, downloadBackup, summariseData } from './utils/backup.utils';
import { SettingsActionRow, SettingsInfoRow } from './components/SettingsRow';
import { ThemeChoice } from './components/ThemeChoice';
import { ImportSheet } from './components/ImportSheet';
import { ResetSheet } from './components/ResetSheet';
import { DownloadIcon, UploadIcon } from '../../components/Icons';

type SettingsSheet = 'import' | 'reset';

interface SettingsPageProps {
  theme: Theme;
  onChangeTheme: (theme: Theme) => void;
}

export function SettingsPage({ theme, onChangeTheme }: SettingsPageProps) {
  const { data, replaceAll, resetAll, toast } = useApp();
  const [sheet, setSheet] = useState<SettingsSheet | null>(null);

  const today = useMemo(() => todayBs(), []);
  const summary = useMemo(() => summariseData(data), [data]);

  const download = () => {
    try {
      downloadBackup(data, today);
      toast('Backup file saved');
    } catch {
      toast('Could not save the file - try copying instead');
    }
  };

  const copy = async () => {
    try {
      await copyBackup(data);
      toast('Backup copied to clipboard');
    } catch {
      toast('Clipboard blocked - use Download instead');
    }
  };

  const restore = (text: string): string | null => {
    let restored;
    try {
      restored = fromBackupJson(text);
    } catch {
      return 'That does not look like a valid backup file.';
    }

    replaceAll(restored);
    setSheet(null);
    toast(`Restored ${countOf(restored.expenses.length, 'expense', 'expenses')}`);
    return null;
  };

  const reset = () => {
    resetAll();
    setSheet(null);
    toast('All data deleted');
  };

  return (
    <div className="screen">
      <header className="topbar">
        <div className="topbar-row">
          <div className="topbar-heading">
            <h1 className="screen-title">Settings</h1>
            <p className="screen-sub">{formatBs(today)} · {formatAd(today)}</p>
          </div>
        </div>
      </header>

      <p className="section-label">Appearance</p>
      <ThemeChoice theme={theme} onChange={onChangeTheme} />

      <p className="section-label">Your data</p>
      <ul className="rows">
        <SettingsInfoRow
          title={`${countOf(summary.expenseCount, 'expense', 'expenses')} recorded`}
          note={`${rs(summary.total)} all time · ${summary.categoryCount} categories (${summary.customCategoryCount} custom)`}
        />
        <SettingsActionRow
          icon={<DownloadIcon size={15} />}
          title="Download backup"
          note="Save a .json copy of everything"
          onClick={download}
        />
        <SettingsActionRow
          icon="📋"
          title="Copy backup"
          note="Put the backup text on the clipboard"
          onClick={copy}
        />
        <SettingsActionRow
          icon={<UploadIcon size={15} />}
          title="Restore from backup"
          note="Replaces everything currently saved"
          onClick={() => setSheet('import')}
        />
      </ul>

      <p className="card-note is-block">
        Everything is stored on this device only — nothing is uploaded anywhere.
        Clearing the app&apos;s data or reinstalling will wipe it, so take a
        backup now and then.
      </p>

      <p className="section-label">Danger zone</p>
      <ul className="rows">
        <SettingsActionRow
          title="Delete all data"
          note="Removes every expense and custom category"
          onClick={() => setSheet('reset')}
          critical
        />
      </ul>

      <p className="card-note screen-footer">
        Nepali Expense Tracker · Bikram Sambat 2000–2090
      </p>

      {sheet === 'import' && (
        <ImportSheet onClose={() => setSheet(null)} onRestore={restore} />
      )}

      {sheet === 'reset' && (
        <ResetSheet
          expenseCount={summary.expenseCount}
          total={summary.total}
          onClose={() => setSheet(null)}
          onConfirm={reset}
        />
      )}
    </div>
  );
}
