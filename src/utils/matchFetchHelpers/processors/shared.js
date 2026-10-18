/** Stable row id for list rendering; falls back to a composite of date + teams. */
export const rowId = (explicit, ...parts) => (explicit != null && explicit !== '' ? String(explicit) : parts.join('|'));

/** Keep matches inside the window: upcoming (now..threshold) or past (threshold..now). */
export const inWindow = (date, fetchType, now, dateThreshold) =>
  fetchType === 'info' ? date >= now && date <= dateThreshold : date >= dateThreshold && date <= now;

/** Pre-match: same calendar day and inside [from, to]. */
export const inPreMatchWindow = (date, from, to) =>
  date.toDateString() === from.toDateString() && date >= from && date <= to;
