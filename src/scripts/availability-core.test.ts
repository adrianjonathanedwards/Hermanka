import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Availability, toDay, toIso, todayDay } from './availability-core.ts';

const d = toDay;
const TODAY = d('2026-09-19');

// Guest A: arrives Sat 10 Oct, leaves Tue 13 Oct.  Guest B: arrives Tue 13 Oct (hand-over
// day), leaves Thu 15 Oct.  Guest C: arrives Sat 24 Oct, leaves Sun 25 Oct. The Worker merges
// A and B, so that is what the client normally sees; both shapes are tested.
const MERGED = [
  { start: '2026-10-10', end: '2026-10-15' },
  { start: '2026-10-24', end: '2026-10-25' },
];
const UNMERGED = [
  { start: '2026-10-10', end: '2026-10-13' },
  { start: '2026-10-13', end: '2026-10-15' },
  { start: '2026-10-24', end: '2026-10-25' },
];

test('day arithmetic round-trips across DST changes and year ends', () => {
  for (const iso of ['2026-03-29', '2026-10-25', '2026-12-31', '2027-01-01', '2028-02-29']) {
    assert.equal(toIso(toDay(iso)), iso);
  }
  assert.equal(toDay('2026-10-26') - toDay('2026-10-25'), 1);
  assert.equal(toDay('2026-03-30') - toDay('2026-03-28'), 2);
});

test('todayDay is the Prague date', () => {
  assert.equal(toIso(todayDay(new Date('2026-07-01T22:30:00Z'))), '2026-07-02');
});

for (const [label, ranges] of [['merged', MERGED], ['unmerged', UNMERGED]] as const) {
  test(`states of a booked stay (${label})`, () => {
    const av = new Availability(ranges, { today: TODAY });
    assert.equal(av.state(d('2026-10-09')), 'volno');
    assert.equal(av.state(d('2026-10-10')), 'prijezd');
    assert.equal(av.state(d('2026-10-11')), 'obsazeno');
    assert.equal(av.state(d('2026-10-13')), 'obsazeno'); // one leaves, the next arrives
    assert.equal(av.state(d('2026-10-14')), 'obsazeno');
    assert.equal(av.state(d('2026-10-15')), 'odjezd');
    assert.equal(av.state(d('2026-10-16')), 'volno');
    assert.equal(av.state(d('2026-10-24')), 'prijezd');
    assert.equal(av.state(d('2026-10-25')), 'odjezd');
  });
}

test('check-in is never allowed on a taken night', () => {
  const av = new Availability(MERGED, { today: TODAY });
  for (const day of ['2026-10-10', '2026-10-11', '2026-10-14', '2026-10-24']) {
    assert.equal(av.canCheckIn(d(day)), false, day);
  }
});

test('the departure day is free for a new arrival (same-day turnover)', () => {
  const av = new Availability(MERGED, { today: TODAY });
  assert.equal(av.canCheckIn(d('2026-10-15')), true);
  assert.equal(av.canCheckIn(d('2026-10-25')), true);
  assert.equal(av.canCheckIn(d('2026-10-09')), true);
});

test('a guest may leave on the day the next guest arrives', () => {
  const av = new Availability(MERGED, { today: TODAY });
  assert.equal(av.canCheckOut(d('2026-10-08'), d('2026-10-10')), true);
  assert.equal(av.canCheckOut(d('2026-10-08'), d('2026-10-11')), false);
  assert.equal(av.canCheckOut(d('2026-10-15'), d('2026-10-24')), true);
  assert.equal(av.canCheckOut(d('2026-10-15'), d('2026-10-25')), false);
});

test('a stay can never end on or before its own check-in day', () => {
  const av = new Availability(MERGED, { today: TODAY });
  assert.equal(av.canCheckOut(d('2026-10-15'), d('2026-10-15')), false);
  assert.equal(av.canCheckOut(d('2026-10-15'), d('2026-10-14')), false);
});

test('past days cannot be a check-in; today can', () => {
  const av = new Availability([], { today: TODAY });
  assert.equal(av.canCheckIn(TODAY - 1), false);
  assert.equal(av.canCheckIn(TODAY), true);
});

test('lastCheckOut is the next arrival, or the horizon when nothing follows', () => {
  const av = new Availability(MERGED, { today: TODAY });
  assert.equal(toIso(av.lastCheckOut(d('2026-10-01'))), '2026-10-10');
  assert.equal(toIso(av.lastCheckOut(d('2026-10-15'))), '2026-10-24');
  assert.equal(av.lastCheckOut(d('2026-10-25')) - d('2026-10-25'), 400);
});

test('conflict(): a clean stay, and each way a stay can fail', () => {
  const av = new Availability(MERGED, { today: TODAY });
  assert.equal(av.conflict('2026-10-01', '2026-10-10'), null);
  assert.equal(av.conflict('2026-10-15', '2026-10-24'), null);
  assert.equal(av.conflict('2026-10-08', '2026-10-12'), 'overlap');
  assert.equal(av.conflict('2026-10-01', '2026-10-30'), 'overlap');
  assert.equal(av.conflict('2026-10-11', '2026-10-14'), 'checkin');
  assert.equal(av.conflict('2026-10-14', '2026-10-16'), 'checkin');
  assert.equal(av.conflict('2026-10-20', '2026-10-20'), 'order');
  assert.equal(av.conflict('2026-10-21', '2026-10-20'), 'order');
  assert.equal(av.conflict('2026-09-01', '2026-09-03'), 'past');
});

test('a stay wrapped around a whole booking is an overlap', () => {
  const av = new Availability(MERGED, { today: TODAY });
  assert.equal(av.conflict('2026-10-12', '2026-10-13'), 'checkin');
  assert.equal(av.conflict('2026-10-09', '2026-10-16'), 'overlap');
});

test('sameDayTurnover: false closes both the arrival and the departure day', () => {
  const av = new Availability(MERGED, { today: TODAY, sameDayTurnover: false });
  assert.equal(av.canCheckIn(d('2026-10-15')), false); // departure day of the block
  assert.equal(av.canCheckIn(d('2026-10-16')), true);
  assert.equal(av.canCheckOut(d('2026-10-01'), d('2026-10-10')), false); // arrival day of the next
  assert.equal(av.canCheckOut(d('2026-10-01'), d('2026-10-09')), true);
  assert.equal(av.conflict('2026-10-01', '2026-10-10'), 'overlap');
});

test('the input need not be sorted, merged or free of overlaps', () => {
  const messy = [
    { start: '2026-10-24', end: '2026-10-25' },
    { start: '2026-10-12', end: '2026-10-15' },
    { start: '2026-10-10', end: '2026-10-13' },
    { start: '2026-10-10', end: '2026-10-13' },
  ];
  const av = new Availability(messy, { today: TODAY });
  assert.equal(av.conflict('2026-10-01', '2026-10-10'), null);
  assert.equal(av.conflict('2026-10-09', '2026-10-11'), 'overlap');
});

test('no bookings at all: everything from today on is open', () => {
  const av = new Availability([], { today: TODAY });
  assert.equal(av.conflict('2026-12-20', '2026-12-27'), null);
  assert.equal(av.state(d('2026-12-24')), 'volno');
});

test('an empty or reversed range from upstream blocks nothing and does not hang', () => {
  const av = new Availability(
    [{ start: '2026-10-10', end: '2026-10-10' }, { start: '2026-10-12', end: '2026-10-11' }],
    { today: TODAY },
  );
  assert.equal(av.canCheckIn(d('2026-10-10')), true);
});
