import NepaliDate, { dateConfigMap } from 'nepali-date-converter';
import type { BsDate } from '../types';

/**
 * Bikram Sambat helpers.
 *
 * Every date in this app is a BS date. AD is only ever computed for display
 * ("also 26 Aug 2026") and for working out the weekday of a BS day.
 *
 * The underlying tables cover BS 2000-2090; we clamp navigation to that range
 * so the converter is never asked for a year it has no data for.
 */

/** Romanised month names, in calendar order (index 0 = Baishakh). */
export const MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan',
  'Bhadra', 'Ashoj', 'Kartik', 'Mangsir',
  'Poush', 'Magh', 'Falgun', 'Chaitra',
] as const;

/** The same months in Devanagari, shown as a secondary label. */
export const MONTHS_NP = [
  'बैशाख', 'जेठ', 'असार', 'साउन',
  'भदौ', 'असोज', 'कार्तिक', 'मंसिर',
  'पुष', 'माघ', 'फाल्गुन', 'चैत',
] as const;

/** Keys used by the converter's own month-length table. */
const CONFIG_KEYS = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan',
  'Bhadra', 'Aswin', 'Kartik', 'Mangsir',
  'Poush', 'Magh', 'Falgun', 'Chaitra',
] as const;

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const WEEKDAYS_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

const AD_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

const years = Object.keys(dateConfigMap).map(Number).sort((a, b) => a - b);
export const MIN_BS_YEAR = years[0];
export const MAX_BS_YEAR = years[years.length - 1];

/* ------------------------------------------------------------------ *
 * conversion
 * ------------------------------------------------------------------ */

/** Number of days in a given BS month. Returns 30 for years outside the table. */
export function daysInMonth(year: number, month: number): number {
  const row = dateConfigMap[String(year)];
  if (!row) return 30;
  return row[CONFIG_KEYS[month]] ?? 30;
}

export function todayBs(): BsDate {
  const bs = new NepaliDate(new Date()).getBS();
  return { year: bs.year, month: bs.month, day: bs.date };
}

export function adToBs(date: Date): BsDate {
  const bs = new NepaliDate(date).getBS();
  return { year: bs.year, month: bs.month, day: bs.date };
}

export function bsToAd(d: BsDate): Date {
  return new NepaliDate(d.year, d.month, d.day).toJsDate();
}

/** Weekday index (0 = Sunday) for a BS date. */
export function weekdayOf(d: BsDate): number {
  return new NepaliDate(d.year, d.month, d.day).getDay();
}

/* ------------------------------------------------------------------ *
 * the "YYYY-MM-DD" storage key (BS, 1-indexed month)
 * ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, '0');

export function toKey(d: BsDate): string {
  return `${d.year}-${pad(d.month + 1)}-${pad(d.day)}`;
}

export function fromKey(key: string): BsDate {
  const [y, m, d] = key.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

/** "2083-05" - the month bucket a date key belongs to. Sorts chronologically. */
export function monthKeyOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function monthKey(year: number, month: number): string {
  return `${year}-${pad(month + 1)}`;
}

/* ------------------------------------------------------------------ *
 * formatting
 * ------------------------------------------------------------------ */

/** "Bhadra 12, 2083" */
export function formatBs(d: BsDate): string {
  return `${MONTHS[d.month]} ${d.day}, ${d.year}`;
}

/** "Bhadra 12" */
export function formatBsShort(d: BsDate): string {
  return `${MONTHS[d.month]} ${d.day}`;
}

/** "Bhadra 2083" */
export function formatMonth(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/** "26 Aug 2026" - the Gregorian equivalent, shown as a secondary cue. */
export function formatAd(d: BsDate): string {
  const ad = bsToAd(d);
  return `${ad.getDate()} ${AD_MONTHS[ad.getMonth()]} ${ad.getFullYear()}`;
}

/** "Today", "Yesterday", or the formatted BS date. */
export function formatRelative(d: BsDate): string {
  const t = todayBs();
  if (d.year === t.year && d.month === t.month && d.day === t.day) return 'Today';
  const y = addDays(t, -1);
  if (d.year === y.year && d.month === y.month && d.day === y.day) return 'Yesterday';
  return formatBs(d);
}

/* ------------------------------------------------------------------ *
 * arithmetic
 * ------------------------------------------------------------------ */

/** Shift a BS month by `delta`, clamping the day into the target month. */
export function addMonths(d: BsDate, delta: number): BsDate {
  const total = d.year * 12 + d.month + delta;
  let year = Math.floor(total / 12);
  let month = total % 12;
  if (month < 0) {
    month += 12;
    year -= 1;
  }
  year = clamp(year, MIN_BS_YEAR, MAX_BS_YEAR);
  return { year, month, day: Math.min(d.day, daysInMonth(year, month)) };
}

/** Shift a BS date by a number of days, via AD so month lengths are exact. */
export function addDays(d: BsDate, delta: number): BsDate {
  const ad = bsToAd(d);
  ad.setDate(ad.getDate() + delta);
  return adToBs(ad);
}

export function compareBs(a: BsDate, b: BsDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

/** True when the date is in the table's range and the day exists in that month. */
export function isValidBs(d: BsDate): boolean {
  if (d.year < MIN_BS_YEAR || d.year > MAX_BS_YEAR) return false;
  if (d.month < 0 || d.month > 11) return false;
  return d.day >= 1 && d.day <= daysInMonth(d.year, d.month);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * The grid for one BS month: `null` for the leading blanks before day 1,
 * then every day number. Always a whole number of weeks is NOT padded at the
 * end - the caller lays it out in a 7-column grid.
 */
export function monthGrid(year: number, month: number): (number | null)[] {
  const lead = weekdayOf({ year, month, day: 1 });
  const total = daysInMonth(year, month);
  const cells: (number | null)[] = Array(lead).fill(null);
  for (let day = 1; day <= total; day++) cells.push(day);
  return cells;
}

/** Every BS year that has calendar data, newest first. */
export function availableYears(): number[] {
  return [...years].reverse();
}
