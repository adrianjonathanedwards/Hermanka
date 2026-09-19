/**
 * Availability rules. No DOM, so `node --test` can run them.
 *
 * A range from the Worker is [start, end): `start` is the arrival day and `end` is
 * the departure day. The NIGHTS taken are start .. end-1, and every rule below is
 * a question about nights:
 *
 *   arrival   night(d) taken,  night(d-1) free   morning free, afternoon taken
 *   departure night(d) free,   night(d-1) taken  morning taken, afternoon free
 *   occupied  both taken                          (also a same-day hand-over)
 *   free      neither
 *
 * A stay from `in` to `out` occupies nights in .. out-1. So a guest may arrive on
 * another guest's departure day, and may leave on another guest's arrival day.
 * `sameDayTurnover: false` closes both, for a house that wants a clear day between
 * guests.
 */

export interface BookedRange {
  start: string;
  end: string;
}

export type DayState = 'volno' | 'obsazeno' | 'prijezd' | 'odjezd';

export type Conflict = 'order' | 'past' | 'checkin' | 'overlap';

const DAY_MS = 86_400_000;
/** No booking is further out than this, so a walk over free nights stops here. */
const HORIZON_DAYS = 400;

/** YYYY-MM-DD → whole days since 1970-01-01, immune to DST. */
export function toDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

export function toIso(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

const prague = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Prague',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Today in Prague. A guest abroad still books a Czech house by the Czech date. */
export function todayDay(now: Date = new Date()): number {
  return toDay(prague.format(now));
}

export interface Options {
  today: number;
  sameDayTurnover?: boolean;
}

export class Availability {
  private readonly nights = new Set<number>();
  private readonly today: number;
  private readonly turnover: boolean;

  constructor(ranges: readonly BookedRange[], { today, sameDayTurnover = true }: Options) {
    this.today = today;
    this.turnover = sameDayTurnover;
    // A set of nights rather than the ranges themselves: it does not care whether the
    // input is sorted, overlapping or merged.
    for (const r of ranges) {
      for (let n = toDay(r.start), end = toDay(r.end); n < end; n++) this.nights.add(n);
    }
  }

  /** Is the night that starts on this day taken? */
  taken(day: number): boolean {
    return this.nights.has(day);
  }

  state(day: number): DayState {
    const tonight = this.taken(day);
    const lastNight = this.taken(day - 1);
    if (tonight && lastNight) return 'obsazeno';
    if (tonight) return 'prijezd';
    if (lastNight) return 'odjezd';
    return 'volno';
  }

  /** May a stay start on this day? Never on a taken night, never in the past. */
  canCheckIn(day: number): boolean {
    if (day < this.today || this.taken(day)) return false;
    return this.turnover || !this.taken(day - 1);
  }

  /** The last day a stay starting on `checkIn` can end: the next taken night is the wall. */
  lastCheckOut(checkIn: number): number {
    let wall = checkIn;
    while (!this.taken(wall) && wall < checkIn + HORIZON_DAYS) wall++;
    return this.turnover ? wall : wall - 1;
  }

  /** May a stay from `checkIn` end on this day? */
  canCheckOut(checkIn: number, day: number): boolean {
    return day > checkIn && day <= this.lastCheckOut(checkIn);
  }

  /**
   * A chosen stay changed to include `day`: a later check-out, an earlier check-in,
   * or a shorter stay. Null if that would run into a booking (or `day` is one of
   * the two ends, which the caller treats as "deselect").
   */
  adjust(checkIn: number, checkOut: number, day: number): [number, number] | null {
    if (day > checkOut) return this.canCheckOut(checkIn, day) ? [checkIn, day] : null;
    if (day > checkIn && day < checkOut) return [checkIn, day];
    if (day < checkIn) return this.canCheckIn(day) && this.canCheckOut(day, checkOut) ? [day, checkOut] : null;
    return null;
  }

  /** Why a stay is not possible, or null if it is. Takes ISO strings: what the form holds. */
  conflict(checkIn: string, checkOut: string): Conflict | null {
    const a = toDay(checkIn);
    const b = toDay(checkOut);
    if (!(b > a)) return 'order';
    if (a < this.today) return 'past';
    if (!this.canCheckIn(a)) return 'checkin';
    if (!this.canCheckOut(a, b)) return 'overlap';
    return null;
  }
}
