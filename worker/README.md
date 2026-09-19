# worker/

Two Cloudflare Workers. They deploy separately from the site with `wrangler`; they
are not part of the Cloudflare Pages build.

```
worker/
  inquiry/      POST the inquiry form → Resend        NOT BUILT (the form posts to Web3Forms)
  availability/ e-chalupy iCal → parse → KV → JSON    built
```

## `availability`

`GET /api/availability` returns the booked date ranges from e-chalupy's iCal feed.
The site's calendar and the inquiry form's date picker both read it. Design and the
reasons behind it: [docs/03-tech.md](../docs/03-tech.md) §3.

```jsonc
{
  "success": true,
  "bookedRanges": [{ "start": "2026-10-28", "end": "2026-10-30" }],
  "updatedAt": "2026-09-19T13:27:21.971Z",
  "stale": false
}
```

`start` is the arrival day and `end` the departure day (iCal's exclusive end), so the
nights taken are `start .. end-1`. Ranges are sorted, merged, and never include
anything that ended before today. Failures are `{ "success": false, "error": … }`
with `500` (`not_configured`) or `503` (`unavailable`); the page falls back to "ask us".

- **Cache.** Parsed result in KV. Fresh for 15 minutes; after that the next request
  re-fetches. If e-chalupy is down the old copy is served with `"stale": true` (KV
  keeps it a week). Concurrent requests in one isolate share a single upstream fetch.
- **CORS.** `Access-Control-Allow-Origin: *` on every response, including errors and
  `OPTIONS`. The data is dates only.
- **Privacy.** The feed carries guest names, e-mails and phone numbers. The parser
  keeps DTSTART, DTEND, STATUS and TRANSP and nothing else (`test/ical.test.ts`
  asserts it). Do not log the feed or the URL.
- **Not a calendar.** A 200 that lacks `BEGIN:VCALENDAR` (an HTML error page) is
  rejected, not cached as "no bookings".

### Run it locally

```sh
cd worker/availability
npm install
cp .dev.vars.example .dev.vars     # then put the real feed URL in it (gitignored)
npm run dev                        # http://127.0.0.1:8787/api/availability
```

Then `npm run dev` in the repo root: Astro's dev server proxies `/api` to port 8787
(override with `AVAILABILITY_DEV_ORIGIN`). `wrangler dev` simulates KV locally.

### Deploy

```sh
cd worker/availability
npx wrangler secret put E_CHALUPY_ICAL_URL     # the .ics URL; it contains a token
npx wrangler deploy
```

- The KV namespace has no `id` in `wrangler.jsonc`; Wrangler creates it on the first
  deploy (automatic provisioning).
- `wrangler.jsonc` binds the route `www.chalupahermanka.cz/api/availability`, so the
  browser calls it same-origin and the site's CSP (`connect-src 'self'`) needs no
  change. **Check after the first deploy** that the route wins over the site's own
  static-assets Worker for that path: `curl -i https://www.chalupahermanka.cz/api/availability`
  should be JSON, not the 404 page. If the Worker is served from another origin
  (workers.dev), change `ENDPOINT` in `src/scripts/availability-calendar.ts` and add
  that origin to `connect-src` in `tools/headers.mjs`.
- Rotating the feed URL: `wrangler secret put` again. The 15-minute cache means the
  old data is served for up to that long.

### Test

`npm test` at the repo root runs the parser, the Worker (fake KV, stubbed upstream:
cold, warm, expired, stale-on-error, non-iCal 200, KV failure, CORS) and the
front-end rules.

## `inquiry`

Not built. The inquiry form posts to Web3Forms (`POPTAVKA_ENDPOINT` in
`src/data/site.ts`). If it is ever replaced by a Worker, see
[docs/03-tech.md](../docs/03-tech.md) §2: it must accept a plain
`application/x-www-form-urlencoded` POST and answer `303`, work with JavaScript off,
validate server-side, and set `Reply-To` to the guest. Secrets `RESEND_API_KEY`,
`INQUIRY_TO`, `INQUIRY_FROM`; log nothing containing personal data.
