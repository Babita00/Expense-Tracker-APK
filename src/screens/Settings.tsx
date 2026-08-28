import { useMemo, useRef, useState } from 'react';
import { useApp } from '../store';
import type { Theme } from '../lib/theme';
import { fromBackupJson, toBackupJson } from '../lib/storage';
import { formatAd, formatBs, todayBs } from '../lib/nepaliDate';
import { rs } from '../lib/money';
import { sum } from '../lib/analytics';
import { Sheet } from '../components/Sheet';
import { DownloadIcon, UploadIcon } from '../components/Icons';

interface Props {
  theme: Theme;
  onChangeTheme: (theme: Theme) => void;
}

export function Settings({ theme, onChangeTheme }: Props) {
  const { data, expenses, categories, replaceAll, resetAll, toast } = useApp();
  const fileInput = useRef<HTMLInputElement>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [pasted, setPasted] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const today = useMemo(() => todayBs(), []);
  const total = useMemo(() => sum(expenses), [expenses]);
  const customCount = categories.filter((c) => c.custom).length;

  /* ---------------- export ---------------- */

  const download = () => {
    try {
      const blob = new Blob([toBackupJson(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses-${today.year}-${String(today.month + 1).padStart(2, '0')}-${String(today.day).padStart(2, '0')}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Backup file saved');
    } catch {
      toast('Could not save the file - try copying instead');
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toBackupJson(data));
      toast('Backup copied to clipboard');
    } catch {
      toast('Clipboard blocked - use Download instead');
    }
  };

  /* ---------------- import ---------------- */

  const applyImport = (text: string) => {
    try {
      const next = fromBackupJson(text);
      replaceAll(next);
      setImportOpen(false);
      setPasted('');
      setImportError(null);
      toast(`Restored ${next.expenses.length} expenses`);
    } catch {
      setImportError('That does not look like a valid backup file.');
    }
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    file.text().then(applyImport).catch(() => setImportError('Could not read that file.'));
  };

  return (
    <div className="screen">
      <header className="topbar">
        <div className="topbar-row">
          <div>
            <h1 className="screen-title">Settings</h1>
            <p className="screen-sub">{formatBs(today)} · {formatAd(today)}</p>
          </div>
        </div>
      </header>

      <p className="section-label">Appearance</p>
      <div className="card" style={{ padding: 14 }}>
        <div className="viewtoggle" style={{ width: '100%' }} role="group" aria-label="Theme">
          {(['system', 'light', 'dark'] as Theme[]).map((option) => (
            <button
              key={option}
              style={{ flex: 1, textTransform: 'capitalize', padding: '8px 10px', fontSize: 13 }}
              aria-pressed={theme === option}
              onClick={() => onChangeTheme(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <p className="section-label">Your data</p>
      <ul className="rows">
        <li>
          <div className="setrow">
            <span className="setrow-main">
              <span className="setrow-title">{expenses.length} expenses recorded</span>
              <span className="setrow-sub">{rs(total)} all time · {categories.length} categories ({customCount} custom)</span>
            </span>
          </div>
        </li>
        <li>
          <button className="setrow" onClick={download}>
            <span className="cat-avatar sm" aria-hidden="true"><DownloadIcon size={15} /></span>
            <span className="setrow-main">
              <span className="setrow-title">Download backup</span>
              <span className="setrow-sub">Save a .json copy of everything</span>
            </span>
          </button>
        </li>
        <li>
          <button className="setrow" onClick={copy}>
            <span className="cat-avatar sm" aria-hidden="true">📋</span>
            <span className="setrow-main">
              <span className="setrow-title">Copy backup</span>
              <span className="setrow-sub">Put the backup text on the clipboard</span>
            </span>
          </button>
        </li>
        <li>
          <button className="setrow" onClick={() => { setImportOpen(true); setImportError(null); }}>
            <span className="cat-avatar sm" aria-hidden="true"><UploadIcon size={15} /></span>
            <span className="setrow-main">
              <span className="setrow-title">Restore from backup</span>
              <span className="setrow-sub">Replaces everything currently saved</span>
            </span>
          </button>
        </li>
      </ul>

      <p className="card-note" style={{ padding: '12px 4px 0', lineHeight: 1.5 }}>
        Everything is stored on this device only — nothing is uploaded anywhere.
        Clearing the app&apos;s data or reinstalling will wipe it, so take a
        backup now and then.
      </p>

      <p className="section-label">Danger zone</p>
      <ul className="rows">
        <li>
          <button className="setrow" onClick={() => setConfirmReset(true)}>
            <span className="setrow-main">
              <span className="setrow-title" style={{ color: 'var(--critical)' }}>Delete all data</span>
              <span className="setrow-sub">Removes every expense and custom category</span>
            </span>
          </button>
        </li>
      </ul>

      <p className="card-note" style={{ textAlign: 'center', padding: '26px 0 0' }}>
        Nepali Expense Tracker · Bikram Sambat 2000–2090
      </p>

      {/* ---------------- import sheet ---------------- */}

      <Sheet
        open={importOpen}
        title="Restore from backup"
        onClose={() => setImportOpen(false)}
        footer={
          <button
            className="btn btn-primary btn-block"
            disabled={pasted.trim() === ''}
            onClick={() => applyImport(pasted)}
          >
            Restore
          </button>
        }
      >
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
          This <strong>replaces</strong> everything currently in the app. Pick a
          backup file, or paste the backup text below.
        </p>

        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <button className="btn btn-block" onClick={() => fileInput.current?.click()} style={{ marginBottom: 16 }}>
          <UploadIcon /> Choose backup file
        </button>

        <div className="field">
          <label className="field-label" htmlFor="paste">Or paste backup text</label>
          <textarea
            id="paste"
            className="textarea"
            style={{ minHeight: 120, fontSize: 12, fontFamily: 'ui-monospace, monospace' }}
            placeholder='{ "version": 1, "expenses": [ ... ] }'
            value={pasted}
            onChange={(e) => { setPasted(e.target.value); setImportError(null); }}
          />
          {importError && <p className="field-error">{importError}</p>}
        </div>
      </Sheet>

      {/* ---------------- reset sheet ---------------- */}

      <Sheet
        open={confirmReset}
        title="Delete all data"
        onClose={() => setConfirmReset(false)}
        footer={
          <>
            <button className="btn btn-block" onClick={() => setConfirmReset(false)}>Cancel</button>
            <button
              className="btn btn-primary btn-block"
              style={{ background: 'var(--critical)' }}
              onClick={() => {
                resetAll();
                setConfirmReset(false);
                toast('All data deleted');
              }}
            >
              Delete everything
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)' }}>
          This permanently removes <strong>{expenses.length} expenses</strong> ({rs(total)})
          and any custom categories. It cannot be undone.
          <br /><br />
          Download a backup first if you might want this data again.
        </p>
      </Sheet>
    </div>
  );
}
