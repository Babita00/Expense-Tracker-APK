import type { AppData, BsDate } from '../../../types';
import type { DataSummary } from '../types';
import { sum } from '../../../lib/analytics';
import { toBackupJson } from '../../../lib/storage';

export function summariseData(data: AppData): DataSummary {
  return {
    expenseCount: data.expenses.length,
    total: sum(data.expenses),
    categoryCount: data.categories.length,
    customCategoryCount: data.categories.filter((c) => c.custom).length,
  };
}

/** Named for the BS date it was taken, so backups sort by when they were made. */
export function backupFileName(today: BsDate): string {
  const month = String(today.month + 1).padStart(2, '0');
  const day = String(today.day).padStart(2, '0');
  return `expenses-${today.year}-${month}-${day}.json`;
}

/**
 * Hands the backup to the browser as a file download. Throws when the browser
 * refuses - the caller falls back to offering the clipboard instead.
 */
export function downloadBackup(data: AppData, today: BsDate): void {
  const blob = new Blob([toBackupJson(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = backupFileName(today);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Revoked on a delay: some WebViews are still reading the blob when the
    // click handler returns.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/** Rejects when the clipboard is unavailable, which is common in a WebView. */
export function copyBackup(data: AppData): Promise<void> {
  return navigator.clipboard.writeText(toBackupJson(data));
}
