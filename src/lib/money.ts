/**
 * Rupee formatting. Grouping follows the South Asian convention used in
 * Nepal (1,00,000 rather than 100,000), which `en-IN` implements.
 */

const grouped = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const groupedWhole = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** "Rs. 24,200" */
export function rs(amount: number): string {
  return `Rs. ${grouped.format(round2(amount))}`;
}

/** "24,200" - no prefix, for table cells that carry the unit in the header. */
export function num(amount: number): string {
  return grouped.format(round2(amount));
}

/**
 * Short form for axis ticks and tight captions: 940 / 24.2K / 1.24L.
 * Lakh is the natural break in Nepali usage above 99,999.
 */
export function compact(amount: number): string {
  const n = Math.abs(amount);
  if (n >= 10_000_000) return `${trim(amount / 10_000_000)}Cr`;
  if (n >= 100_000) return `${trim(amount / 100_000)}L`;
  if (n >= 1_000) return `${trim(amount / 1_000)}K`;
  return groupedWhole.format(Math.round(amount));
}

/** "Rs. 24.2K" */
export function rsCompact(amount: number): string {
  return `Rs. ${compact(amount)}`;
}

function trim(n: number): string {
  // one decimal, but never a trailing ".0"
  const s = n.toFixed(n < 10 ? 1 : 0);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Parse what the user typed into an amount. Accepts digits, one decimal point
 * and grouping commas; rejects anything that is not a positive finite number.
 */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[,\s]/g, '').replace(/^Rs\.?/i, '');
  if (!/^\d*\.?\d*$/.test(cleaned) || cleaned === '' || cleaned === '.') return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return round2(value);
}

/** Percentage of a total, guarding the zero-total case. */
export function share(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}
