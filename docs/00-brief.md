# 00   Brief

**Project:** chalupahermanka.cz rebuild
**Status:** documentation + scaffold complete, no pages built
**Language of record:** these docs are English for the dev team. All Czech UI copy
is quoted verbatim and must be copied character-for-character, diacritics included.

---

## The client

**Chalupa Heřmanka**   a privately owned holiday cottage let as a whole unit.

- **Where:** Heřmanice u Králík, Pardubice region, Czech Republic. A small village
  in a wooded valley below the Králický Sněžník massif.
- **What:** a completely renovated two-storey cottage set into a forested slope.
  Forest begins ten metres from the door.
- **Position:** 50.13088 N, 16.75827 E
- **Phone (published on current site):** +420 603 285 524
- **Public email:** not published anywhere on the current site   see
  [01-content.md](01-content.md), NEEDS CLIENT INPUT.

Rented whole-house only. There is no per-room letting and no on-site reception.
Everything is owner-managed.

### Replacing

<https://www.chalupahermanka.cz/>   a 2019 WordPress template build. Slow,
unmaintained, footer still reads `© 2019`, prices and seasonal dates have gone
stale in place, and several copy errors have been live for years. The current
site's availability calendar and inquiry form are both third-party iframes from
`e-chalupy.cz` (property id `2096`); see [03-tech.md](03-tech.md) for what that
means for the rebuild.

---

## The property

### Rooms and capacity

| Room | Sleeps | Notes |
| --- | --- | --- |
| **Ložnice přízemí** | 2 | Ground floor, opens directly onto the covered terrace |
| **Mezonetová ložnice** | 2 + 3 | Mezzanine   upper level + lower level |
| **Mezonetová ložnice** | 6 + 2 | Mezzanine   lower level + upper level |
| **Total** | **15** | across **3 bedrooms** |

Stated publicly as: **kapacita 2 až 15 osob ve 3 ložnicích**.

> ⚠️ **Capacity conflict   must be resolved before any page is built.**
> The figures above come from the site-plan graphic and the client brief. The prose
> on the current `/ubytovani/` page describes the same rooms differently:
> ground-floor room "*2 dospělé osoby s dítětem*", first mezzanine "*3 až 4 osoby
> dole a 2 osoby v horním patře*", second mezzanine "*6 až 8 osob dole a 2 osoby
> v horním patře*"   which totals up to 19, not 15. The 15-person figure is the one
> quoted in the headline, the pricing page and the site plan, so **15 is
> authoritative** until the client says otherwise. Do not publish the per-room
> ranges from the old prose. Logged in [01-content.md](01-content.md).

### Sanitary facilities

- **2�  koupelna**   ground floor with shower cubicle; upper floor with a large bath
- **2�  WC**   one on each floor, both separate
- Laundry and drying corner on the upper floor (pračka, sušička)

### Parking and access

- Private access road to the property, built to take a lorry
- **Parking for 4 cars at the building**
- Further parking on the drive itself (approx. 4 more cars)

### Features that sell the place

Outdoor sauna · wooden hot tub · natural swimming pond · indoor fireplace ·
outdoor fireplace on a covered terrace · fire pit · swings and a slide ·
second open terrace over the wooded valley · a stream running past the house ·
forest ten metres away.

Heating is a pellet boiler plus a wood-burning fireplace insert with hot-air ducts
into the upper bedrooms, backed by an accumulation tank on electric coils. This
matters to Czech winter guests and belongs on the page   it is the difference
between "a cottage" and "a cottage that is actually warm in February".

### Distances (from the current site, to be confirmed)

| | |
| --- | --- |
| Dolní Morava ski resort | 9 km / 12 min by car (3 km as the crow flies) |
| Klášter Hedeč | 11 km / 17 min |
| Klepáč (1145 m) | 8 km / 2 h 15 min on foot |
| Králický Sněžník (1423 m) | 17 km / 4 h 15 min on foot |
| Polish border resorts (Międzygórze, Bílá Voda) | 30–60 min |
| Bus stop   Heřmanice | 500 m |
| Train   Prostřední Lipka | 2 km |
| Shop / post / ATM   Králíky | 3 km |
| Forest | 10 m |

---

## Audience

**Primary   Czech families and groups of friends, 8–15 people**, booking the whole
cottage for a weekend or a full week. They are price-aware but not cheap; they are
comparing three or four cottages in the Orlické hory / Králický Sněžník area, and
they are deciding on: *does it sleep all of us, is it free on our dates, is it warm,
what does it actually cost including the extras.*

Secondary audiences, in order:

1. **German-speaking visitors.** Existing guest reviews are in German. `/de/` is the
   likely second locale   routing is set up from day one for this reason, but the
   launch is Czech-only.
2. **Firemní akce, svatby, oslavy**   company events, weddings, parties. Named
   explicitly in the current hero copy and worth keeping; it is the segment that
   fills mid-week and off-season.

Everyone in this audience arrives on a phone, usually from a Google search or from a
listing portal. Design and budget for that first.

---

## The single job of the site

> **Get an inquiry with dates attached.**

Not a brochure, not a blog, not an Instagram feed. Every section on every page is
either moving someone toward the inquiry form with dates in hand, or it is answering
the one objection that stands between them and doing so.

Practical consequences, which the rest of these docs enforce:

- The availability calendar and the inquiry form are the two most important
  components on the site. They get built first and they get the most care.
- The date field is the field that matters. It is prefilled from the calendar
  wherever we can manage it, and it is never a hard-validated format that can reject
  a guest for typing `20.-27.9.` instead of `20-27.9.2026`.
- Price must be legible without a phone call. The current site makes you read four
  price blocks and a paragraph of fees to work out what a week actually costs.
- Nothing on the site may be slower than the decision it supports. See the
  performance budget in [03-tech.md](03-tech.md).

## The booking model

**Inquiry form + availability calendar. No online booking. No payment on the site.**

- Availability is **owner-managed**. The site reads it; the site never writes it.
- The guest sends an inquiry; the owner replies and confirms by email or phone.
- Payment happens off-site by bank transfer   50 % deposit no later than two weeks
  before arrival, balance by the day of arrival, plus metered electricity, a water
  charge per person, the municipal recreation fee, and a refundable deposit.
- Therefore: **no cart, no checkout, no card fields, no account, no login.** If a
  future phase wants real-time booking, it is a different project with a different
  liability profile.

## What success looks like

| | Now | Target |
| --- | --- | --- |
| Inquiries per month with dates already filled in | unknown   the form is a third-party iframe and not measurable | measurable, and the majority of inquiries carry dates |
| Mobile Lighthouse performance | poor   2019 template, GTM, YouTube embed, third-party iframes | ≥ 95 |
| First load (excl. hero image) | not budgeted | ≤ 100 kB |
| Largest Contentful Paint, mobile 4G | not budgeted | < 2.0 s |
| Stale content on the site | Vánoce dates from 2024, `© 2019`, a hardcoded per-person price | zero dated content that can rot silently   see [01-content.md](01-content.md) |
| Copy errors | at least nine live, listed in 01-content | zero |
| German-speaking guests | no path at all | routing ready, `/de/` shippable without a rebuild |

Secondary, not the point but worth having: the owner should be able to change prices
and seasonal dates without a developer, and the site should stop depending on
`e-chalupy.cz` to display its own availability.

---

## Out of scope for this phase

Page content. This first task is documentation and scaffolding only   see the file
list at the end of [README.md](../README.md) for exactly what exists.
