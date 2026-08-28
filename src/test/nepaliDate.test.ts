import { describe, expect, it } from 'vitest';
import {
  MAX_BS_YEAR, MIN_BS_YEAR, MONTHS,
  addDays, addMonths, adToBs, bsToAd, compareBs, daysInMonth,
  formatBs, fromKey, isValidBs, monthGrid, monthKeyOf, toKey, weekdayOf,
} from '../lib/nepaliDate';

describe('BS <-> AD conversion', () => {
  // New-year anchors are the safest published checkpoints.
  it('maps BS new year days to the right AD dates', () => {
    expect(adToBs(new Date(2023, 3, 14))).toEqual({ year: 2080, month: 0, day: 1 });
    expect(adToBs(new Date(2026, 3, 14))).toEqual({ year: 2083, month: 0, day: 1 });
  });

  it('round-trips a date through AD and back', () => {
    const original = { year: 2083, month: 4, day: 10 };
    expect(adToBs(bsToAd(original))).toEqual(original);
  });

  it('converts BS 2083 Bhadra 10 to 26 August 2026', () => {
    const ad = bsToAd({ year: 2083, month: 4, day: 10 });
    expect(ad.getFullYear()).toBe(2026);
    expect(ad.getMonth()).toBe(7);
    expect(ad.getDate()).toBe(26);
  });

  it('exposes the full table range', () => {
    expect(MIN_BS_YEAR).toBe(2000);
    expect(MAX_BS_YEAR).toBe(2090);
  });
});

describe('month lengths', () => {
  it('knows 2083 has 32 days in Ashadh and 29 in Mangsir', () => {
    expect(daysInMonth(2083, 2)).toBe(32);
    expect(daysInMonth(2083, 7)).toBe(29);
  });

  it('never returns a length outside 29-32 for any year in range', () => {
    for (let year = MIN_BS_YEAR; year <= MAX_BS_YEAR; year++) {
      for (let month = 0; month < 12; month++) {
        const days = daysInMonth(year, month);
        expect(days).toBeGreaterThanOrEqual(29);
        expect(days).toBeLessThanOrEqual(32);
      }
    }
  });

  it('produces a grid whose leading blanks match day 1 weekday', () => {
    const cells = monthGrid(2083, 4);
    const lead = cells.findIndex((c) => c !== null);
    expect(lead).toBe(weekdayOf({ year: 2083, month: 4, day: 1 }));
    expect(cells.filter((c) => c !== null)).toHaveLength(daysInMonth(2083, 4));
  });
});

describe('date keys', () => {
  it('pads month and day so keys sort chronologically', () => {
    expect(toKey({ year: 2083, month: 4, day: 5 })).toBe('2083-05-05');
    expect(toKey({ year: 2083, month: 11, day: 30 })).toBe('2083-12-30');

    // Padding is what lets plain string ordering stand in for date ordering,
    // which the whole grouping layer relies on.
    const chronological = [
      { year: 2083, month: 4, day: 5 },
      { year: 2083, month: 4, day: 12 },
      { year: 2083, month: 8, day: 30 },
      { year: 2083, month: 9, day: 1 },
      { year: 2084, month: 0, day: 1 },
    ].map(toKey);

    expect([...chronological].sort()).toEqual(chronological);
  });

  it('round-trips through fromKey', () => {
    const date = { year: 2081, month: 8, day: 17 };
    expect(fromKey(toKey(date))).toEqual(date);
  });

  it('derives the month bucket', () => {
    expect(monthKeyOf('2083-05-12')).toBe('2083-05');
  });
});

describe('arithmetic', () => {
  it('rolls the year over when stepping past Chaitra', () => {
    expect(addMonths({ year: 2083, month: 11, day: 5 }, 1))
      .toEqual({ year: 2084, month: 0, day: 5 });
    expect(addMonths({ year: 2083, month: 0, day: 5 }, -1))
      .toEqual({ year: 2082, month: 11, day: 5 });
  });

  it('clamps the day into a shorter target month', () => {
    // Ashadh 2083 has 32 days; Mangsir has 29.
    const moved = addMonths({ year: 2083, month: 2, day: 32 }, 5);
    expect(moved.month).toBe(7);
    expect(moved.day).toBe(29);
  });

  it('stays inside the supported year range', () => {
    expect(addMonths({ year: MAX_BS_YEAR, month: 11, day: 1 }, 12).year).toBe(MAX_BS_YEAR);
    expect(addMonths({ year: MIN_BS_YEAR, month: 0, day: 1 }, -12).year).toBe(MIN_BS_YEAR);
  });

  it('crosses a month boundary when adding days', () => {
    const last = daysInMonth(2083, 4);
    expect(addDays({ year: 2083, month: 4, day: last }, 1))
      .toEqual({ year: 2083, month: 5, day: 1 });
  });

  it('orders dates correctly', () => {
    expect(compareBs({ year: 2083, month: 4, day: 1 }, { year: 2083, month: 4, day: 2 })).toBeLessThan(0);
    expect(compareBs({ year: 2084, month: 0, day: 1 }, { year: 2083, month: 11, day: 30 })).toBeGreaterThan(0);
  });
});

describe('validation & formatting', () => {
  it('rejects impossible days and out-of-range years', () => {
    expect(isValidBs({ year: 2083, month: 7, day: 30 })).toBe(false); // Mangsir has 29
    expect(isValidBs({ year: 2083, month: 7, day: 29 })).toBe(true);
    expect(isValidBs({ year: 1999, month: 0, day: 1 })).toBe(false);
    expect(isValidBs({ year: 2091, month: 0, day: 1 })).toBe(false);
  });

  it('formats with the romanised month name', () => {
    expect(formatBs({ year: 2083, month: 4, day: 10 })).toBe('Bhadra 10, 2083');
    expect(MONTHS).toHaveLength(12);
  });
});
