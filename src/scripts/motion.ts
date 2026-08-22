/**
 * The site's only JavaScript.
 *
 * WHY THERE IS A LIBRARY HERE AT ALL
 * ----------------------------------
 * The original motion system was `animation-timeline: view()`, which is
 * Chromium-only. On Safari and Firefox   between them most of this site's phone
 * traffic   every scroll reveal did precisely nothing, and the page that shipped
 * was not the page that was designed. Motion (motion.dev) drives the same
 * effects from IntersectionObserver, so they run everywhere, and its WAAPI
 * animations run off the main thread.
 *
 * The `mini` build of `animate` is imported deliberately: ~2.5 kB, and it hands
 * everything to the browser's own animation engine. `inView` comes from the main
 * entry because mini does not export it.
 *
 * THE RULE THAT MATTERS MOST
 * --------------------------
 * From docs/02-design-system.md §5.1: **content must never be able to get stuck
 * invisible.** Everything this file hides is hidden by a CSS rule gated behind
 * `.js-motion`, a class added by an inline script in BaseLayout's <head> which
 * also arms a 2 s failsafe timer. This module's first act is to cancel it. So:
 *
 *   - no JavaScript           → no class     → nothing was ever hidden
 *   - JS on, chunk 404s       → timer fires  → everything un-hides at 2 s
 *   - JS on, this file throws → timer fires  → everything un-hides at 2 s
 *   - reduced motion          → class removed below, immediately
 *
 * Only the success path hides anything, and only for a few hundred milliseconds.
 *
 * The second rule: everything here is decoration on top of markup that already
 * works. The lightbox triggers are real links to /galerie, the mobile menu is a
 * <details>, and Escape closes it.
 * Delete this file and the site is duller, not broken.
 */
import { animate } from 'motion/mini';
import { inView } from 'motion';

const root = document.documentElement;

declare global {
  interface Window {
    __hkMotionFailsafe?: number;
  }
}

/* We are alive; the <head> failsafe is no longer needed. */
clearTimeout(window.__hkMotionFailsafe);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Slow out, fast in. The JS twin of --ease-emphasized in global.css. */
const EASE = [0.2, 0, 0, 1] as const;
const DURATION = 0.62;

/* ==========================================================================
   Reveals
   ========================================================================== */

/**
 * ONE reveal: a fade and eight pixels. The from-state MUST match the
 * `.js-motion [data-reveal]` rule in global.css   CSS owns the resting state so
 * nothing flashes before this file runs, and this only replays it forwards.
 *
 * There were five variants and a per-child stagger. A page where every block
 * arrives from a different direction, one after another, is the single loudest
 * tell that nobody chose any of it; `data-reveal="left"` and friends still
 * parse, they just all land here.
 */
const REVEAL = { opacity: [0, 1], transform: ['translateY(8px)', 'none'] };

function reveal(el: HTMLElement): void {
  if (el.classList.contains('is-revealed')) return;
  el.classList.add('is-revealed');

  /*
   * Land the element on its finished state FIRST. If the animation is then
   * cancelled, dropped or never composited, it is already correct   the
   * animation is only ever the nice-to-have on top of it.
   */
  el.style.opacity = '1';
  el.style.transform = 'none';

  animate(el, REVEAL, { duration: DURATION, ease: EASE });
}

function setUpReveals(): void {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const stop = inView(
      el,
      () => {
        reveal(el);
        stop();
      },
      { amount: 0.2, margin: '0px 0px -8% 0px' },
    );
  });

  /*
   * Second backstop, and the important one.
   *
   * The `.js-motion` failsafe in <head> is cancelled the moment this module
   * loads, so from then on the only thing that un-hides a `[data-reveal]` is its
   * observer firing. Anything the observer never reports is invisible for good  
   * and there are real ways for that to happen: a target clipped to zero area, a
   * zero-height box, an ancestor with `overflow: hidden` and no scroll, a
   * `content-visibility` skip.
   *
   * So once loading has settled, sweep for anything still unrevealed that is
   * already at or above the fold and reveal it outright. Below-fold elements are
   * left alone   they are legitimately waiting their turn.
   */
  const sweep = (): void => {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.classList.contains('is-revealed')) return;
      if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
    });
  };

  window.addEventListener('load', () => setTimeout(sweep, 400), { once: true });
}

/* ==========================================================================
   Mobile navigation

   The panel is a <details>, which cannot be transitioned open   the browser
   flips `display` in a single frame. Animating the panel on `toggle` gets the
   motion without giving up the no-JavaScript behaviour: without this file the
   disclosure still opens, just instantly.
   ========================================================================== */

function setUpMobileNav(): void {
  const details = document.querySelector<HTMLDetailsElement>('.nav-mobile');
  if (!details) return;
  const panel = details.querySelector<HTMLElement>('.nav-mobile-panel');

  if (panel && !reducedMotion.matches) {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      animate(
        panel,
        { opacity: [0, 1], transform: ['translateY(-10px)', 'none'] },
        { duration: 0.26, ease: EASE },
      );
      panel.querySelectorAll<HTMLElement>('li, .nav-mobile-cta').forEach((item, i) => {
        animate(
          item,
          { opacity: [0, 1], transform: ['translateX(12px)', 'none'] },
          { duration: 0.3, delay: 0.05 + i * 0.035, ease: EASE },
        );
      });
    });
  }

  /* Escape closes it, the same as any other menu. Behaviour, so never gated. */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && details.open) {
      details.open = false;
      details.querySelector('summary')?.focus();
    }
  });

  /* So does clicking anywhere else. */
  document.addEventListener('click', (e) => {
    if (details.open && !details.contains(e.target as Node)) details.open = false;
  });
}

/* ==========================================================================
   Gallery lightbox

   A native <dialog>: the browser supplies the top layer, the focus trap,
   Escape-to-close and the backdrop. Every trigger is a real <a href="/galerie">,
   so without this file a click still goes to the gallery page.
   ========================================================================== */

function setUpLightbox(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#lightbox');
  const triggers = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-lightbox]'));
  if (!dialog || triggers.length === 0 || typeof dialog.showModal !== 'function') return;

  const img = dialog.querySelector<HTMLImageElement>('.lightbox-img');
  const counter = dialog.querySelector<HTMLElement>('.lightbox-count');
  if (!img || !counter) return;

  let index = 0;

  const show = (next: number, withSwap = true): void => {
    index = (next + triggers.length) % triggers.length;
    const trigger = triggers[index];
    const source = trigger.querySelector('img');
    if (!source) return;

    /* `data-lightbox` carries the large variant; the strip thumbnail is not it. */
    img.src = trigger.dataset.lightbox || source.currentSrc || source.src;
    img.alt = source.alt;
    counter.textContent = `${index + 1} / ${triggers.length}`;

    if (withSwap && !reducedMotion.matches) {
      animate(img, { opacity: [0, 1], transform: ['scale(0.985)', 'none'] }, {
        duration: 0.32,
        ease: EASE,
      });
    }
  };

  triggers.forEach((trigger, i) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      show(i, false);
      dialog.showModal();
    });
  });

  dialog.querySelector('.lightbox-prev')?.addEventListener('click', () => show(index - 1));
  dialog.querySelector('.lightbox-next')?.addEventListener('click', () => show(index + 1));
  dialog.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  /* A click on the dialog box itself, i.e. outside the figure, is the backdrop. */
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  /* Focus goes back to the thumbnail it was opened from. */
  dialog.addEventListener('close', () => triggers[index]?.focus());
}

/* ==========================================================================
   Gallery filmstrips

   /galerie lays each group out as a native horizontal scroller with CSS scroll
   snapping. It already swipes, snaps, and scrolls with the keyboard on its own,
   because the track carries `tabindex="0"` and a browser scrolls a focused
   scroll container with the arrow keys.

   This adds the two round arrows and nothing else. They carry `hidden` in the
   markup and are un-hidden here, so a failed chunk leaves a strip that still
   scrolls rather than two buttons that do nothing. Same contract as the hero
   controls above.
   ========================================================================== */

function setUpGalerieStrips(): void {
  document.querySelectorAll<HTMLElement>('.pas').forEach((pas) => {
    const track = pas.querySelector<HTMLElement>('[data-pas-stopa]');
    const controls = pas.querySelector<HTMLElement>('[data-pas-ovladace]');
    const prev = pas.querySelector<HTMLButtonElement>('[data-pas-zpet]');
    const next = pas.querySelector<HTMLButtonElement>('[data-pas-dalsi]');
    if (!track || !controls || !prev || !next) return;

    const tiles = Array.from(track.children) as HTMLElement[];
    if (tiles.length < 2) return;

    /* Earned it: the arrows do something now, so they may be seen. */
    controls.hidden = false;

    /*
     * One tile per press, not one viewport: the tiles are different widths
     * (every photograph keeps its own aspect ratio) so there is no fixed page to
     * scroll by, and landing between two pictures is the one outcome to avoid.
     *
     * The 2px tolerance absorbs sub-pixel scroll positions, which otherwise make
     * the "next" tile the one already on screen and the button appear dead.
     */
    const goTo = (direction: 1 | -1): void => {
      /*
       * Measured, not computed from offsetLeft. `offsetLeft` is relative to the
       * nearest positioned ancestor, which here is the strip wrapper rather than
       * the track, and the track carries a negative margin and a matching
       * padding so the two only agree by coincidence. Rectangles cannot drift.
       */
      const trackLeft =
        track.getBoundingClientRect().left +
        parseFloat(getComputedStyle(track).paddingInlineStart);

      const target =
        direction === 1
          ? tiles.find((tile) => tile.getBoundingClientRect().left > trackLeft + 2)
          : [...tiles].reverse().find((tile) => tile.getBoundingClientRect().left < trackLeft - 2);
      if (!target) return;

      track.scrollTo({
        left: track.scrollLeft + (target.getBoundingClientRect().left - trackLeft),
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    };

    /*
     * Disabled at the ends. `scrollWidth - clientWidth` is the maximum scroll
     * position; the 2px tolerance covers fractional layout widths, which
     * otherwise leave "next" enabled forever at the right-hand end.
     */
    const syncArrows = (): void => {
      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    };

    prev.addEventListener('click', () => goTo(-1));
    next.addEventListener('click', () => goTo(1));
    track.addEventListener('scroll', syncArrows, { passive: true });
    window.addEventListener('resize', syncArrows, { passive: true });

    syncArrows();
    /* Widths settle only once the lazy images have their boxes; re-check then. */
    window.addEventListener('load', syncArrows, { once: true });
  });
}

/* ==========================================================================
   Hero carousel

   Five photographs behind the headline. The project documentation argues against
   having one at all (docs/01-content.md §4.1, docs/02-design-system.md §5.3) and
   was overruled; src/data/hero.ts records that and the mitigations.

   Everything below is an ENHANCEMENT of markup that already works. Without this
   function the hero is slide one with a headline on it, the other four slides are
   transparent by a plain CSS rule, and the controls are `hidden` in the markup  
   so a failed chunk leaves a static hero rather than a blank one or a row of dots
   that do nothing. Never invert that by hiding slide one in CSS.
   ========================================================================== */

/*
 * How long each slide is held. The crossfade duration deliberately does NOT live
 * here   it is a CSS transition on `.hero-slide`, so JavaScript never needs to
 * know about it and the two cannot fall out of step.
 */
const SLIDE_MS = 5500;

function setUpHeroCarousel(): void {
  const hero = document.querySelector<HTMLElement>('.hero');
  const controls = hero?.querySelector<HTMLElement>('[data-hero-controls]');
  if (!hero || !controls) return;

  const slides = Array.from(hero.querySelectorAll<HTMLElement>('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll<HTMLButtonElement>('[data-hero-dot]'));
  const caption = hero.querySelector<HTMLElement>('[data-hero-caption]');
  if (slides.length < 2 || dots.length !== slides.length) return;

  /* Earned it: the controls do something now, so they may be seen. */
  controls.hidden = false;

  let index = 0;
  let timer = 0;
  /*
   * Two separate reasons to not be advancing, and they must not overwrite each
   * other: `paused` is now set by ONE thing only   `prefers-reduced-motion`  
   * and once set it stays set; `held` is a pointer resting on the hero or focus
   * inside it, and is released again on leave. Collapsing them into one flag is
   * how a carousel ends up permanently stopped after one hover.
   *
   * ⚠ There is no pause button any more: the carousel autoplays by request, see
   * the note beside the controls in Hero.astro. `paused` is what is left of the
   * WCAG 2.2.2 mechanism and it is the reduced-motion path   do not fold it into
   * `held` on the grounds that nothing sets it.
   */
  let paused = reducedMotion.matches;
  let held = false;

  function show(next: number): void {
    index = (next + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const current = i === index;
      slide.toggleAttribute('data-current', current);
      /* Only the visible photograph is in the accessibility tree   otherwise a
         screen reader meets five long alt strings before reaching the headline. */
      if (current) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });

    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });

    /* The dot's label already ends in the caption; reuse it rather than shipping
       the caption strings to the client a second time. */
    if (caption) {
      const label = dots[index].getAttribute('aria-label') ?? '';
      caption.textContent = label.slice(label.indexOf(':') + 1).trim() || label;
    }
  }

  function stopTimer(): void {
    clearTimeout(timer);
    timer = 0;
  }

  function schedule(): void {
    stopTimer();
    if (paused || held) return;
    timer = window.setTimeout(() => {
      show(index + 1);
      schedule();
    }, SLIDE_MS);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      /* A deliberate choice deserves a full slide before the next one, so the
         clock restarts rather than firing whatever was left of it. */
      schedule();
    });
  });

  /*
   * Hover and focus hold it. A courtesy rather than a real stop mechanism   a
   * keyboard user reading the headline touches neither of these   and with the
   * pause button removed it is all that is on offer to anyone not running
   * reduced motion.
   */
  hero.addEventListener('pointerenter', () => {
    held = true;
    stopTimer();
  });
  hero.addEventListener('pointerleave', () => {
    held = false;
    schedule();
  });
  hero.addEventListener('focusin', () => {
    held = true;
    stopTimer();
  });
  hero.addEventListener('focusout', (e) => {
    if (hero.contains(e.relatedTarget as Node)) return;
    held = false;
    schedule();
  });

  /* A backgrounded tab should not queue up five slide changes to replay at once. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTimer();
    else schedule();
  });

  /* Left and right move between photographs while the controls have focus. */
  controls.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = index + (e.key === 'ArrowRight' ? 1 : -1);
    show(next);
    dots[(next + slides.length) % slides.length].focus();
  });

  /* Turning reduced motion on mid-session stops it, and it stays stopped   the
     one-way door is deliberate, a preference switched on mid-visit is a clearer
     signal than one switched back off. */
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      paused = true;
      stopTimer();
    }
  });

  /* Autoplays from here unless reduced motion already said otherwise. */
  schedule();
}

/* ==========================================================================
   Boot
   ========================================================================== */

function boot(): void {
  if (reducedMotion.matches) {
    /* Nothing to orchestrate   drop the gate so the CSS never hides anything. */
    root.classList.remove('js-motion');
  } else {
    setUpReveals();
  }

  setUpMobileNav();
  setUpLightbox();
  /* Outside the reduced-motion branch for the same reason as the hero controls:
     the arrows must work either way, they simply do not glide. */
  setUpGalerieStrips();
  /* Outside the reduced-motion branch: the controls must work either way, they
     simply do not advance on their own. */
  setUpHeroCarousel();
}

boot();
