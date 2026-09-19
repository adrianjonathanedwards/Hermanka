# 04   Sitemap

Six pages. Copy lives in [01-content.md](01-content.md); this file is structure only.

Every page ends with the same thing: the inquiry form, or a route to it. That is the
site's single job ([00-brief.md](00-brief.md)).

```
/                    Domů
/chalupa             Ubytování, vybavení, video, wellness
/terminy-a-ceny      Kalendář, ceník, podmínky, formulář
/okoli               Tipy na výlety
/galerie             Galerie
/kontakt             Kontakt + formulář
```

Navigation is five items plus a persistent CTA:
`Chalupa` · `Termíny a ceny` · `Okolí` · `Galerie` · `Kontakt` + `Nezávazná poptávka`.

---

## `/`   Domů

The whole page is an argument for one click: *check the dates*.

| # | Section | Notes |
| --- | --- | --- |
| 1 | **Hero** | One still image, one line, one CTA. `Stylové ubytování u Dolní Moravy a Králického Sněžníku`. **No carousel**   [01-content.md](01-content.md) §4.1. LCP element; the only preloaded image on the site. |
| 2 | **Fact strip** | Capacity 2–15 · 3 bedrooms · sauna and hot tub · 12 min to Dolní Morava · forest 10 m. Tabular numerals. The five things that decide it. |
| 3 | **O nás teaser** | The paragraph from §4.2, unchanged, → `/chalupa`. |
| 4 | **Site plan** | The illustrated aerial map. Photograph + inline SVG labels ([02-design-system.md](02-design-system.md) §4). Answers "what is actually there" faster than any paragraph. |
| 5 | **Ubytování teaser** | Rooms and terraces, → `/chalupa`. Errors #1–#3 fixed. |
| 6 | **Wellness** | Sauna, pond, hot tub, outdoor seating. Must state that the sauna and hot tub are chargeable   §4.7. |
| 7 | **Dolní Morava** | 12 minutes by car. Full-bleed. → `/okoli`. |
| 8 | **Price + availability** | Derived "from" price, never a hardcoded per-person figure (§2). Primary CTA → `/terminy-a-ceny`. |
| 9 | **Inquiry form** | The full form, not a link to it. Do not make someone navigate to convert. |

## `/chalupa`   Ubytování, vybavení, video, wellness

Absorbs the old `/o-nas/`, `/ubytovani/` and `/video/`. The page for someone who has
decided they like the look of it and now wants to know whether it works.

| # | Section | Anchor |
| --- | --- | --- |
| 1 | Intro   the corrected O nás paragraph (§5.1) | |
| 2 | **Ložnice a pokoje**   room table, 2 / 2+3 / 6+2 = 15 | `#loznice` |
| 3 | **Sociální zařízení**   2�  koupelna, 2�  WC | |
| 4 | **Vybavení**   the `Přehled vybavení` checklist as structured data (§5.9) | `#vybaveni` |
| 5 | **Wellness**   sauna, hot tub, pond, fire pit; chargeable | `#wellness` |
| 6 | **Vytápění**   pellet boiler, fireplace, ducts. The winter answer. | `#vytapeni` |
| 7 | **Video**   facade pattern only. `/video/` 301s to this anchor. | `#video` |
| 8 | **Doprava a parkování**   access road, 4 cars + drive, GPS | `#doprava` |
| 9 | **V okolí naleznete**   the distance table (§5.2) | |
| 10 | CTA → `/terminy-a-ceny` | |

> Blocked: the room table cannot be built until the capacity conflict is resolved,
> and the amenity list cannot ship until `bezbariérové ubytování` is confirmed
> ([01-content.md](01-content.md) §9, items 1 and 2).

## `/terminy-a-ceny`   Kalendář, ceník, podmínky, formulář

The most important page on the site. Calendar first, above the fold, no scrolling to
find it.

| # | Section | Notes |
| --- | --- | --- |
| 1 | **Kalendář obsazenosti** | 12 months. Four states: `Volno` · `Obsazeno` · `Den příjezdu` · `Den odjezdu`. Selecting a free range prefills the form below. See [03-tech.md](03-tech.md) §3. |
| 2 | **Ceník** | One table, seasons as rows, week and weekend columns. Not six cards. |
| 3 | **Svátky** | Silvestr and Vánoce, from dated data that expires itself. Never another `23.-26.12.2024`. |
| 4 | **Co se připočítává** | Electricity, water, recreation fee, deposit, sauna/hot tub. A table, not a paragraph. |
| 5 | **Podmínky** | Payment, check-in/out, cancellation, what is included, pets, smoking. Mostly still missing (§6.4). |
| 6 | **Poptávka** | The form. Dates prefilled from section 1. |

Two rules that are currently buried and must be visible next to the calendar:
minimum stay two nights, and January/February and July/August are whole weeks only.
Somebody is about to try to book a weekend in July.

## `/okoli`   Tipy na výlety

| # | Section |
| --- | --- |
| 1 | Intro   Dolní Morava, Stezka v oblacích, Sky Bridge 721 |
| 2 | **Regional map**   the second illustrated map, photograph + inline SVG labels |
| 3 | **Výlety a atrakce**   every entry with a distance and a season |
| 4 | **Lyžování**   nearby ski areas with drive times |
| 5 | **Koupání**   sorted by distance, or cut to the nearest four |
| 6 | **Historie a památky**   Klášter Hedeč, vojenské muzeum, Králíky |
| 7 | CTA → `/terminy-a-ceny` |

Every entry needs a distance and a travel time. A list of eleven place names with
neither, which is what exists today, is not information.

**Item 3 said "cards" and is built as an index instead.** Sections 3, 4 and 5 are
all "some places, each with a distance", and rendering all three as bordered
rectangles in a grid turned the page into three screens of near-identical boxes  
which also flattened the one distinction on it worth making, between an entry with
a verified figure and an entry without one. There is no `.card` on this page now:
section 3 is a route index with a brass spine and the distances set large on a
margin rail, 4 is an asymmetric split, 5 is a fact box beside a run of names. The
data, the figures and the null rule are untouched. Each component's header comment
carries the full argument; `src/pages/okoli.astro` lists the five shapes in order.

**Section 3 is grouped by `doprava`, walking first.** "The marked trail starts at
the front door" and "twelve minutes in the car" are two different offers, and the
first is the one no competitor can copy   see the note on `Doprava` in
`src/data/okoli.ts`.

## `/galerie`   Galerie

| # | Section |
| --- | --- |
| 1 | Intro line |
| 2 | Grid, grouped: interiér · ložnice · terasa a krb · wellness · okolí · zima |
| 3 | Lightbox   keyboard-navigable, focus-trapped, Esc closes, `alt` on every image |
| 4 | CTA → `/terminy-a-ceny` |

All WebP, all lazy except the first row, all with Czech `alt`. The lightbox is the
one place on this site where JavaScript is unavoidable; without it, images open in a
new tab.

## `/kontakt`   Kontakt + formulář

| # | Section |
| --- | --- |
| 1 | Contact card   name, address, phone (`+420 603 285 524`), email, GPS `50.13088N, 16.75827E` |
| 2 | **Poptávkový formulář**   the same component as `/terminy-a-ceny` |
| 3 | Getting here   access road, parking, bus 500 m, train 2 km |
| 4 | Static map image linking out. **Not** an embedded interactive map   third-party bytes and a cookie problem for one pin. |

`/kontakt/dekujeme`   the form's success target. Confirms the inquiry was received,
repeats the phone number, `noindex`.

> Blocked: there is no published email address anywhere on the current site, and the
> form needs a GDPR line ([01-content.md](01-content.md) §9, items 13 and 14).

---

## Redirects

Old paths 301 to their new homes. Configured in
[`public/_redirects`](../public/_redirects).

| Old | New | |
| --- | --- | --- |
| `/o-nas/` | `/chalupa` | 301 |
| `/ubytovani/` | `/chalupa` | 301 |
| `/video/` | `/chalupa#video` | 301 |
| `/volne-terminy-a-ceny/` | `/terminy-a-ceny` | 301 |
| `/tipy-na-vylety/` | `/okoli` | 301 |

Both the slashed and unslashed forms are covered, since `trailingSlash: 'never'`
makes the unslashed URL canonical. WordPress leftovers (`/wp-content/*`, `/feed`,
`/?s=`) also go home rather than to a 404.

Note that `/video/` **already 404s on the live site** while still being linked from
the main navigation on every page   so this particular redirect is fixing a link
that has been broken for some time, not preserving a working one.

## Not in this phase

`/de/`   routing is ready, content is not ([03-tech.md](03-tech.md) §6).
A privacy page will be needed for the form; scope it once the client answers on
GDPR wording. No blog, no reviews page until there are reviews to put on it.
