/**
 * Emits `dist/_headers` at the end of every build.
 *
 * WHY THIS IS GENERATED AND NOT A FILE IN public/
 * -----------------------------------------------
 * The Content-Security-Policy has to name the one inline <script> this site
 * ships   the motion gate in BaseLayout.astro   by hash, because the whole point
 * of the policy is that `script-src` does NOT carry 'unsafe-inline'. A hash
 * hand-copied into a static file is a trap: someone reformats the gate, the hash
 * stops matching, the gate is blocked, and the failsafe timer inside it never
 * arms   so `.js-motion` is never added, nothing is ever hidden, and the breakage
 * is invisible in review and only shows up as a silently missing CSP. Worse, the
 * reverse (a hash that matches nothing) fails closed and blanks the reveals.
 *
 * So the hashes are read back out of the built HTML. They cannot drift, because
 * they are computed from the same bytes Cloudflare will serve.
 *
 * Cloudflare Pages reads dist/_headers at deploy time; it is not served.
 * Rules apply top to bottom and later matches win for a repeated header name,
 * which is what lets `/_a/*` below override the Cache-Control set on `/*`.
 * See https://developers.cloudflare.com/pages/configuration/headers/
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Every .html Astro just wrote. */
function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? htmlFiles(full) : e.name.endsWith('.html') ? [full] : [];
  });
}

/**
 * Hashes of inline <script> blocks.
 *
 * `src=` scripts are skipped   they are covered by 'self'. JSON-LD is included
 * even though no shipping browser enforces script-src against a non-executable
 * type: it costs one hash and it means a stricter UA cannot drop our structured
 * data on the floor.
 */
function inlineScriptHashes(dist) {
  const hashes = new Set();
  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, 'utf8');
    for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/\bsrc=/.test(attrs)) continue;
      hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
    }
  }
  return [...hashes].sort();
}

function connectSrc() {
  try {
    const url = process.env.PUBLIC_AVAILABILITY_URL;
    return url ? `connect-src 'self' ${new URL(url).origin}` : "connect-src 'self'";
  } catch {
    return "connect-src 'self'";
  }
}

function policy(scriptHashes) {
  return [
    /* Nothing loads from anywhere but this origin BY DEFAULT. The one
       exception is `frame-src` below   a YouTube video, played in an on-site
       overlay instead of a new tab (docs/03-tech.md "Video"). Nothing else on
       the site embeds a third party; the map is still a link that opens a new
       tab, not an embed. */
    "default-src 'self'",

    /* The bundled module is 'self'; the motion gate is named by hash. No
       'unsafe-inline', no 'unsafe-eval', no CDN. */
    `script-src 'self' ${scriptHashes.join(' ')}`,

    /* Astro emits component styles as real stylesheets, so 'self' covers them.
       'unsafe-inline' is here for the ~36 `style="object-position:..."`
       attributes art-directing photo crops   an inline STYLE cannot execute
       anything, and hashing per-element attributes needs 'unsafe-hashes', which
       is a bigger loosening than this. Revisit if those move into classes. */
    "style-src 'self' 'unsafe-inline'",

    "img-src 'self'",
    "font-src 'self'",

    /* The only fetch on the site is the availability calendar's GET /api/availability
       (src/scripts/availability-calendar.ts), on this hostname unless the build sets
       PUBLIC_AVAILABILITY_URL, in which case that Worker's origin is allowed too. */
    connectSrc(),

    /* The inquiry form POSTs to POPTAVKA_ENDPOINT (src/data/site.ts), which is
       Web3Forms   https://api.web3forms.com/submit. If that is ever repointed
       at a same-origin Worker instead, this can drop back to just 'self'. */
    "form-action 'self' https://api.web3forms.com",

    /*
     * Nothing frames this site (`frame-ancestors` below). This site frames
     * exactly one thing: a YouTube video, in the on-site overlay built by
     * src/components/VideoLightbox.astro and wired up in
     * src/scripts/motion.ts, and only after a visitor clicks a "Přehrát"
     * trigger   the <iframe> does not exist in the page until then, so this
     * origin costs nothing for anyone who never plays a video.
     *
     * `-nocookie` is Google's own reduced-tracking embed domain: it does not
     * set cookies until playback actually starts. It is a mitigation, not a
     * guarantee   once someone presses play inside the frame, requests to
     * Google's video CDN happen exactly as they would on youtube.com, outside
     * this CSP's reach because they are inside a cross-origin document with
     * its own headers.
     */
    "frame-src https://www.youtube-nocookie.com",
    "frame-ancestors 'none'",
    "object-src 'none'",

    /* A <base> injection would repoint every relative URL on the page. */
    "base-uri 'none'",

    "manifest-src 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

/*
 * `autoplay` and `encrypted-media` below carry one extra origin, and only
 * one: the video overlay's own iframe (VideoLightbox.astro). YouTube's player
 * asks for both   `encrypted-media` is for DRM'd catalogue content, which
 * none of these videos are, but the player requests it regardless and a
 * blocked EncryptedMediaError is a worse failure than an unused grant. Every
 * other feature stays denied outright, exactly as before.
 */
const SECURITY = (csp) => `  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Cross-Origin-Opener-Policy: same-origin
  Permissions-Policy: accelerometer=(), autoplay=(self "https://www.youtube-nocookie.com"), browsing-topics=(), camera=(), display-capture=(), encrypted-media=(self "https://www.youtube-nocookie.com"), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), xr-spatial-tracking=()`;

export default function headers() {
  return {
    name: 'hermanka:headers',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const hashes = inlineScriptHashes(dist);
        const csp = policy(hashes);

        const file = `# GENERATED by tools/headers.mjs on every build. Do not edit by hand
# and do not move to public/ — the CSP script hashes are read back out of the
# built HTML so they can never fall out of step with it.

# The default rule. Everything below only overrides Cache-Control.
#
# That last line: HTML is revalidated every time. These pages are the cheap part
# of the site (18 kB gzipped for the largest) and a stale price list is worse
# than a request, so no page is ever served from cache without asking.
#
# Comments are only recognised at the START of a line, so none of them may sit
# between the rule and its headers below.
/*
${SECURITY(csp)}
  Cache-Control: public, max-age=0, must-revalidate

# Everything Astro fingerprints. The hash IS the cache key, so a changed file
# is a changed URL and this can never serve something stale. One year, immutable.
/_a/*
  Cache-Control: public, max-age=31536000, immutable

# Subset variable fonts. Not fingerprinted — they are referenced by a stable
# path from global.css and preloaded from <head> — so they are versioned by
# hand: rename the file if the subset changes, or this will serve the old one
# for a year. tools/build-fonts.mjs writes them.
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

# The share card and the icons: stable URLs a scraper or the OS asks for by
# name, so they cannot be fingerprinted. A day is long enough to be cheap and
# short enough that replacing one is not a year-long mistake.
/og-default.jpg
  Cache-Control: public, max-age=86400
/apple-touch-icon.png
  Cache-Control: public, max-age=86400
/favicon.png
  Cache-Control: public, max-age=86400
`;

        writeFileSync(path.join(dist, '_headers'), file);
        logger.info(`_headers written (${hashes.length} inline script hash(es) pinned)`);
      },
    },
  };
}
