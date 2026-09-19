/**
 * The availability calendar and the date picker for the inquiry form: one widget,
 * mounted either as the embedded calendar on /terminy-a-ceny or lazily inside the
 * form on the pages that have no calendar of their own.
 *
 * PROGRESSIVE ENHANCEMENT. The page ships a working fallback (the words, a phone
 * number, the form). This replaces it only once the data has arrived, so a guest
 * is never shown a calendar that has not heard from the Worker: a grid of free days
 * that are not really free would be believed. If the fetch fails the fallback
 * stays. The form's date field remains free text either way (docs/03-tech.md §2);
 * picking a range only fills it in and adds `prijezd` / `odjezd` (ISO dates).
 *
 * The rules (what may be an arrival, what may be a departure) live in
 * availability-core.ts and are unit-tested there.
 */
import stylesheet from '../styles/calendar.css?url';
import {
  Availability,
  todayDay,
  toDay,
  toIso,
  type BookedRange,
  type Conflict,
} from './availability-core';

/**
 * Same-origin by default: production puts the Worker on a route of the site's own
 * hostname. The GitHub Pages preview has no such route, so its build sets
 * PUBLIC_AVAILABILITY_URL to the Worker's own address (CORS on the Worker allows it).
 * If you set it for a production build, add its origin to `connect-src`; tools/headers.mjs
 * does that from the same variable.
 */
const ENDPOINT: string = import.meta.env.PUBLIC_AVAILABILITY_URL || '/api/availability';
const FETCH_TIMEOUT_MS = 10_000;
const MONTHS_SHOWN = 2;
const MONTHS_AHEAD = 12;
const DAY_MS = 86_400_000;

let request: Promise<BookedRange[]> | null = null;

/** One request per page, however many widgets mount. A failure is not remembered. */
function load(): Promise<BookedRange[]> {
  request ??= fetch(ENDPOINT, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((json) => {
      if (!json?.success || !Array.isArray(json.bookedRanges)) throw new Error('bad payload');
      return json.bookedRanges as BookedRange[];
    })
    .catch((err) => {
      request = null;
      throw err;
    });
  return request;
}

let styles: Promise<void> | null = null;

/**
 * The stylesheet is fetched here, not imported for effect: Astro would inline an
 * imported one into the HTML of every page that has the form, and the picker on `/`
 * and `/kontakt` is closed for nearly every visitor. It loads alongside the data, and
 * never blocks the calendar: an unstyled calendar still works.
 */
function loadStyles(): Promise<void> {
  styles ??= new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheet;
    link.onload = link.onerror = () => resolve();
    document.head.append(link);
  });
  return styles;
}

const cs = (o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('cs-CZ', { timeZone: 'UTC', ...o });
const fMonth = cs({ month: 'long', year: 'numeric' });
const fLong = cs({ day: 'numeric', month: 'long', year: 'numeric' });
const fWeekday = cs({ weekday: 'short' });
const fWeekdayLong = cs({ weekday: 'long' });

const asDate = (day: number) => new Date(day * DAY_MS);
const monthOf = (day: number) => asDate(day).getUTCFullYear() * 12 + asDate(day).getUTCMonth();
const firstOf = (month: number) => Date.UTC(Math.floor(month / 12), month % 12, 1) / DAY_MS;
const daysIn = (month: number) => new Date(Date.UTC(Math.floor(month / 12), (month % 12) + 1, 0)).getUTCDate();
/** 0 = Monday. */
const weekdayOf = (day: number) => (asDate(day).getUTCDay() + 6) % 7;
/** 2024-01-01 is a Monday. */
const MONDAY = toDay('2024-01-01');

function short(day: number): string {
  const d = asDate(day);
  return `${d.getUTCDate()}. ${d.getUTCMonth() + 1}. ${d.getUTCFullYear()}`;
}

function nights(n: number): string {
  return `${n} ${n === 1 ? 'noc' : n >= 2 && n <= 4 ? 'noci' : 'nocí'}`;
}

const STATE_LABEL = {
  volno: 'volno',
  obsazeno: 'obsazeno',
  prijezd: 'od odpoledne obsazeno',
  odjezd: 'do dopoledne obsazeno',
} as const;

const CONFLICT_TEXT: Record<Conflict, string> = {
  order: 'Den odjezdu musí být po dni příjezdu.',
  past: 'Termín už uplynul.',
  checkin: 'V den příjezdu je chalupa obsazená. Vyberte jiný termín.',
  overlap: 'V tomto termínu je chalupa obsazená. Vyberte jiný termín.',
};

const CHEVRON = (path: string) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;

let uid = 0;

export async function mountCalendar(root: HTMLElement, form: HTMLFormElement | null): Promise<void> {
  root.setAttribute('aria-busy', 'true');

  let ranges: BookedRange[];
  try {
    [ranges] = await Promise.all([load(), loadStyles()]);
  } catch {
    root.removeAttribute('aria-busy');
    const status = root.querySelector('[data-cal-status]');
    if (status) {
      status.textContent = 'Obsazenost se nepodařilo načíst. Napište termín do pole a ozveme se.';
    }
    return;
  }

  const id = `cal${++uid}`;
  const today = todayDay();
  const av = new Availability(ranges, { today });
  const embedded = root.dataset.availCal === 'embedded';

  const nowMonth = monthOf(today);
  const maxView = nowMonth + MONTHS_AHEAD - MONTHS_SHOWN;
  const minDay = firstOf(nowMonth);
  const maxDay = firstOf(nowMonth + MONTHS_AHEAD) - 1;

  const termin = form?.querySelector<HTMLInputElement>('#termin') ?? null;
  let prefilled = '';

  const state = {
    view: nowMonth,
    checkIn: null as number | null,
    checkOut: null as number | null,
    focus: today,
  };
  let warning = '';

  for (let d = today; d <= maxDay; d++) {
    if (av.canCheckIn(d)) {
      state.focus = d;
      break;
    }
  }

  root.innerHTML = `
    <div class="cal">
      <div class="cal-months"></div>
      <div class="cal-foot">
        <p class="cal-msg" role="status"></p>
        <p class="cal-actions">
          ${embedded && form ? '<a class="btn btn-primary" href="#poptavka" data-cal-go hidden>Pokračovat k poptávce</a>' : ''}
          <button type="button" class="btn btn-secondary" data-cal-reset hidden>Zrušit výběr</button>
        </p>
      </div>
    </div>`;
  const months = root.querySelector<HTMLElement>('.cal-months')!;
  const msg = root.querySelector<HTMLElement>('.cal-msg')!;
  const go = root.querySelector<HTMLElement>('[data-cal-go]');
  const reset = root.querySelector<HTMLElement>('[data-cal-reset]')!;
  root.removeAttribute('aria-busy');

  const selectable = (day: number): boolean =>
    state.checkIn === null || state.checkOut !== null
      ? av.canCheckIn(day)
      : av.canCheckOut(state.checkIn, day) || av.canCheckIn(day);

  const selectionOf = (day: number): 'in' | 'out' | 'mid' | '' => {
    if (day === state.checkIn) return 'in';
    if (day === state.checkOut) return 'out';
    if (state.checkIn !== null && state.checkOut !== null && day > state.checkIn && day < state.checkOut) return 'mid';
    return '';
  };

  function dayHtml(day: number): string {
    const past = day < today;
    const s = av.state(day);
    const sel = selectionOf(day);
    const label = [
      fLong.format(asDate(day)),
      past ? 'již uplynulo' : STATE_LABEL[s],
      sel === 'in' ? 'příjezd' : sel === 'out' ? 'odjezd' : sel === 'mid' ? 'součást vybraného pobytu' : '',
    ]
      .filter(Boolean)
      .join(', ');
    const focusable = monthOf(state.focus) >= state.view && monthOf(state.focus) < state.view + MONTHS_SHOWN;
    const tabbable = focusable ? day === state.focus : day === firstOf(state.view);
    return `<td><button type="button" class="cal-day" data-d="${day}" data-s="${past ? 'minulost' : s}"${
      sel ? ` data-x="${sel}"` : ''
    }${selectable(day) ? '' : ' aria-disabled="true"'}${day === today ? ' aria-current="date"' : ''} tabindex="${
      tabbable ? 0 : -1
    }" aria-label="${label}">${asDate(day).getUTCDate()}</button></td>`;
  }

  function monthHtml(month: number, position: number): string {
    const first = firstOf(month);
    const lead = weekdayOf(first);
    const count = daysIn(month);
    const cells: string[] = [];
    for (let i = 0; i < lead; i++) cells.push('<td></td>');
    for (let i = 0; i < count; i++) cells.push(dayHtml(first + i));
    while (cells.length % 7) cells.push('<td></td>');
    const rows: string[] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).join('')}</tr>`);

    const head = Array.from(
      { length: 7 },
      (_, i) => `<th scope="col" abbr="${fWeekdayLong.format(asDate(MONDAY + i))}">${fWeekday.format(asDate(MONDAY + i))}</th>`,
    ).join('');
    const nav = (dir: -1 | 1) => {
      const off = dir < 0 ? state.view <= nowMonth : state.view >= maxView;
      return `<button type="button" class="cal-nav" data-nav="${dir}"${off ? ' disabled' : ''} aria-label="${
        dir < 0 ? 'Předchozí měsíce' : 'Další měsíce'
      }">${CHEVRON(dir < 0 ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6')}</button>`;
    };
    const spacer = '<span class="cal-nav-spacer" aria-hidden="true"></span>';
    return `<section class="cal-month">
      <div class="cal-mhead">${position === 0 ? nav(-1) : spacer}<h3 class="cal-mname" id="${id}-${position}">${fMonth.format(
        asDate(first),
      )}</h3>${position === MONTHS_SHOWN - 1 ? nav(1) : spacer}</div>
      <table class="cal-grid" aria-labelledby="${id}-${position}"><thead><tr>${head}</tr></thead><tbody>${rows.join('')}</tbody></table>
    </section>`;
  }

  function message(): string {
    if (warning) return warning;
    const { checkIn, checkOut } = state;
    if (checkIn === null) return 'Vyberte den příjezdu.';
    if (checkOut === null) return `Příjezd ${short(checkIn)}. Nyní vyberte den odjezdu.`;
    return `Vybráno: ${short(checkIn)} – ${short(checkOut)} (${nights(checkOut - checkIn)}). Termín je volný.`;
  }

  function render(refocus?: string): void {
    months.innerHTML = Array.from({ length: MONTHS_SHOWN }, (_, i) => monthHtml(state.view + i, i)).join('');
    msg.textContent = message();
    msg.toggleAttribute('data-warn', warning !== '');
    const complete = state.checkIn !== null && state.checkOut !== null;
    if (go) go.hidden = !complete;
    reset.hidden = state.checkIn === null;
    if (refocus) months.querySelector<HTMLElement>(refocus)?.focus();
  }

  function hidden(name: string): HTMLInputElement | null {
    return form?.querySelector<HTMLInputElement>(`input[type="hidden"][name="${name}"]`) ?? null;
  }

  function setHidden(name: string, value: string | null): void {
    if (!form) return;
    let el = hidden(name);
    if (value === null) return el?.remove();
    if (!el) {
      el = document.createElement('input');
      el.type = 'hidden';
      el.name = name;
      form.append(el);
    }
    el.value = value;
  }

  /** Write the selection into the form: the free-text field, plus exact ISO dates. */
  function syncForm(): void {
    if (!termin) return;
    termin.setCustomValidity('');
    const { checkIn, checkOut } = state;
    if (checkIn !== null && checkOut !== null) {
      prefilled = `${short(checkIn)} – ${short(checkOut)} (${nights(checkOut - checkIn)})`;
      termin.value = prefilled;
      setHidden('prijezd', toIso(checkIn));
      setHidden('odjezd', toIso(checkOut));
    } else {
      if (termin.value === prefilled) termin.value = '';
      prefilled = '';
      setHidden('prijezd', null);
      setHidden('odjezd', null);
    }
  }

  function clear(): void {
    state.checkIn = state.checkOut = null;
    warning = '';
    syncForm();
  }

  function pick(day: number): void {
    warning = '';
    const { checkIn, checkOut } = state;

    if (checkIn !== null && checkOut === null) {
      if (day === checkIn) return clear();
      if (day > checkIn) {
        if (av.canCheckOut(checkIn, day)) {
          state.checkOut = day;
          return syncForm();
        }
        if (!av.canCheckIn(day)) {
          warning = 'V tomto termínu je chalupa obsazená. Vyberte dřívější den odjezdu.';
          return;
        }
        warning = 'V tomto termínu je chalupa obsazená, příjezd jsme proto přesunuli na vámi vybraný den. Vyberte odjezd.';
      }
    }

    if (av.canCheckIn(day)) {
      state.checkIn = day;
      state.checkOut = null;
      syncForm();
    } else {
      warning = day < today ? 'Tento den už uplynul.' : 'Tento den je obsazený. Vyberte volný den příjezdu.';
    }
  }

  function moveFocus(target: number): void {
    state.focus = Math.min(Math.max(target, minDay), maxDay);
    const m = monthOf(state.focus);
    if (m < state.view) state.view = m;
    else if (m >= state.view + MONTHS_SHOWN) state.view = m - MONTHS_SHOWN + 1;
    state.view = Math.min(Math.max(state.view, nowMonth), maxView);
    render(`[data-d="${state.focus}"]`);
  }

  function shiftMonth(day: number, by: number): number {
    const target = monthOf(day) + by;
    return firstOf(target) + Math.min(asDate(day).getUTCDate(), daysIn(target)) - 1;
  }

  months.addEventListener('click', (e) => {
    const target = e.target as Element;
    const nav = target.closest<HTMLElement>('[data-nav]');
    if (nav) {
      state.view = Math.min(Math.max(state.view + Number(nav.dataset.nav), nowMonth), maxView);
      return render(`[data-nav="${nav.dataset.nav}"]:not(:disabled)`);
    }
    const btn = target.closest<HTMLElement>('[data-d]');
    if (!btn) return;
    const day = Number(btn.dataset.d);
    state.focus = day;
    pick(day);
    render(`[data-d="${day}"]`);
  });

  months.addEventListener('keydown', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('[data-d]');
    if (!btn || e.altKey || e.ctrlKey || e.metaKey) return;
    const day = Number(btn.dataset.d);
    const next: Record<string, number> = {
      ArrowLeft: day - 1,
      ArrowRight: day + 1,
      ArrowUp: day - 7,
      ArrowDown: day + 7,
      Home: day - weekdayOf(day),
      End: day + 6 - weekdayOf(day),
      PageUp: shiftMonth(day, -1),
      PageDown: shiftMonth(day, 1),
    };
    if (e.key in next) {
      e.preventDefault();
      moveFocus(next[e.key]);
    }
  });

  reset.addEventListener('click', () => {
    clear();
    render(`[data-d="${state.focus}"]`);
  });

  if (form && termin) {
    // Typing over a prefilled range means the guest is no longer choosing from the calendar.
    termin.addEventListener('input', () => {
      if (termin.value === prefilled) return;
      state.checkIn = state.checkOut = null;
      warning = '';
      prefilled = '';
      termin.setCustomValidity('');
      setHidden('prijezd', null);
      setHidden('odjezd', null);
      render();
    });

    // What is checked is what is about to be sent, not what the widget believes.
    form.addEventListener('submit', (e) => {
      const checkIn = hidden('prijezd')?.value;
      const checkOut = hidden('odjezd')?.value;
      if (!checkIn || !checkOut) return;
      const conflict = av.conflict(checkIn, checkOut);
      if (!conflict) return;
      e.preventDefault();
      termin.setCustomValidity(CONFLICT_TEXT[conflict]);
      termin.reportValidity();
      // The bubble fades after a few seconds; the reason should not.
      warning = CONFLICT_TEXT[conflict];
      render();
    });
  }

  render();
}
