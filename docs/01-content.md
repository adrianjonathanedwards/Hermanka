# 01 — Content inventory

Section-by-section inventory of every page, taken from the live site at
<https://www.chalupahermanka.cz/> on **2026-08-13**, mapped onto the new sitemap in
[04-pages.md](04-pages.md).

Czech copy is quoted **verbatim, including its errors**, so that this file can be
used as a diff source. Anything quoted here is the *old* string. Do not paste from
this file into the build without checking its status first.

**Status key**

| | |
| --- | --- |
| **KEEP** | Ships as-is. Copy it character-for-character. |
| **REWRITE** | The substance is right, the wording is not. Rewrite in the new voice, or fix a defect. |
| **NEEDS CLIENT INPUT** | We do not have the information. Cannot ship without an answer. Every one of these is listed again at the bottom of this file. |
| **DROP** | Does not survive the rebuild. |

---

## 1. Known copy errors on the current site — do not reproduce

These are live today. All of them are to be fixed. The left column is what is on the
site now; **never** copy-paste the left column into the new build.

| # | Current (wrong) | Correct | Where |
| --- | --- | --- | --- |
| 1 | `Ubytování poskutuje kapacitu` | `Ubytování poskytuje kapacitu` | `/` — Ubytování section |
| 2 | `Chalupa disponuje mednou krytou terasou` | `Chalupa disponuje jednou krytou terasou` | `/` — Ubytování section |
| 3 | `K objedou vede vlastní příjezdová cesta` | `K objektu vede vlastní příjezdová cesta` | `/` — Ubytování section |
| 4 | `KONTAKTUJE NÁS` | `Kontaktujte nás` | `/o-nas/`, `/tipy-na-vylety/` — CTA button |
| 5 | `Vánoce 23.-26.12.2024` | current-year dates, from the client | `/volne-terminy-a-ceny/` |
| 6 | `311 Kč na noc za osobu` | do not reproduce as a bare number — see §2 | `/` — pricing band |
| 7 | `parkovaní je možné pro 4 auta` | `parkování je možné pro 4 auta` | `/o-nas/` |
| 8 | `koupena se sprchovým koutem` (twice) | `koupelna se sprchovým koutem` | `/ubytovani/` — Ložnice a pokoje |
| 9 | `bobový dráha` | `bobová dráha` | `/` — Dolní Morava section |
| 10 | `Heřmanice u Králik` | `Heřmanice u Králík` | `<meta name="description">`, homepage |
| 11 | `pod masivem Kralického Sněžníku` | `pod masivem Králického Sněžníku` | `<meta name="description">`, homepage |
| 12 | `Sauna a hot tube je zpoplatněna` | `Sauna a hot tub jsou zpoplatněny` | `/volne-terminy-a-ceny/` — fees |
| 13 | `© 2019 Chalupa Heřmanka` | current year, generated — never hardcoded | footer, every page |

Note that #10 and #11 are in the meta description, which is what Google shows in the
result snippet. They have been wrong in the search results for years.

### `hot tube` — a decision, not a typo

The string `hot tube` / `HotTube` appears at least five times across the site
(hero slide, wellness section, amenity list, fees paragraph, site plan graphic).
It is not English — the object is a *hot tub*. But it has been used consistently
enough that it reads as the client's own name for the thing.

**Do not silently change it.** Ask the client (listed below). The recommendation is
Czech `vířivka` in body copy with `hot tub` where an English word is wanted, and a
single spelling everywhere including the site-plan artwork. Whatever is chosen, it
must be applied to all five occurrences at once.

---

## 2. The `311 Kč` problem

Current homepage pricing band, verbatim:

> Chalupa Heřmanka stojí v sezóně
> při plném obsazení 311 Kč na noc za osobu
> a to opravdu není drahé.

This number is hardcoded in the page and no longer follows from the price list.
Against the current published prices — 30 000 Kč per week in season, 15 people,
7 nights — the arithmetic gives **285,71 Kč**, not 311 Kč. Add the per-person water
charge (100 Kč/pobyt) and the municipal recreation fee (4 Kč/osoba/noc) and it comes
to roughly 304 Kč, still not 311, and still excluding electricity, which is metered
and unknown in advance.

So the number is wrong three times over: it is stale, it cannot be verified, and it
quietly excludes fees the guest will actually pay.

**Rule for the rebuild:** no per-person, per-night figure may be written into copy.
If a "from" price is wanted, it is **derived at build time from the price list**, and
it is labelled as excluding metered electricity and fees. One source of truth — the
`ceník` data — and everything else computes from it. This is the single biggest cause
of rot on the current site and the rebuild exists partly to end it.

`a to opravdu není drahé` ("and that really isn't expensive") is the client arguing
with the reader. **REWRITE** — state the number and let it do the work.

---

## 3. Global — appears on every page

### 3.1 Primary navigation

| Current label | New destination | Status |
| --- | --- | --- |
| `O nás` | `/chalupa` (merged) | **REWRITE** — see 04-pages |
| `Ubytování` | `/chalupa` | **KEEP** label |
| `Video` | `/chalupa#video` | **REWRITE** — the current `/video/` URL **404s**. The nav has pointed at a dead page for an unknown length of time. |
| `Volné termíny a ceny` | `/terminy-a-ceny` | **KEEP** label |
| `Tipy na výlety` | `/okoli` | **KEEP** label |
| `Kontakt` | `/kontakt` | **KEEP** |

New nav is six items or fewer, with a persistent inquiry CTA. Proposed labels:
`Chalupa` · `Termíny a ceny` · `Okolí` · `Galerie` · `Kontakt` + button
`Nezávazná poptávka`. **NEEDS CLIENT INPUT** on the CTA wording.

### 3.2 Logo / brand mark

`CHALUPA HEŘMANKA` under a hand-drawn roof mark. **KEEP** — it is the only piece of
the 2019 site worth carrying over, and the whole illustration language in
[02-design-system.md](02-design-system.md) is built to match it. Needs re-supply as
clean SVG. **NEEDS CLIENT INPUT** — vector original.

### 3.3 Footer

- `© 2019 Chalupa Heřmanka` — **REWRITE**, generated year.
- Footer nav repeats the header nav — **KEEP**.
- Missing and required: address, phone, email, GPS, IČO if the let is a registered
  business, and a link to privacy terms for the form. **NEEDS CLIENT INPUT**.

### 3.4 Cross-page CTA block

> `Máte zájem o ubytování nebo informace?` + button `KONTAKTUJE NÁS`

Appears at the foot of `/o-nas/` and `/tipy-na-vylety/`. **REWRITE** — fix the verb
(error #4) and point it at the inquiry form with dates, not at a bare contact page.

---

## 4. `/` — Domů

### 4.1 Hero carousel — five slides

| # | Czech | Status |
| --- | --- | --- |
| 1 | `Stylové ubytování u Dolní Moravy a Králického Sněžníku` | **KEEP** as the single hero line |
| 2 | `Pro rodiny s dětmi, skupinky přátel, firemní akce, svatby, oslavy…` | **KEEP** — moves to a subhead |
| 3 | `Terasa s venkovním krbem a posezením, okolo protékající potůček` | **REWRITE** into the terrace section |
| 4 | `Kapacita 2 až 15 osob ve 3 ložnicích, krb a stylové vybavení` | **KEEP** as a fact strip |
| 5 | `Venkovní sauna, jezírko, HotTube a venkovní posezení` | **REWRITE** into the wellness section |

Slide CTA on every slide: `Vybavení chalupy`.

> **DROP the carousel itself.** Five auto-rotating slides on the highest-value screen
> on the site, each with the same button — this is five chances to show the guest the
> one thing they did not want. It also costs a hero-sized image download per slide.
> One still hero, one line, one CTA. The other four slides' content is not lost; it
> is redistributed as marked above.

### 4.2 O nás teaser

> `Chalupa Heřmanka se nachází v malé obci Heřmanice u Králík, která je situována
> v malebném údolí pod masivem Králického Sněžníku. Jedná se o kompletně
> zrekonstruovaný dvoupodlažní objekt, zasazený do zalesněné stráně. Chalupa
> k pronajmutí poskytuje ubytování pro 2 až 15 osob ve 3 ložnicích.`

**KEEP** — this paragraph is correct, and it is the clearest thing on the site.
Button `VÍCE O NÁS` → **REWRITE** to point at `/chalupa`.

### 4.3 Příroda a okolí teaser

> `Příroda, lyžování historie i památky`
> `V nejbližším okolí se nachází ski areál Dolní Morava a Červená Voda, město Králíky
> s proslaveným poutním místem: Klášter Hedeč, vojenské muzeum a mnoho dalšího.`

**KEEP**. The heading is missing a comma — `Příroda, lyžování, historie i památky`.
Button `TIPY NA VÝLETY` → `/okoli`.

### 4.4 Ubytování teaser

> `Ubytování v jedinečném prostředí`
> `Ubytování poskutuje kapacitu 2 až 15 osob ve 3 ložnicích.`
> `Chalupa disponuje mednou krytou terasou s venkovním krbem s výhledem na pastviny
> a okolo protékající potůček a jednou otevřenou terasou s výhledem do zalesněného
> údolí.`
> `K objedou vede vlastní příjezdová cesta a parkování je možné pro 4 auta přímo
> u objektu.`

**REWRITE** — carries errors #1, #2 and #3. The corrected text already exists on
`/o-nas/`, which says `jednou krytou terasou` and `K objektu vede`. Use that version.

### 4.5 Site plan illustration — `situace`

Hand-drawn white labels over an aerial photograph. Label text, all **KEEP**:

`Potůček` · `Jezírko` · `Sauna` · `Hot Tube` · `Terasa — Venkovní krb s posezením` ·
`Balkon` · `Posezení` · `Houpačky` · `Ohniště` · `P` (parking) ·
`Mezonetová ložnice 2+3 os.` · `Ložnice přízemí 2 os.` ·
`Mezonetová ložnice 6+2 os.` · `Obývák + Kuchyň` · `2x Koupelna 2x WC`

This graphic is the authoritative capacity breakdown and it agrees with the brief.
Source files: `img/situace1-1.webp`, `img/situace2.webp`.

**REWRITE as inline SVG** — the labels are currently baked into a raster image, so
they are invisible to search, unreadable to a screen reader, and unfixable when
`Hot Tube` is renamed. Photograph stays raster, labels become live SVG text.
See the illustration rule in [02-design-system.md](02-design-system.md).

### 4.6 Video / gallery block

> `Prohlédněte si vybavení chalupy a veškeré možnosti vyžití, které vám nabízí.`

**KEEP** the sentence. YouTube video `-U_w_kwtzjI`, currently embedded as a live
iframe on page load — **REWRITE** to the facade pattern in
[03-tech.md](03-tech.md), or drop the video from the homepage entirely and leave it
on `/chalupa#video`.

### 4.7 Wellness

> `Venkovní sauna, jezírko, HotTube a venkovní posezení`
> `Dopřejte si dokonalý relax v naší venkovní sauně s výhledem do přírody.`
> `Po saunování se můžete osvěžit v jezírku nebo si užít teplou lázeň v dřevěném
> HotTube pod širým nebem.`
> `K dispozici je také venkovní posezení, kde si můžete vychutnat klid a pohodu
> v jedinečném horském prostředí.`

**KEEP**, subject to the `hot tube` decision. This is the strongest writing on the
site. One addition needed: the sauna and hot tub are **chargeable** (1 000 Kč/day,
3 000 Kč/week) and that fact currently lives only in a fee paragraph three pages
away. It belongs here too.

### 4.8 Dolní Morava

> `Na DOLNÍ MORAVU dorazíte z Heřmanky za 12 minut`
> `Ať už je ve vašem hledáčku top lyžařský resort s více než deseti kilometry plně
> zasněžených sjezdovek, Stezka v oblacích, Sky bridge nebo bobový dráha, nebo se jen
> tak chcete potulovat po hřebenech hor a užívat krás přírody.`

**REWRITE** — error #9 (`bobový` → `bobová`), and the sentence has no main clause;
it is a subordinate clause left hanging. Also standardise `Sky bridge` → `Sky Bridge
721`, which is the attraction's actual name and is written correctly on
`/tipy-na-vylety/`. Image: `img/dolnimorava.webp`.

### 4.9 Pricing band

Covered in §2. **REWRITE** entirely.

> `Pokud se vám nepodaří chalupu plně obsadit, můžete využít slevu 10 % z plné ceny.`

**NEEDS CLIENT INPUT** — this contradicts the price list, which says
`V případě počtu ubytovaných pod 10 osob je možná sleva` (a discount *may be*
possible under 10 people). One says 10 % unconditionally, the other says maybe.
Which is it?

Button `PŘEJÍT NA CENY` → `/terminy-a-ceny`.

### 4.10 Kontaktní formulář

Heading `Kontaktní formulář` — **REWRITE**, it describes the widget rather than the
offer. Something closer to `Napište si o termín`. Form itself: §8.

---

## 5. `/chalupa` — from `/o-nas/`, `/ubytovani/`, `/video/`

### 5.1 O nás paragraph

> `Chalupa Heřmanka se nachází v malé obci Heřmanice, která je situována v malebném
> údolí pod masivem Králického Sněžníku. Jedná se o kompletně zrekonstruovaný
> dvoupodlažní objekt zasazený do zalesněné stráně. Chalupa disponuje jednou krytou
> terasou s venkovním krbem s výhledem na pastviny a okolo protékající potůček
> a jednou otevřenou terasou s výhledem do zalesněného údolí. K objektu vede vlastní
> příjezdová cesta a parkovaní je možné pro 4 auta přímo u objektu.`

**KEEP** with error #7 fixed (`parkovaní` → `parkování`). This is the corrected
master version of the homepage teaser text.

### 5.2 `V okolí naleznete` — the distance table

**KEEP** all of it. This is quietly the most useful content on the site.

| Label | Value |
| --- | --- |
| `Autobus` | `Heřmanice (500 m)` |
| `Vlak` | `Prostřední Lipka (2 km)` |
| `Restaurace` | `Penzion Heřmanice (500 m), Králíky (3 km)` |
| `Koupání` | `Králíky bazén 3 km, Pastviny vodní nádrž 17 km` |
| `Lyžařský vlek` | `Ski areál Dolní Morava, vzdušnou čarou 3 km` |
| `Obchod` | `Prostřední Lipka (2 km), Králíky (3 km)` |
| `Pošta` | `Králíky – 3 km` |
| `Nákupní centrum` | `Penny market Králíky (3 km)` |
| `Bankomat` | `Králíky – 3 km` |
| `Les` | `10 metrů, hned za chalupou` |

`Les — 10 metrů, hned za chalupou` is the best line on the entire website. Give it
room.

### 5.3 Ložnice a pokoje

> `V 1. NP se nachází prostorný obývací pokoj s krbem spojený dohromady s prostornou
> kuchyní. Dále je zde menší pokoj (sousedící přímo s krytou terasou) s kapacitou
> 2 dospělé osoby s dítětem. V přízemí se nachází samostatné WC a koupena se
> sprchovým koutem.`
>
> `2. NP obsahuje jednu menší mezonetovou ložnici s kapacitou 3 až 4 osoby dole
> a 2 osoby v horním patře. Tato ložnice má vstup na venkovní nekrytou terasu. Dále
> je zde větší mezonetová ložnice s kapacitou 6 až 8 osob dole a 2 osoby v horním
> patře. V tomto patře se nachází i koupena s prostornou vanou, samostatné WC
> a prací a sušící kout.`

**REWRITE** — error #8 twice, and **this is the source of the capacity conflict**
flagged in [00-brief.md](00-brief.md). The per-room numbers here total up to 19
against a stated house maximum of 15. Rebuild this as a room table matching the site
plan (2 / 2+3 / 6+2 = 15) and confirm with the client before publishing.

### 5.4 Sociální zařízení

> `V prvním patře je jedno samostatné WC, dále koupelna se sprchovým koutem,
> umyvadlem a zrcadlem a žebříkovým topením. V druhém patře je opět samostatné WC,
> koupelna s prostornou vanou, umyvadlem a žebříkovým topením.`

**KEEP**. Minor **REWRITE** for the floor-naming clash: this section says
`prvním patře` / `druhém patře` while §5.3 says `1. NP` / `2. NP` / `přízemí` for the
same two floors. Pick one scheme for the whole site.

### 5.5 Vytápění

> `Vytápění objektu zajišťuje peletkový kotel, dále krbová vložka, kde palivo je
> dřevo v kombinaci s akumulační nádrží nahřívanou elektrickými spirálami. Je možné
> topit jen krbem, od kterého jsou horkovzdušné rozvody do horních ložnic, nebo
> využít komfortu kombinace peletkového kotle a el. vytápění akumulační nádrží,
> popřípadě oba režimy kombinovat.`

**KEEP**. Reads like a boiler manual but every word of it answers a real winter
question. Light **REWRITE** for rhythm only; change no facts. Cross-link to the
metered-electricity charge, because the two are the same subject to a guest.

### 5.6 Doprava, parkování

> `K objektu vede příjezdová cesta dimenzovaná i na nákladní automobil. Přímo
> u objektu je parkoviště pro 3 až 4 auta. Dále je možné auta zaparkovat na
> příjezdové cestě, kam se vejdou další 4 osobní automobily.`

**KEEP**. Note the `3 až 4` here versus `4` on `/o-nas/` and in the brief. Minor, but
pick one — the brief says four at the building plus more on the drive.

### 5.7 Stravování

> `Přímo v obci 5 minut chůze se nachází farma, kde se denně prodává čerstvé mléko
> a sýry. Ještě blíže se nachází penzion, kde se vaří. Doporučujeme restauraci
> Kačenka u Kláštera Hedeč s vynikající domácí kuchyní.`

**KEEP**. **NEEDS CLIENT INPUT** — is the farm still selling, is the penzion still
cooking, is Kačenka still open? Three third-party businesses in three sentences, on
a page last touched in 2019.

### 5.8 Vybavení chalupy — prose

> `Obývací pokoj je vybaven krbem, stolem, koženou sedačkou a velkou plochou TV
> s více než 100 kanály. Kuchyně je plně vybavena a to: troubou, varnou deskou,
> lednicí, kávovarem, rychlovarnou konvicí, myčkou na nádobí a mikrovlnou troubou
> (příbory a talíře, sklenice jsou samozřejmostí). V objektu je k dispozici i pračka
> a sušička.`
> `Ložnice jsou vybaveny postelemi s pohodlnými novými matracemi a skříněmi.`
> `Terasa (spodní) disponuje venkovním krbem a posezením. Horní terasa disponuje
> posezením.`

**KEEP**, light **REWRITE**. `novými matracemi` — "new" mattresses, written in 2019.
Drop the word or date it. `více než 100 kanály` is a 2019 selling point; consider
dropping.

### 5.9 `Přehled vybavení` — amenity checklist

Five groups, **KEEP** as structured data rather than five bullet lists:

- **Obecně:** `domácí mazlíček povolen` · `wifi, internet` · `nekuřácký objekt` ·
  `společenská místnost` · `bezbariérové ubytování`
- **Vnitřní vybavení:** `krb / krbová kamna` · `televize` · `přehrávač` ·
  `satelitní příjem` · `rychlovarná konvice` · `lednička` · `myčka nádobí` ·
  `mikrovlnná trouba` · `pračka` · `sprchový kout` · `vana` ·
  `sauna nebo infrasauna` · `hot tube`
- **Venkovní vybavení:** `terasa` · `krb` · `zahradní nábytek` · `ohniště` · `gril`
- **Okolí chalupy:** `s parkováním` · `se zahradou` · `travnatá plocha` ·
  `u potoku` · `u lesa`
- **Možnosti zábavy v okolí:** `půjčovna kol` · `přírodní koupání` ·
  `koupaliště nebo bazén` · `cykloturistika` · `jízdárna` · `tenisové kurty` ·
  `golfové hřiště` · `rybaření`

Three items need checking before they ship:

- `bezbariérové ubytování` — **NEEDS CLIENT INPUT.** A two-storey cottage on a
  forested slope with two mezzanine bedrooms is claiming step-free access. If this is
  wrong it is the kind of wrong that ends with a wheelchair user at the door. Ground
  floor does have a bedroom, a WC and a shower, so there may be a defensible narrower
  claim — but it must be stated precisely, not as a tick-box.
- `domácí mazlíček povolen` — **NEEDS CLIENT INPUT.** Not mentioned anywhere in the
  terms or the fees. Any charge? Any limit?
- `sauna nebo infrasauna` — **REWRITE.** "Sauna or infrared sauna" reads as though we
  do not know which one we own. It is an outdoor sauna; say so.

The `Možnosti zábavy v okolí` group is third-party and undated — golf course, riding
school, tennis courts, bike hire. **NEEDS CLIENT INPUT** on whether these still exist
and how far away they are. A bare list with no distances is close to useless anyway;
give each a distance or drop it.

### 5.10 Video

YouTube `-U_w_kwtzjI`, titled `Chalupa Heřmanka`. **KEEP** the video, **REWRITE** the
embed — facade pattern only. Note the old `/video/` route currently **404s** while
still being linked from the main nav on every page.

---

## 6. `/terminy-a-ceny` — from `/volne-terminy-a-ceny/`

### 6.1 Ceník intro

> `Kapacita 2 až 15 osob - 3 ložnice. Minimální délka ubytování 2 noci.`
> `Měsíce leden/únor a červenec/srpen přijímáme objednávky pouze na celé týdny.`

**KEEP**. Replace the hyphen with an en dash. The whole-weeks-only rule for
January/February and July/August is important and currently buried — surface it next
to the calendar, where someone is about to pick a weekend in July.

### 6.2 Price list

`Ceny za týden za celou chalupu`

| Season | Czech label | Price |
| --- | --- | --- |
| Winter | `Zimní sezona — prosinec-půlka března` | `30 000 Kč` `týden/chalupa` |
| Summer | `Letní sezona — červen-půlka září` | `30 000 Kč` `týden/chalupa` |
| Off-season | `Mimo sezonu` | `26 000 Kč` `týden/chalupa` |

`Ceny za víkend za celou chalupu`

| Season | Czech label | Price |
| --- | --- | --- |
| Winter | `Zimní sezona — prosinec-půlka března` | `15 000 Kč` `víkend/chalupa` |
| Summer | `Letní sezona — červen-půlka září` | `15 000 Kč` `víkend/chalupa` |
| Off-season | `Mimo sezonu` | `13 000 Kč` `víkend/chalupa` |

**KEEP** the numbers, **REWRITE** the presentation into one table with seasons as
rows. Six near-identical cards to express four distinct prices is five cards too
many.

`půlka března` / `půlka září` — **NEEDS CLIENT INPUT.** "Half of March" is not a
date. The season boundary decides the price, so it needs to be exact (15. 3.?
31. 3.?). This must become machine-readable data — see §6.6.

`víkend` is undefined. Two nights? Fri–Sun? Three on a bank holiday? **NEEDS CLIENT
INPUT.**

### 6.3 Silvestr a Vánoce

> `Silvestr — 35 000 Kč / 3 noci`
> `Srdečně vás zveme, abyste s námi oslavili příchod nového roku v pohodlném,
> rodinném a pohodovém prostředí. Více informací vám rádi poskytneme na uvedeném
> telefonním čísle.`

**KEEP** the copy. **NEEDS CLIENT INPUT** — which three nights, for the coming
season? No dates are given at all.

> `Vánoce — 23.-26.12.2024 — 18 000 Kč`
> `Vánoce jsou obdobím radosti a pohody. Proč letos nezažít tu nejúžasnější atmosféru
> na naší Heřmance? Chceme vás srdečně pozvat, abyste strávili svátky v příjemném
> prostředí, obklopeni přírodou a tím nejlepším, co život nabízí.`

**REWRITE** — error #5. The word `letos` ("this year") sitting next to a 2024 date is
the clearest possible signal that nobody is minding the site. Dates come from data
and the block hides itself once the date has passed; see §6.6.

### 6.4 `Provoz, poplatky, ceny`

> `Objekt je v provozu celoročně, mimo doby údržbových prací (info na uvedených
> kontaktech).`
>
> `Platba probíhá převodem na účet a to zálohou 50 % z ceny nájmu a vody nejpozději
> dva týdny před plánovaným a rezervovaným pobytem.`
>
> `Doplacení taktéž probíhá převodem/vkladem na účet s připsáním na náš účet
> nejpozději v den příjezdu, nebo osobně při příjezdu a předání objektu. K ceně se
> dopočítává cena el. energie dle skutečné spotřeby, momentálně 7 Kč/kWh a poplatek
> 100 Kč na osobu za vodu/pobyt plus poplatek 4 Kč osoba/noc rekreační poplatek
> obci.`
>
> `Před příjezdem se skládá kauce 2 000 Kč (lze použít k zaplacení el. energie
> a vody). Kauce se v případě neškodného průběhu vrací. V případě počtu ubytovaných
> pod 10 osob je možná sleva. Sauna a hot tube je zpoplatněna 1 000,- Kč/den užívání.
> Při týdenním pobytu 3 000,- Kč za týden.`

**REWRITE** — the facts are all needed, the wall of text is not. Break into a fee
table (electricity, water, recreation fee, deposit, sauna/hot tub) plus a short
payment-terms list. Fix error #12.

`momentálně 7 Kč/kWh` — **NEEDS CLIENT INPUT**, and it must live in data with a
"valid from" date, not in a sentence. Same class of problem as the 311 Kč.

`4 Kč osoba/noc rekreační poplatek obci` — **NEEDS CLIENT INPUT.** The Czech
municipal *poplatek z pobytu* is set by local ordinance and 4 Kč is low for 2026.
Confirm the current rate with the obec.

`V případě počtu ubytovaných pod 10 osob je možná sleva` — conflicts with the
homepage's flat 10 %. See §4.9.

Missing from the terms entirely, all **NEEDS CLIENT INPUT**:
check-in / check-out times · cancellation terms · what is included (bed linen?
towels? firewood? pellets?) · smoking · pets (the amenity list says yes, the terms
are silent) · quiet hours · maximum number of cars.

Bed linen in particular is the single most-asked question for a Czech chalupa let and
the site does not answer it anywhere.

### 6.5 `Obsazenost chalupy` — availability calendar

Currently an iframe: `obsazenost.e-chalupy.cz/kalendar.php?id=2096` — 12 months, a
legend of `Volno` / `Obsazeno` / `Den příjezdu` / `Den odjezdu`.

**KEEP** the concept and the four legend states. **REWRITE** as our own component —
see [03-tech.md](03-tech.md) §Availability, and note the open question there about
where the feed actually comes from, which is currently the largest unknown in the
project.

### 6.6 Data, not copy

Everything in §6.2–§6.4 must land in a typed content collection, not in page markup:
seasons with real start/end dates, weekly and weekend rates, holiday blocks with
explicit dates and an expiry, and the fee schedule. Pages compute from it. That way
a stale date is a build-time problem rather than something a guest finds first.

---

## 7. `/okoli` — from `/tipy-na-vylety/`

### 7.1 `Výlety, atrakce, zábava`

> `Hlavní turistickou atrakcí v okolí je ski areál Dolní Morava (vzdušnou čarou asi
> 3 km) se svými dominantami Stezkou v oblacích a Sky Bridge 721. V tomto areálu se
> nachází spousta sjezdovek, v zimě k lyžování a snowboardingu a v létě na sjezdy
> kol, bobová dráha pro boby na kolečkách, zábavní areály pro děti Mamutíkův vodní
> park, Lesní zážitkový park, Pískový svět. Přímo u chalupy se dá napojit na spoustu
> turistických stezek a to i na turistickou stezku kde po 14 km dorazíte na vrchol
> Králického Sněžníku.`
>
> `V okolí se také nachází vojenské muzeum, klášter a sjezdovky v Červené vodě
> a Čenkovicích.`

**KEEP** the content, **REWRITE** into cards with a distance and a season on each.
Note `bobová dráha` is spelled correctly here and wrongly on the homepage (#9), and
`Sky Bridge 721` is correct here and wrong on the homepage.

Also: `14 km` to the summit here versus `17 km / 4 h 15 min` on the site-plan
graphic. **NEEDS CLIENT INPUT** — pick one.

`Červené vodě` should be `Červené Vodě` — Červená Voda is a place name, both words
capitalised.

### 7.2 `Koupání v okolí`

> `přehrada Pastviny, koupaliště Králíky, bazén Mezilesí, Hynčice pod Sušinou –
> rybník Úžas, koupaliště Jablonné nad Orlicí, koupaliště Kunvald, Štíty – Acrobat
> Park, koupaliště Ruda nad Moravou, aquapark Žamberk, koupaliště Rokytnice
> v Orlických horách, koupaliště Letohrad`

**REWRITE** — eleven places in one comma-separated run, no distances, no order.
Needs distances and a sort by distance, or a cut to the nearest four.

### 7.3 `Blízká lyžařská střediska`

> `Dolní Morava – Větrný vrch, Dolní Morava – Sněžník, Malá Morava – Vysoká, Šanov,
> Mladkov – Petrovičky, Hynčice – Kraličák`

**REWRITE** — same treatment. Distances and drive times.

### 7.4 Regional map illustration

Hand-drawn labels over an aerial photograph, all **KEEP**:

`Polsko — Międzygórze a Bílá Voda Sjezdovky — 30-60 min` ·
`Klepáč 1145 m n. m. — Vrchol Klepý, který je rozvodím do trojice evropských moří —
8 km / 2h 15 min` ·
`Králický Sněžník 1423 m n. m. — Pod vrcholem vyvěrá pramen řeky Moravy s překrásným
výhledem do údolí — 17 km / 4h 15 min` ·
`Dolní Morava — Lyžařské středisko, Stezka v oblacích, SkyBridge, Bobová dráha —
9 km / 12 min` ·
`Klášter Hedeč — Mariánské poutní místo s monumentálním barokním klášterem
s kostelem Nanebevzetí Panny Marie — 11 km / 17 min` ·
`Králíky`

Same treatment as §4.5 — labels become inline SVG text over the photograph. Note
`SkyBridge` here versus `Sky Bridge 721` in §7.1 versus `Sky bridge` on the homepage:
three spellings of one bridge.

---

## 8. `/kontakt` and the inquiry form

### 8.1 Contact details

> `Chalupa Heřmanka`
> `Heřmanice u Králík`
> `+420 603 285 524`
> `50.13088N, 16.75827E`

**KEEP**. Missing: **email address** — the site has no published email at all, only a
third-party form. Also missing: owner name, house number, postcode, IČO.
**NEEDS CLIENT INPUT** on all of them.

### 8.2 The inquiry form

Currently an iframe from `e-chalupy.cz`. Field labels, transcribed from the rendered
widget — **KEEP** the field set, rebuild the form natively:

| Field | Czech label | Helper text | Required |
| --- | --- | --- | --- |
| Email | `Váš email` | `povinná položka` | yes |
| Name | `Vaše jméno` | — | no → **make required** |
| Phone | `Telefon` | — | no |
| Dates | `Požadovaný termín` | `např. 20-27.9.2026` | no → **make required** |
| Adults | `Počet dospělých` | — | no |
| Children | `+ počet dětí` | `případné upřesnění napište do textu zprávy` | no |
| Message | `Text zprávy:` | — | no |
| Copy to sender | `poslat mi na email kopii` (checkbox) | — | — |
| Submit | `ODESLAT EMAIL` | — | — |

Above the date fields, verbatim:

> `Pro urychlení odpovědi doporučujeme vyplnit termín a počet osob, pokud je to
> možné.`

**REWRITE.** The single job of this site is an inquiry *with dates*, and the form
currently asks for dates apologetically, as an optional nicety. Dates and party size
become required; the message becomes optional. The helper sentence goes away because
the form no longer needs to ask nicely for the thing it exists to collect.

`ODESLAT EMAIL` → **REWRITE**. It names the transport, not the outcome.
`Odeslat poptávku` or similar. **NEEDS CLIENT INPUT** on final wording.

`např. 20-27.9.2026` — **KEEP** the example, keep the field a free-text input.
A date-range picker that rejects `20.-27.9.` would cost us inquiries. Parse
leniently server-side, never block on format.

Missing and required before launch: a GDPR consent line and a link to how the data
is handled. The form emails personal data to the owner; it needs one sentence and a
link. **NEEDS CLIENT INPUT.**

---

## 9. Everything blocked on the client

Collected from the sections above. Nothing here is optional.

**Blocks launch**

1. Room-by-room capacity — resolve 15 vs the up-to-19 in the old prose (§5.3)
2. `bezbariérové ubytování` — is any accessibility claim true, and how narrow (§5.9)
3. Christmas dates and price for the coming season (§6.3)
4. Silvestr dates for the coming season (§6.3)
5. Exact season boundaries — what `půlka března` and `půlka září` mean as dates (§6.2)
6. Definition of `víkend` (§6.2)
7. Current electricity rate and current municipal recreation fee (§6.4)
8. The discount rule — flat 10 %, or "possible" under 10 people (§4.9, §6.4)
9. Check-in / check-out times (§6.4)
10. Cancellation terms (§6.4)
11. What the price includes — bed linen, towels, firewood, pellets (§6.4)
12. Pets — allowed, charged, limited? Amenity list and terms disagree (§5.9, §6.4)
13. Public email address (§8.1)
14. GDPR line and privacy link for the form (§8.2)
15. Where availability data will come from (see [03-tech.md](03-tech.md))

**Blocks content quality, not launch**

16. `hot tube` — final spelling, applied everywhere including artwork (§1)
17. Logo as vector (§3.2)
18. Distance to the Sněžník summit — 14 km or 17 km (§7.1)
19. Are the farm, the penzion and restaurace Kačenka still operating (§5.7)
20. Do the golf course, riding school, tennis courts and bike hire still exist,
    and how far away (§5.9)
21. Distances for the swimming and skiing lists (§7.2, §7.3)
22. Nav CTA and submit-button wording (§3.1, §8.2)
23. IČO and business identification for the footer (§3.3)
24. Whether to keep Google Tag Manager at all (see [03-tech.md](03-tech.md))

---

## 10. Content we do not have and should get

Not on the current site, worth asking for while we have the client's attention:

- **German copy** for the `/de/` locale, or the budget to translate.
- **Guest reviews.** The brief mentions German-language reviews exist. Social proof
  is the cheapest conversion win available and there is none on the site today.
- **Photography with people in it.** Every photograph is an empty room. The audience
  is a group of twelve; show a table with twelve people at it.
- **A winter photograph of the interior with the fire lit.** The heating section is
  doing sales work with no picture behind it.
- **Floor plans.** The site plan covers the outside; the capacity confusion in §5.3
  would not survive an actual plan of the two floors.
- **A share image.** `BaseLayout` points `og:image` at `/og-default.webp`, which does
  not exist yet. It needs a 1200×630 crop — currently every link shared to Messenger
  or WhatsApp would render without a picture.
