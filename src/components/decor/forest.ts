/**
 * Plants the two treelines.
 *
 * The first version of both was hand-authored: forty-odd `[x, scale, shape, dy]`
 * tuples typed out by hand per rank. That is unmaintainable at the density a wood
 * actually needs — and worse, a human typing coordinates produces an obvious
 * rhythm. Spacing landed on a beat, scales alternated big-small-big, and the
 * result read as a stamped border rather than as trees.
 *
 * So the ranks are generated. The randomness is what makes it look like a forest:
 * gaps that clump and then open into a clearing, scales drawn from a continuous
 * range instead of a shortlist, every second tree mirrored, and the odd giant
 * breaking the canopy line.
 *
 * ⚠ SEEDED, never `Math.random()`. The generator runs at BUILD time, so an
 * unseeded one would re-roll the whole wood on every build: the HTML would change
 * on every deploy, every cache would miss, and no diff would ever be reviewable.
 * The same seed always plants the same trees. To re-roll a rank deliberately,
 * change its seed and look at the result.
 */

/**
 * mulberry32. Thirty-two bits of state, no dependencies, and well-distributed
 * enough for scattering trees — this is decoration, not cryptography.
 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Tree {
  /** Trunk position along the ground line, in viewBox units. */
  x: number;
  /** Ground-line wobble for this trunk. A ruled-flat base reads as printed. */
  dy: number;
  /** Height scale. The shapes are drawn 112 units tall at scale 1. */
  s: number;
  /** Width scale — `s` nudged a little either way. See `girth`. */
  sx: number;
  /** Index into the caller's shape list. */
  shape: number;
  /** Mirrored, which doubles the apparent number of shapes for free. */
  flip: boolean;
}

export interface RankOptions {
  seed: number;
  /** viewBox width the rank has to cover. */
  width: number;
  /** How many shapes the caller has to choose from. */
  shapes: number;
  /** [tightest, loosest] distance between trunks. */
  gap: [number, number];
  /** [smallest, largest] ordinary tree. */
  scale: [number, number];
  /** Chance per tree of being an outlier that breaks the canopy line. */
  giants?: number;
  /** Ground-line wobble, plus or minus, in units. */
  wobble?: number;
  /**
   * How much the width may differ from the height scale, plus or minus. A stand
   * of spruce is not one tree at eight sizes: some are lanky, some are squat.
   *
   * Keep it small. Past about 0.2 the notches stop reading as notches — the same
   * reason `preserveAspectRatio` on both treelines is `slice` and never `none`.
   */
  girth?: number;
  /**
   * How far the middle of the rank drops, as a fraction of full height. 1 keeps
   * the rank level; 0.5 halves the trees across the middle.
   *
   * The footer treeline needs this. It overflows UPWARD out of the footer into
   * the section above, where the inquiry form sits — so the middle of the wood
   * has to stay low enough to leave that card in clear air, and only the outer
   * sixth at each edge is free to grow to full height.
   */
  saddle?: number;
}

/** Full height at both edges, dipping to `saddle` across the middle. */
function envelope(t: number, saddle: number): number {
  if (saddle >= 1) return 1;
  /*
   * How much of each end stays at full height. Narrow, on purpose: the low middle
   * is what lets the last section on the page end close to the footer instead of
   * reserving room for trees that only stand at the far edges. See the clearance
   * rule in global.css — these two numbers are a pair.
   */
  const shoulder = 0.12;
  if (t <= shoulder || t >= 1 - shoulder) return 1;
  const u = (t - shoulder) / (1 - 2 * shoulder);
  /* sin^0.7 rather than sin: a flatter bottom, so the low stretch is a valley
     across the middle third and not a single dip at dead centre. */
  return 1 - (1 - saddle) * Math.sin(Math.PI * u) ** 0.7;
}

const round = (n: number, places: number): number => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

/**
 * Walks the width dropping trees at irregular intervals. Trunks run off both
 * ends — a rank that starts and stops exactly at the viewBox edge leaves two
 * bald spots the moment the SVG is cropped.
 */
export function plantRank(o: RankOptions): Tree[] {
  const rnd = makeRng(o.seed);
  const { gap, scale, saddle = 1, wobble = 4, giants = 0, girth = 0.14 } = o;
  const trees: Tree[] = [];

  let x = -gap[1];
  while (x < o.width + gap[1]) {
    const env = envelope(x / o.width, saddle);

    let s = scale[0] + (scale[1] - scale[0]) * rnd();
    if (rnd() < giants) s *= 1.2 + rnd() * 0.35;
    s *= env;

    trees.push({
      x: round(x, 1),
      dy: round((rnd() * 2 - 1) * wobble, 1),
      s: round(s, 3),
      sx: round(s * (1 + (rnd() * 2 - 1) * girth), 3),
      shape: Math.floor(rnd() * o.shapes) % o.shapes,
      flip: rnd() < 0.5,
    });

    /*
     * Biased toward the tight end: most trees stand close to the next one, and
     * every so often the gap opens into a clearing. A uniform gap gives even
     * spacing with no clumping, which is the thing that looked stamped.
     */
    x += gap[0] + (gap[1] - gap[0]) * rnd() ** 1.9;
  }

  return trees;
}

/** `transform` for one tree. Mirroring is a negative x-scale about the trunk. */
export function transformFor(t: Tree, baseY: number): string {
  return `translate(${t.x} ${round(baseY + t.dy, 1)})scale(${t.flip ? -t.sx : t.sx} ${t.s})`;
}

/* ==========================================================================
   The spruce itself.

   The ranks above were generated from the start; the TREES were not. Both
   treelines were drawn from five hand-typed silhouettes, and those five were the
   thing that kept reading as clip art however they were coloured, faded or
   blurred. The reason is proportion. They were 60 units tall and 33 wide — a
   ratio of about 1.8, which is a Christmas-card tree. A Norway spruce standing
   in a wood is 3.5 to 4 times as tall as it is wide, and the difference between
   those two numbers is the whole difference between "forest" and "border
   pattern".

   Hand-typing eight tiers of notch coordinates for a tree that narrow, six or
   eight times over, with every flank different, is not work anybody should do
   twice. So the silhouettes are generated too, from the same seeded RNG and to
   the same rules the illustration guide sets out in docs/02-design-system.md §4:

     - **Deep notches.** Each tier runs out and down to a point, then the outline
       cuts back up and IN to roughly 40% of that tier's reach before the next
       one starts. §4 is explicit that a shallow notch closes up at small sizes
       and leaves a plain triangle, and that is exactly what happened the first
       time.
     - **Flanks never mirror.** Left and right are generated independently, with
       their own tier counts and their own jitter, so no tree is symmetrical
       about its trunk.
     - **The wobble is kept.** Reach, notch depth and tier spacing are all
       jittered. Nothing here is a primitive stamped at eight sizes.
     - **Lean.** A small horizontal offset that grows toward the tip, so the tree
       is not a plumb line. Real ones lean toward the light.

   Two details that are not obvious and were both arrived at by rendering the set
   and looking at it:

     - **There is a foot.** The lowest tier does not run to the ground at full
       reach; it stops just above it and the outline cuts in to a narrow base.
       Without that every tree ends in one heavy solid triangle, which is what a
       first version did, and the whole rank reads as bunting.
     - **Tier spacing is jittered but CLAMPED MONOTONIC.** Even spacing reads as
       a sawtooth; unclamped jitter lets two tiers swap order, and the outline
       then doubles back and the tree grows a sliver of a spike. `0.4 / n` is the
       minimum step that keeps it single-valued.
   ========================================================================== */

export interface SpruceOptions {
  seed: number;
  /** Tip to ground line, in viewBox units. The tip sits at `-height`. */
  height: number;
  /** Half-width of the skirt at the ground line. height / (2 × this) is the ratio. */
  halfWidth: number;
  /** [fewest, most] tiers per flank. Drawn per flank, so the two rarely agree. */
  tiers: [number, number];
  /** Maximum sideways offset of the tip, as a fraction of `halfWidth`. */
  lean?: number;
}

/** How far down the height the lowest tier sits. The rest below it is the foot. */
const SKIRT = 0.93;

/**
 * One flank, from the tip down to the ground line, as `[x, y]` pairs with x
 * positive. Every tier contributes its outer point and the notch that follows
 * it; the last entry is the foot, on the ground line.
 */
function flank(rnd: () => number, height: number, halfWidth: number, n: number): [number, number][] {
  const pts: [number, number][] = [];
  let prevY = -height;
  let prevU = 0;
  let lastX = halfWidth * 0.3;

  for (let k = 1; k <= n; k++) {
    /*
     * Jittered tier position, clamped so it can never fall level with or above
     * the tier before it — see the note on monotonicity above. `SKIRT` holds the
     * lowest tier just clear of the ground so there is room for the foot.
     */
    const jitter = ((rnd() * 2 - 1) * 0.55) / n;
    const u = Math.min(1, Math.max(prevU + 0.4 / n, k / n + jitter)) * SKIRT;
    prevU = u / SKIRT;

    /* `u ** 1.35` rather than `u`: tiers crowd toward the tip and open out
       toward the skirt, which is how a spruce actually grows. */
    const yOut = -height * (1 - u ** 1.35);
    /* Reach grows slightly FASTER than linearly. Slower — the first version's
       0.82 — fattens the crown and the tree stops being conical. */
    const xOut = halfWidth * u ** 1.12 * (0.85 + rnd() * 0.3);

    pts.push([round(xOut, 1), round(yOut, 1)]);

    const gap = yOut - prevY;
    /* Back in to 38–56% of the reach, and back UP a fraction of the way to the
       tier above. The pair of them is what makes a notch read as a notch. */
    const inset = 0.38 + rnd() * 0.18;
    const rise = gap * (0.12 + rnd() * 0.16);
    pts.push([round(xOut * inset, 1), round(yOut - rise, 1)]);

    prevY = yOut;
    lastX = xOut;
  }

  /* The foot. Narrow, on the ground line, and the reason no tree here ends in a
     solid triangle. */
  pts.push([round(lastX * 0.3, 1), 0]);

  return pts;
}

/**
 * A single spruce as an SVG path `d`. Crown only: the skirt closes on the ground
 * line at y = 0 and there is no trunk, so a rank of these reads as a wood rather
 * than as a row of lollipops. Tip at y = -height.
 */
export function makeSpruce(o: SpruceOptions): string {
  const rnd = makeRng(o.seed);
  const { height: H, halfWidth: W, tiers, lean = 0 } = o;

  const nR = tiers[0] + Math.floor(rnd() * (tiers[1] - tiers[0] + 1));
  const nL = tiers[0] + Math.floor(rnd() * (tiers[1] - tiers[0] + 1));
  const right = flank(rnd, H, W, nR);
  const left = flank(rnd, H, W, nL);

  /* Lean is applied last, scaled by how far up the tree the point is: the ground
     line does not move and the tip moves the most. */
  const dx = lean * W * (rnd() * 2 - 1);
  const bend = (x: number, y: number): string => `${round(x + dx * (-y / H), 1)} ${round(y, 1)}`;

  const parts = [`M${bend(0, -H)}`];
  for (const [x, y] of right) parts.push(`L${bend(x, y)}`);
  /* Across the skirt, then back up the far flank. */
  for (let i = left.length - 1; i >= 0; i--) parts.push(`L${bend(-left[i][0], left[i][1])}`);
  parts.push('Z');

  return parts.join(' ');
}

/** `count` spruces from one seed, each different from the last. */
export function makeSpruces(count: number, o: SpruceOptions): string[] {
  return Array.from({ length: count }, (_, i) => makeSpruce({ ...o, seed: o.seed + i * 7919 }));
}
