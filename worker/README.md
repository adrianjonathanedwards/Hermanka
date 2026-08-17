# worker/

Two Cloudflare Workers. **Neither is built yet**   this directory is a placeholder
so the shape is agreed before anyone writes code.

They deploy separately from the site with `wrangler`; they are not part of the
Cloudflare Pages build.

```
worker/
  inquiry/      POST the inquiry form → Resend
  availability/ iCal feed → parse → cache in KV → JSON
```

## `inquiry`

Receives a native `<form method="POST">`. See
[docs/03-tech.md](../docs/03-tech.md) §2.

- Accepts `application/x-www-form-urlencoded`. **Must work with JavaScript
  disabled**   respond `303` to `/kontakt/dekujeme` on success, `303` back to the
  form with an error parameter on failure. Never respond with JSON only.
- Validates server-side. The date field is free text; parse leniently, never reject
  on format, and pass the raw string through to the email.
- Honeypot + minimum time-to-submit before considering Turnstile.
- Sets `Reply-To` to the guest so the owner can just hit reply. Sends the guest a
  copy when `poslat mi na email kopii` is ticked.
- Secrets: `RESEND_API_KEY`, `INQUIRY_TO`, `INQUIRY_FROM`. Set with
  `wrangler secret put`; never committed, never in the Astro build.
- Logs nothing containing personal data.

## `availability`

Reads an iCal feed, caches parsed booked ranges in KV, returns compact JSON. See
[docs/03-tech.md](../docs/03-tech.md) §3.

- KV TTL 15–30 minutes; serve stale on upstream failure.
- Returns booked date ranges as JSON   never raw iCal to the browser.

> ⚠️ **Do not start this Worker yet.** There is no iCal feed. Availability on the
> current site is an HTML iframe from `obsazenost.e-chalupy.cz` (property id `2096`)
> with no `.ics` export. The source has to be decided first   the recommendation is
> a private Google Calendar owned by the client. Full reasoning and the alternatives
> are in [docs/03-tech.md](../docs/03-tech.md) §3; it is item 15 on the blocked list
> in [docs/01-content.md](../docs/01-content.md) §9.
