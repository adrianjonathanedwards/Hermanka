import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker, { type Env } from '../src/index.ts';

const ICS_URL = 'https://feed.example.invalid/secret-token/default.ics';

const FEED = [
  'BEGIN:VCALENDAR',
  'BEGIN:VEVENT',
  'DTSTART:20991228T140000',
  'DTEND:20991230T100000',
  'SUMMARY:Test Guest',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

class FakeKV {
  store = new Map<string, string>();
  puts = 0;
  failPuts = false;
  async get(key: string, type?: string) {
    const v = this.store.get(key);
    if (v === undefined) return null;
    return type === 'json' ? JSON.parse(v) : v;
  }
  async put(key: string, value: string) {
    if (this.failPuts) throw new Error('kv down');
    this.puts++;
    this.store.set(key, value);
  }
}

let kv: FakeKV;
let upstreamCalls: number;
let upstream: () => Response | Promise<Response>;
const realFetch = globalThis.fetch;

function env(overrides: Partial<Env> = {}): Env {
  return { E_CHALUPY_ICAL_URL: ICS_URL, AVAILABILITY_KV: kv as unknown as KVNamespace, ...overrides };
}

function get(path = '/api/availability', init?: RequestInit, e: Env = env()) {
  return worker.fetch(new Request(`https://www.example.invalid${path}`, init), e, {} as ExecutionContext);
}

beforeEach(() => {
  kv = new FakeKV();
  upstreamCalls = 0;
  upstream = () => new Response(FEED, { status: 200 });
  globalThis.fetch = (async () => {
    upstreamCalls++;
    return upstream();
  }) as typeof fetch;
});

test.after(() => {
  globalThis.fetch = realFetch;
});

const RANGE = { start: '2099-12-28', end: '2099-12-30' };

test('cold cache: fetches upstream once, returns ranges, writes KV', async () => {
  const res = await get();
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.deepEqual(body.bookedRanges, [RANGE]);
  assert.equal(body.success, true);
  assert.equal(body.stale, false);
  assert.equal(upstreamCalls, 1);
  assert.equal(kv.puts, 1);
});

test('warm cache: a second request inside 15 minutes does not touch upstream', async () => {
  await get();
  const res = await get();
  assert.equal((await res.json()).stale, false);
  assert.equal(upstreamCalls, 1);
});

test('expired cache: re-fetches after 15 minutes', async () => {
  await get();
  const stored = JSON.parse(kv.store.get('availability:v1')!);
  stored.fetchedAt = Date.now() - 16 * 60 * 1000;
  kv.store.set('availability:v1', JSON.stringify(stored));

  const res = await get();
  assert.equal((await res.json()).stale, false);
  assert.equal(upstreamCalls, 2);
});

test('just under 15 minutes is still fresh', async () => {
  await get();
  const stored = JSON.parse(kv.store.get('availability:v1')!);
  stored.fetchedAt = Date.now() - 14 * 60 * 1000;
  kv.store.set('availability:v1', JSON.stringify(stored));

  await get();
  assert.equal(upstreamCalls, 1);
});

test('expired cache + upstream down: serves the old copy flagged stale, no-store', async () => {
  await get();
  const stored = JSON.parse(kv.store.get('availability:v1')!);
  stored.fetchedAt = Date.now() - 3 * 24 * 60 * 60 * 1000;
  kv.store.set('availability:v1', JSON.stringify(stored));
  upstream = () => new Response('boom', { status: 500 });

  const res = await get();
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.stale, true);
  assert.deepEqual(body.bookedRanges, [RANGE]);
  assert.equal(res.headers.get('Cache-Control'), 'no-store');
});

test('expired cache + upstream throws (timeout, network): still serves stale', async () => {
  await get();
  const stored = JSON.parse(kv.store.get('availability:v1')!);
  stored.fetchedAt = 0;
  kv.store.set('availability:v1', JSON.stringify(stored));
  upstream = () => {
    throw new Error('network');
  };

  const body = await (await get()).json();
  assert.equal(body.stale, true);
});

test('no cache + upstream down: 503 with CORS, and nothing is cached', async () => {
  upstream = () => new Response('boom', { status: 502 });
  const res = await get();
  assert.equal(res.status, 503);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
  assert.deepEqual(await res.json(), { success: false, error: 'unavailable' });
  assert.equal(kv.puts, 0);
});

test('a 200 that is not a calendar is rejected and never cached as "no bookings"', async () => {
  upstream = () => new Response('<html>Login</html>', { status: 200 });
  const res = await get();
  assert.equal(res.status, 503);
  assert.equal(kv.puts, 0);
});

test('a failed KV write does not fail the request', async () => {
  kv.failPuts = true;
  const res = await get();
  assert.equal(res.status, 200);
  assert.deepEqual((await res.json()).bookedRanges, [RANGE]);
});

test('missing E_CHALUPY_ICAL_URL: 500 not_configured, upstream never called', async () => {
  const res = await get('/api/availability', undefined, env({ E_CHALUPY_ICAL_URL: undefined }));
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { success: false, error: 'not_configured' });
  assert.equal(upstreamCalls, 0);
});

test('concurrent cold requests share one upstream fetch', async () => {
  await Promise.all([get(), get(), get()]);
  assert.equal(upstreamCalls, 1);
});

test('the response never contains the guest name or the feed URL', async () => {
  const text = await (await get()).text();
  assert.ok(!text.includes('Test Guest'));
  assert.ok(!text.includes('secret-token'));
});

test('CORS: every response carries Access-Control-Allow-Origin: *', async () => {
  const responses = [
    await get(),
    await get('/api/availability/'),
    await get('/api/availability', { method: 'HEAD' }),
    await get('/api/availability', { method: 'OPTIONS' }),
    await get('/api/availability', { method: 'POST' }),
    await get('/nope'),
  ];
  for (const res of responses) {
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
  }
  assert.deepEqual(
    responses.map((r) => r.status),
    [200, 200, 200, 204, 405, 404],
  );
});

test('HEAD has headers and no body', async () => {
  const res = await get('/api/availability', { method: 'HEAD' });
  assert.equal(await res.text(), '');
});
