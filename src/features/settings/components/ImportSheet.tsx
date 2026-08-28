import { useRef, useState } from 'react';
import { Sheet } from '../../../components/Sheet';
import { UploadIcon } from '../../../components/Icons';

interface ImportSheetProps {
  onClose: () => void;
  /** Applies the backup. Returns an error to show, or null when it worked. */
  onRestore: (text: string) => string | null;
}

/**
 * Restore-from-backup form: a file picker and a paste box, both feeding the
 * same restore. Parsing and storing stay with the caller; this only collects
 * the text and reports back whatever went wrong.
 */
export function ImportSheet({ onClose, onRestore }: ImportSheetProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [pasted, setPasted] = useState('');
  const [error, setError] = useState<string | null>(null);

  const restore = (text: string) => setError(onRestore(text));

  const readFile = (file: File | undefined) => {
    if (!file) return;
    file.text().then(restore).catch(() => setError('Could not read that file.'));
  };

  return (
    <Sheet
      open
      title="Restore from backup"
      onClose={onClose}
      footer={
        <button
          className="btn btn-primary btn-block"
          disabled={pasted.trim() === ''}
          onClick={() => restore(pasted)}
        >
          Restore
        </button>
      }
    >
      <p className="sheet-note is-lead">
        This <strong>replaces</strong> everything currently in the app. Pick a
        backup file, or paste the backup text below.
      </p>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        onChange={(e) => readFile(e.target.files?.[0])}
      />
      <button className="btn btn-block sheet-action" onClick={() => fileInput.current?.click()}>
        <UploadIcon /> Choose backup file
      </button>

      <div className="field">
        <label className="field-label" htmlFor="paste">Or paste backup text</label>
        <textarea
          id="paste"
          className="textarea is-code"
          placeholder={'{ "version": 1, "expenses": [ ... ] }'}
          value={pasted}
          onChange={(e) => { setPasted(e.target.value); setError(null); }}
        />
        {error && <p className="field-error">{error}</p>}
      </div>
    </Sheet>
  );
}
