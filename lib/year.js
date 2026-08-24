// A vehicle's model year, checked the same way wherever it is saved.
//
// It matters more than it looks: the part number offered for a front bar is the
// one last used on the same make, model AND year, so a year typed as 216 or
// 20166 would either be refused by the database check constraint or, worse,
// quietly make the car match nothing it should. Both endpoints that write a
// year run it through here first.

// Old enough to cover anything that comes through a smash repairer; the top end
// allows next year's plates, which turn up before the year does.
export const MIN_YEAR = 1950;
export const maxYear = () => new Date().getFullYear() + 2;

// Distinct from null, which is the legitimate "not recorded".
export const INVALID = Symbol('invalid year');

/**
 * '' / null / undefined  -> null   (no year recorded, which is allowed)
 * '2016' / 2016          -> 2016
 * anything else          -> INVALID
 */
export function parseYear(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const year = Number(String(value).trim());
  if (!Number.isInteger(year) || year < MIN_YEAR || year > maxYear()) return INVALID;
  return year;
}
