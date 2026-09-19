/**
 * iCal → booked date ranges. Pure functions, no Workers APIs, so it runs
 * unchanged under `node --test`.
 *
 * PRIVACY. The e-chalupy feed puts the guest's name in SUMMARY and their e-mail
 * and phone number in DESCRIPTION. This parser reads exactly four properties
 * (DTSTART, DTEND, STATUS, TRANSP) and discards every other line, so nothing else
 * can reach the cache or the response. Do not add SUMMARY or DESCRIPTION.
 *
 * DATE MODEL. A range is [start, end): `start` is the arrival day and `end` is
 * the departure day, exactly like iCal's exclusive DTEND. The nights taken are
 * start .. end-1. The feed uses floating local times (arrival 14:00, departure
 * 10:00), so only the date part is used and no time zone conversion is applied.
 */

export interface BookedRange {
  /** Arrival day, YYYY-MM-DD. */
  start: string;
  /** Departure day, YYYY-MM-DD. The night before it is the last one taken. */
  end: string;
}

const DAY_MS = 86_400_000;

const DATE_ONLY = /^(\d{4})(\d{2})(\d{2})$/;
const DATE_TIME = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/;

const pragueDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Prague',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Today's date in Prague as YYYY-MM-DD. `en-CA` formats as ISO. */
export function todayInPrague(now: Date = new Date()): string {
  return pragueDate.format(now);
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS).toISOString().slice(0, 10);
}

/** RFC 5545 §3.1: a line that starts with a space or tab continues the one before. */
function unfold(text: string): string[] {
  const lines: string[] = [];
  for (const raw of text.split(/\r\n|\n|\r/)) {
    if ((raw[0] === ' ' || raw[0] === '\t') && lines.length > 0) {
      lines[lines.length - 1] += raw.slice(1);
    } else {
      lines.push(raw);
    }
  }
  return lines;
}

/** Index of the first `:` that is not inside a double-quoted parameter value. */
function valueSeparator(line: string): number {
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') quoted = !quoted;
    else if (c === ':' && !quoted) return i;
  }
  return -1;
}

/** A DTSTART/DTEND value as YYYY-MM-DD, or null if it is not a valid date. */
function parseDate(value: string): string | null {
  const dateOnly = DATE_ONLY.exec(value);
  const dateTime = dateOnly ? null : DATE_TIME.exec(value);
  const m = dateOnly ?? dateTime;
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const utc = new Date(Date.UTC(y, mo - 1, d));
  // Rejects 20260231 and friends: the constructor rolls them into the next month.
  if (utc.getUTCFullYear() !== y || utc.getUTCMonth() !== mo - 1 || utc.getUTCDate() !== d) {
    return null;
  }

  // A trailing Z is the one case where the date depends on a time zone.
  if (dateTime && dateTime[7] === 'Z') {
    const instant = new Date(
      Date.UTC(y, mo - 1, d, Number(dateTime[4]), Number(dateTime[5]), Number(dateTime[6] ?? 0)),
    );
    return todayInPrague(instant);
  }
  return utc.toISOString().slice(0, 10);
}

interface RawEvent {
  start: string | null;
  end: string | null;
  cancelled: boolean;
  transparent: boolean;
}

function readEvents(ics: string): RawEvent[] {
  const events: RawEvent[] = [];
  let current: RawEvent | null = null;

  for (const line of unfold(ics)) {
    if (line === 'BEGIN:VEVENT') {
      current = { start: null, end: null, cancelled: false, transparent: false };
    } else if (line === 'END:VEVENT') {
      if (current) events.push(current);
      current = null;
    } else if (current) {
      const sep = valueSeparator(line);
      if (sep < 0) continue;
      // `DTSTART;VALUE=DATE` and `DTSTART;TZID=Europe/Prague` → `DTSTART`.
      const name = line.slice(0, sep).split(';')[0].toUpperCase();
      const value = line.slice(sep + 1).trim();
      if (name === 'DTSTART') current.start = parseDate(value);
      else if (name === 'DTEND') current.end = parseDate(value);
      else if (name === 'STATUS') current.cancelled = value.toUpperCase() === 'CANCELLED';
      else if (name === 'TRANSP') current.transparent = value.toUpperCase() === 'TRANSPARENT';
    }
  }
  return events;
}

/**
 * Booked ranges that have not ended before `today`, sorted, with overlapping and
 * back-to-back ranges merged.
 *
 * Merging back-to-back ranges loses nothing: what matters is which nights are
 * taken, and a day that is one guest's departure and the next guest's arrival has
 * a taken night on both sides either way.
 *
 * An event whose end is not after its start (a missing DTEND, or the same-day
 * `14:00 → 10:00` entry the feed really does contain) blocks its start night.
 * Failing closed is deliberate: showing a day the owner marked as free is worse
 * than the reverse.
 */
export function parseBookedRanges(ics: string, today: string): BookedRange[] {
  const ranges: BookedRange[] = [];

  for (const event of readEvents(ics)) {
    if (!event.start || event.cancelled || event.transparent) continue;
    const end = event.end && event.end > event.start ? event.end : addDays(event.start, 1);
    if (end < today) continue;
    ranges.push({ start: event.start, end });
  }

  ranges.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

  const merged: BookedRange[] = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      if (range.end > last.end) last.end = range.end;
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}
