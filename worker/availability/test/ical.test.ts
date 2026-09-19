import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, parseBookedRanges, todayInPrague } from '../src/ical.ts';

const TODAY = '2026-09-19';

function calendar(...events: string[]): string {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', ...events, 'END:VCALENDAR', ''].join('\r\n');
}

function event(lines: string[]): string {
  return ['BEGIN:VEVENT', ...lines, 'END:VEVENT'].join('\r\n');
}

test('reads floating date-times and keeps the departure day as the exclusive end', () => {
  const ics = calendar(
    event(['DTSTART:20261028T140000', 'DTEND:20261030T100000', 'STATUS:CONFIRMED']),
  );
  assert.deepEqual(parseBookedRanges(ics, TODAY), [{ start: '2026-10-28', end: '2026-10-30' }]);
});

test('reads all-day VALUE=DATE events', () => {
  const ics = calendar(
    event(['DTSTART;VALUE=DATE:20261101', 'DTEND;VALUE=DATE:20261104']),
  );
  assert.deepEqual(parseBookedRanges(ics, TODAY), [{ start: '2026-11-01', end: '2026-11-04' }]);
});

test('accepts TZID parameters and quoted parameter values containing a colon', () => {
  const ics = calendar(
    event([
      'DTSTART;TZID="Europe/Prague:x":20261201T140000',
      'DTEND;TZID=Europe/Prague:20261203T100000',
    ]),
  );
  assert.deepEqual(parseBookedRanges(ics, TODAY), [{ start: '2026-12-01', end: '2026-12-03' }]);
});

test('unfolds continuation lines and tolerates LF-only line endings', () => {
  const ics = 'BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:2026\n 1105T140000\nDTEND:20261107T100000\nEND:VEVENT\nEND:VCALENDAR\n';
  assert.deepEqual(parseBookedRanges(ics, TODAY), [{ start: '2026-11-05', end: '2026-11-07' }]);
});

test('an event that ends the day it starts blocks its start night (fail closed)', () => {
  const ics = calendar(event(['DTSTART:20270126T140000', 'DTEND:20270126T100000']));
  assert.deepEqual(parseBookedRanges(ics, TODAY), [{ start: '2027-01-26', end: '2027-01-27' }]);
});

test('an event with no DTEND blocks its start night', () => {
  const ics = calendar(event(['DTSTART:20261210T140000']));
  assert.deepEqual(parseBookedRanges(ics, TODAY), [{ start: '2026-12-10', end: '2026-12-11' }]);
});

test('drops cancelled and transparent events', () => {
  const ics = calendar(
    event(['DTSTART:20261010T140000', 'DTEND:20261012T100000', 'STATUS:CANCELLED']),
    event(['DTSTART:20261020T140000', 'DTEND:20261022T100000', 'TRANSP:TRANSPARENT']),
  );
  assert.deepEqual(parseBookedRanges(ics, TODAY), []);
});

test('drops ranges that ended before today but keeps one departing today', () => {
  const ics = calendar(
    event(['DTSTART:20260910T140000', 'DTEND:20260912T100000']),
    event(['DTSTART:20260917T140000', 'DTEND:20260919T100000']),
  );
  assert.deepEqual(parseBookedRanges(ics, TODAY), [{ start: '2026-09-17', end: '2026-09-19' }]);
});

test('sorts, and merges overlapping and back-to-back ranges', () => {
  const ics = calendar(
    event(['DTSTART:20261120T140000', 'DTEND:20261123T100000']),
    event(['DTSTART:20261101T140000', 'DTEND:20261105T100000']),
    event(['DTSTART:20261105T140000', 'DTEND:20261108T100000']),
    event(['DTSTART:20261103T140000', 'DTEND:20261106T100000']),
  );
  assert.deepEqual(parseBookedRanges(ics, TODAY), [
    { start: '2026-11-01', end: '2026-11-08' },
    { start: '2026-11-20', end: '2026-11-23' },
  ]);
});

test('skips events with unparseable or impossible dates instead of throwing', () => {
  const ics = calendar(
    event(['DTSTART:20260231T140000', 'DTEND:20260302T100000']),
    event(['DTSTART:not-a-date', 'DTEND:20261012T100000']),
    event(['DTEND:20261012T100000']),
    event(['DTSTART:20261201T140000', 'DTEND:20261203T100000']),
  );
  assert.deepEqual(parseBookedRanges(ics, TODAY), [{ start: '2026-12-01', end: '2026-12-03' }]);
});

test('a UTC date-time is converted to the Prague calendar day', () => {
  // 22:30 UTC on 1 Dec is 23:30 in Prague (CET): still 1 Dec. 23:30 UTC is 00:30 on 2 Dec.
  const ics = calendar(event(['DTSTART:20261201T223000Z', 'DTEND:20261203T233000Z']));
  assert.deepEqual(parseBookedRanges(ics, TODAY), [{ start: '2026-12-01', end: '2026-12-04' }]);
});

test('an empty calendar is valid and gives no ranges', () => {
  assert.deepEqual(parseBookedRanges(calendar(), TODAY), []);
});

test('nothing but dates leaves the parser: names, e-mails and phones are discarded', () => {
  const ics = calendar(
    event([
      'DTSTART:20261028T140000',
      'DTEND:20261030T100000',
      'SUMMARY:Test Guest',
      'UID:2096-1@example.invalid',
      'Description:Telefon: 600123456\\nEmail: guest@example.invalid\\nDospeli: 4',
      ' 2\\, deti 0\\n',
    ]),
  );
  const result = parseBookedRanges(ics, TODAY);
  assert.deepEqual(Object.keys(result[0]).sort(), ['end', 'start']);
  const serialised = JSON.stringify(result);
  for (const secret of ['Test Guest', 'guest@example.invalid', '600123456', '2096-1']) {
    assert.ok(!serialised.includes(secret), `${secret} leaked into the output`);
  }
});

test('addDays crosses month and year boundaries and DST changes', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-28', 2), '2026-03-30');
  assert.equal(addDays('2026-10-24', 2), '2026-10-26');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
});

test('todayInPrague uses the Prague date, not the UTC date', () => {
  assert.equal(todayInPrague(new Date('2026-07-01T22:30:00Z')), '2026-07-02');
  assert.equal(todayInPrague(new Date('2026-01-01T22:30:00Z')), '2026-01-01');
});
