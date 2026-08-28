/**
 * Wording helpers shared across the screens - the small phrases that would
 * otherwise be re-written, and get out of step, in every list header.
 */

/** "1 entry" / "3 entries". English plurals are irregular, so pass both. */
export function countOf(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
