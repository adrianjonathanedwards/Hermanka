/**
 * GET /api/availability   booked date ranges from the e-chalupy iCal feed.
 *
 *   e-chalupy .ics ──▶ parse (dates only) ──▶ KV ──▶ JSON
 *
 * CACHING. The parsed result is kept in KV. It counts as fresh for 15 minutes; after
 * that the next request re-fetches the feed. If that fails, the old copy is served
 * with `stale: true`, so an e-chalupy outage costs the guest nothing. KV keeps the
 * copy for a week. If there is no copy at all the response is a 503 and the page
 * falls back to "ask us", which docs/03-tech.md §3 already requires.
 *
 * SECRET. `E_CHALUPY_ICAL_URL` carries a token in its path, so it is a Worker
 * secret (`wrangler secret put E_CHALUPY_ICAL_URL`, or `.dev.vars` locally). It is
 * never returned and never logged; errors are logged by kind only.
 */
import { parseBookedRanges, todayInPrague, type BookedRange } from './ical.ts';

export interface Env {
  E_CHALUPY_ICAL_URL?: string;
  AVAILABILITY_KV: KVNamespace;
}

interface Snapshot {
  bookedRanges: BookedRange[];
  /** Epoch ms of the upstream fetch that produced it. */
  fetchedAt: number;
}

const KV_KEY = 'availability:v1';
const FRESH_MS = 15 * 60 * 1000;
const KV_RETENTION_S = 7 * 24 * 60 * 60;
const UPSTREAM_TIMEOUT_MS = 8_000;
/** How long a browser may reuse a response without asking again. */
const BROWSER_MAX_AGE_S = 300;

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function respond(request: Request, body: unknown, status: number, cacheControl: string): Response {
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(body), {
    status,
    headers: {
      ...CORS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  });
}

/** One upstream fetch per isolate at a time, so a cold cache is not stampeded. */
let inflight: Promise<Snapshot> | null = null;

async function refresh(env: Env): Promise<Snapshot> {
  const url = env.E_CHALUPY_ICAL_URL;
  if (!url) throw new Error('not_configured');

  const res = await fetch(url, {
    headers: { Accept: 'text/calendar' },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`upstream_${res.status}`);

  const ics = await res.text();
  // A 200 that is not a calendar (an HTML error or login page) would otherwise parse
  // as "no bookings" and be cached as a fully free house for 15 minutes.
  if (!ics.includes('BEGIN:VCALENDAR')) throw new Error('upstream_not_ical');

  const snapshot: Snapshot = {
    bookedRanges: parseBookedRanges(ics, todayInPrague()),
    fetchedAt: Date.now(),
  };

  try {
    await env.AVAILABILITY_KV.put(KV_KEY, JSON.stringify(snapshot), {
      expirationTtl: KV_RETENTION_S,
    });
  } catch {
    // A failed cache write must not fail a request that already has good data.
    console.error('kv_put_failed');
  }
  return snapshot;
}

async function getSnapshot(env: Env): Promise<{ snapshot: Snapshot; stale: boolean }> {
  const cached = await env.AVAILABILITY_KV.get<Snapshot>(KV_KEY, 'json');
  if (cached && Date.now() - cached.fetchedAt < FRESH_MS) {
    return { snapshot: cached, stale: false };
  }

  try {
    inflight ??= refresh(env).finally(() => {
      inflight = null;
    });
    return { snapshot: await inflight, stale: false };
  } catch (err) {
    if (cached) return { snapshot: cached, stale: true };
    throw err;
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname !== '/api/availability' && pathname !== '/api/availability/') {
      return respond(request, { success: false, error: 'not_found' }, 404, 'no-store');
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return respond(request, { success: false, error: 'method_not_allowed' }, 405, 'no-store');
    }

    try {
      const { snapshot, stale } = await getSnapshot(env);
      return respond(
        request,
        {
          success: true,
          bookedRanges: snapshot.bookedRanges,
          updatedAt: new Date(snapshot.fetchedAt).toISOString(),
          stale,
        },
        200,
        stale ? 'no-store' : `public, max-age=${BROWSER_MAX_AGE_S}`,
      );
    } catch (err) {
      const kind = err instanceof Error ? err.message : 'unknown';
      console.error('availability_failed', kind);
      const notConfigured = kind === 'not_configured';
      return respond(
        request,
        { success: false, error: notConfigured ? 'not_configured' : 'unavailable' },
        notConfigured ? 500 : 503,
        'no-store',
      );
    }
  },
} satisfies ExportedHandler<Env>;
