import { resolveTargets } from "../../tween/tween";
import { ticker, TickerListener } from "../../core/ticker";
import { random } from "../../utils/utils";
import { pointOnCircle, projectilePosition } from "./burst-physics";

export type BurstIcons = Element | Element[] | ArrayLike<Element> | string;

export interface BurstVars {
  /**
   * Element(s) to burst - a selector, a single element, or a list. What actually happens to them
   * depends on `clone`:
   * - default (no `clone`): every resolved element is animated DIRECTLY, in place - exactly one
   *   particle per element, launched from wherever it already sits (not from `origin`). Never
   *   cloned, appended elsewhere, or removed from the DOM - but IS switched to `position: fixed`
   *   (pinned to its own exact current screen position first, so the switch is visually seamless),
   *   so it can genuinely fall off the page - unconstrained by the surrounding layout or any
   *   ancestor's `overflow` - instead of just falling until some ancestor happens to clip it. This
   *   pulls the element out of normal document flow for good: surrounding text/content will
   *   visibly close up the gap it leaves behind - an inherent trade-off of making real page
   *   content fly away like this, not an oversight. Use this to make real page content (e.g.
   *   `splitText()` words) itself burst and fall.
   * - `clone: N`: `targets` is used purely as a TEMPLATE instead - N clones are spawned (picked at
   *   random each time if more than one element resolves), launched from `origin`'s position, and
   *   are fully disposable - removed from the DOM once done. The resolved element(s) themselves
   *   are never touched. Use this for a classic confetti/"like burst" effect, e.g. a heart icon
   *   exploding outward from a button click.
   */
  targets: BurstIcons;
  /** Clone `targets` this many times and burst the clones instead of animating `targets` directly - see `targets`'s own doc comment for the full behavior difference. Omitted (the default) animates `targets` directly in place, one particle per resolved element. */
  clone?: number;
  /** Where CLONED particles are appended. Default `document.body` (viewport-fixed, ignores scroll). A custom container gets absolutely-positioned clones confined to it instead (forced to `position: relative` if it's `static`). Only relevant when `clone` is set. */
  container?: Element;
  /** Launch angle range in degrees, 0 = up, clockwise-positive (see burst-physics.ts). Controls the SHAPE of the burst (how wide it fans out). Narrow it toward 0 (e.g. `[-30, 30]`) and raise `power` for a burst that pops mostly upward. Default full circle. */
  spread?: [number, number];
  /** Launch speed range in px/s, in whatever direction `spread` randomly picks for that particle - combined with `spread`, this is what controls how high/far the launch reaches. Default `[160, 380]`. */
  power?: [number, number];
  /** Downward acceleration in px/s^2. Higher = pulled down harder/faster, lower = drifts down softly. Default 650. */
  gravity?: number;
  /** Scale range for CLONED particles. Default `[0.5, 1.1]`. Only relevant when `clone` is set - a directly-animated element keeps its natural size. */
  scale?: [number, number];
  /** Angular velocity range in deg/s (signed, so spin direction is random too). Default `[-360, 360]`. */
  rotationSpeed?: [number, number];
  /**
   * Fade opacity to 0, in BOTH modes, only once the particle has actually crossed below the
   * bottom of the viewport - never on a timer while it's still visibly on screen. A particle stays
   * fully opaque for as long as gravity takes to actually carry it off-screen (however long that
   * is - nothing artificially cuts its fall short), then fades over a fixed short window and is
   * cleaned up (cloned particles removed from the DOM; directly-animated `targets` just left
   * faded/displaced in place, never removed). Default true.
   */
  fade?: boolean;
  /** Extra delay between each particle's launch, in seconds. Default 0 (all particles launch together). */
  stagger?: number;
  onComplete?: () => void;
}

export interface BurstController {
  /** Stops the burst immediately. Cloned particles are removed; directly-animated `targets` are left wherever they last rendered. */
  kill(): void;
}

function resolveIcons(icons: BurstIcons): Element[] {
  if (typeof icons === "string") return Array.from(document.querySelectorAll(icons));
  if (icons instanceof Element) return [icons];
  return Array.from(icons).filter((el): el is Element => el instanceof Element);
}

function isRenderable(el: Element): el is HTMLElement | SVGElement {
  return el instanceof HTMLElement || el instanceof SVGElement;
}

function styleClone(clone: HTMLElement | SVGElement, cx: number, cy: number, fixed: boolean): void {
  clone.style.position = fixed ? "fixed" : "absolute";
  clone.style.left = `${cx}px`;
  clone.style.top = `${cy}px`;
  clone.style.margin = "0";
  clone.style.pointerEvents = "none";
  clone.style.willChange = "transform";
  // A common template pattern hides the source icon via its OWN inline `style="display:none"`
  // (rather than a wrapping container) - cloneNode(true) copies that inline style verbatim, so
  // without this every clone would silently stay display:none forever, animating invisibly. Only
  // the CLONE's display is touched here; the original template element is untouched and stays
  // hidden as intended.
  clone.style.display = "";
}

/**
 * `position: fixed` clones are always anchored to the viewport, never to an arbitrary ancestor -
 * so a custom `container` needs `position: absolute` clones (relative to the container's own
 * positioned box) instead, or the burst would visually ignore the container entirely and just
 * play across the whole viewport like the `document.body` default. Nudges a `static` container to
 * `relative` so it actually establishes that containing block (a plain wrapper div usually is
 * static by default and wouldn't confine an absolutely-positioned child otherwise).
 */
function originOffset(originEl: Element, container: Element): { cx: number; cy: number; fixed: boolean } {
  const rect = originEl.getBoundingClientRect();
  if (container === document.body) {
    return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2, fixed: true };
  }
  if (getComputedStyle(container).position === "static") {
    (container as HTMLElement).style.position = "relative";
  }
  const containerRect = container.getBoundingClientRect();
  return {
    cx: rect.left - containerRect.left + rect.width / 2,
    cy: rect.top - containerRect.top + rect.height / 2,
    fixed: false,
  };
}

const POP_IN_DURATION = 0.12; // seconds - quick scale-in so freshly CLONED particles don't just appear at full size
const VIEWPORT_FADE_OUT_DURATION = 0.4; // seconds to fade out once below the viewport, both modes
const MAX_LIFETIME = 15; // absolute safety cap on how long motion keeps simulating if a particle never reaches the viewport (a degenerate config, e.g. gravity: 0 with a purely horizontal launch) - not a fade trigger, just stops wasting cycles

interface Particle {
  template: Element | null; // null in `direct` mode - `el` is already final, nothing to clone
  el: HTMLElement | SVGElement | null;
  direct: boolean;
  spawn: number; // ticker time (seconds) this particle starts moving
  vx: number;
  vy: number;
  rotation0: number;
  rotationSpeed: number;
  scale: number; // unused in `direct` mode - a real element keeps its natural size
  originY: number; // viewport-relative Y the particle started at, before any transform
  exitedViewportAt: number | null; // `local` time it first crossed below the viewport, or null if still visible
  done: boolean;
}

/**
 * Tracked unconditionally (not just when `fade` is on) - the tick loop's own completion check
 * needs to know whether/when a particle crossed the viewport regardless of whether fading is
 * visually applied, so a `fade: false` burst still finishes promptly once its particles are
 * off-screen instead of running until the safety cap. Shared by both modes so the fade rule
 * itself - opacity ONLY changes once actually below the viewport, never on any kind of timer - is
 * identical for a cloned particle and a directly-animated `targets` element alike.
 */
function updateExitedViewport(p: Particle, y: number, local: number): void {
  if (p.exitedViewportAt !== null) return;
  if (p.originY + y > window.innerHeight) p.exitedViewportAt = local;
}

function viewportFadeOpacity(p: Particle, local: number): string {
  if (p.exitedViewportAt === null) return "1";
  const fadeProgress = (local - p.exitedViewportAt) / VIEWPORT_FADE_OUT_DURATION;
  return String(Math.max(0, 1 - fadeProgress));
}

function renderParticle(p: Particle, gravity: number, local: number, fade: boolean): void {
  const el = p.el;
  if (!el) return;

  const { x, y } = projectilePosition(p.vx, p.vy, gravity, local);
  const rotation = p.rotation0 + p.rotationSpeed * local;
  updateExitedViewport(p, y, local);

  if (p.direct) {
    // No -50%/-50% centering here: `left`/`top` were pinned to the element's own exact top-left
    // corner (its `getBoundingClientRect()` at burst time), not a center point the way a spawned
    // clone's `left`/`top` is - so translate(0,0) already reproduces its original position exactly,
    // no compensation needed. No pop-in scale either - it's already fully visible real content,
    // shrinking it to 0 and growing it back at t=0 would be a visible glitch, not an entrance.
    el.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
  } else {
    const pop = local < POP_IN_DURATION ? local / POP_IN_DURATION : 1;
    const scale = p.scale * (1 - (1 - pop) * (1 - pop));
    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;
  }

  if (fade) el.style.opacity = viewportFadeOpacity(p, local);
}

/**
 * Spawns particles and drives each one with real, continuous 2D projectile motion (constant
 * launch velocity + constant gravity, integrated every frame - not eased/interpolated) - a
 * firework/confetti-style one-shot effect. Deliberately NOT built on Tween/Timeline: an earlier
 * version chained two eased Tween phases (an outward burst, then a fall), which put a visible
 * kink in the motion at the phase boundary - x-velocity eased to a dead stop instead of drifting
 * continuously like a real launched object does, which read as choppy. Driving the shared
 * `ticker` directly and writing the transform each frame from the exact physics formula (see
 * burst-physics.ts's `projectilePosition`) removes that seam entirely - matches GSAP's own
 * Physics2DPlugin's own closed-form (no-friction) branch exactly.
 *
 * Both particle sources share EXACTLY the same lifecycle - motion is never time-boxed, a particle
 * keeps falling under gravity for as long as it genuinely takes to reach the viewport (see `fade`'s
 * doc comment for why an earlier version that capped this by a `duration` was a real bug: particles
 * that hadn't fallen far enough yet were left frozen fully visible mid-air once the cap hit). They
 * differ only in where the element comes from and what happens once it's finished - see
 * `BurstVars.targets`'s own doc comment for the full behavior difference between the two:
 * - `clone: N`: N disposable clones of `targets`, spawned at `origin`'s position - removed from
 *   the DOM once done (exited the viewport and finished fading).
 * - default (no `clone`): the real `targets` elements themselves, launched from wherever they
 *   already sit - never cloned, appended, or removed from the DOM, left in the DOM
 *   (faded/displaced) once done.
 */
export function burst(origin: Element | string, vars: BurstVars): BurstController {
  const direct = vars.clone === undefined;
  const resolvedElements = resolveIcons(vars.targets);
  const originEl = resolveTargets(origin)[0];
  const container = vars.container ?? document.body;
  const count = direct ? resolvedElements.length : vars.clone!;
  const [spreadMin, spreadMax] = vars.spread ?? [0, 360];
  const [powerMin, powerMax] = vars.power ?? [160, 380];
  const gravity = vars.gravity ?? 650;
  const [scaleMin, scaleMax] = vars.scale ?? [0.5, 1.1];
  const [rotMin, rotMax] = vars.rotationSpeed ?? [-360, 360];
  const fade = vars.fade ?? true;
  const stagger = vars.stagger ?? 0;

  const noop: BurstController = { kill() {} };

  if (resolvedElements.length === 0) {
    console.warn("[six] burst() requires at least one resolvable target");
    vars.onComplete?.();
    return noop;
  }
  if (!direct && !originEl) {
    console.warn("[six] burst() requires a resolvable origin element when `clone` is set");
    vars.onComplete?.();
    return noop;
  }

  let cx = 0;
  let cy = 0;
  let fixed = true;
  if (!direct) {
    ({ cx, cy, fixed } = originOffset(originEl, container));
  }
  // Viewport-relative Y every clone launches from (they all share the same origin point, unlike
  // direct mode where each element has its own) - needed for the same viewport-exit fade check
  // direct mode uses, shared by both modes.
  const cloneOriginY = fixed ? cy : container.getBoundingClientRect().top + cy;

  const start = ticker.time;
  const particles: Particle[] = [];

  if (direct) {
    // Measure every target's current screen position FIRST, before mutating any of them -
    // switching one element to `position: fixed` removes it from flow immediately, which can
    // reflow its later siblings (e.g. following characters sliding left to fill the gap), so a
    // live re-measurement mid-loop would read an already-shifted position for anything after the
    // first mutated element. Reading all of them up front, before any writes, avoids that.
    const rects = resolvedElements.map((el) => (isRenderable(el) ? el.getBoundingClientRect() : null));

    resolvedElements.forEach((el, i) => {
      const rect = rects[i];
      if (!rect || !isRenderable(el)) return;
      const angle = random(spreadMin, spreadMax) as number;
      const power = random(powerMin, powerMax) as number;
      const { dx: vx, dy: vy } = pointOnCircle(angle, power);

      // Pinned to its own exact current position via position: fixed - see `targets`'s own doc
      // comment for why (escapes any ancestor layout/overflow, same as a cloned particle already does).
      el.style.position = "fixed";
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.margin = "0";
      el.style.pointerEvents = "none";
      el.style.willChange = "transform";

      particles.push({
        template: null,
        el,
        direct: true,
        spawn: start + (stagger ? i * stagger : 0),
        vx,
        vy,
        rotation0: 0,
        rotationSpeed: random(rotMin, rotMax) as number,
        scale: 1,
        originY: rect.top,
        exitedViewportAt: null,
        done: false,
      });
    });
  } else {
    for (let i = 0; i < count; i++) {
      const template = resolvedElements.length === 1 ? resolvedElements[0] : (random(resolvedElements) as Element);
      const angle = random(spreadMin, spreadMax) as number;
      const power = random(powerMin, powerMax) as number;
      const { dx: vx, dy: vy } = pointOnCircle(angle, power);
      particles.push({
        template,
        el: null,
        direct: false,
        spawn: start + (stagger ? i * stagger : 0),
        vx,
        vy,
        rotation0: random(0, 360) as number,
        rotationSpeed: random(rotMin, rotMax) as number,
        scale: random(scaleMin, scaleMax) as number,
        originY: cloneOriginY,
        exitedViewportAt: null,
        done: false,
      });
    }
  }

  let alive = particles.length;
  let finished = false;

  const finish = (): void => {
    if (finished) return;
    finished = true;
    ticker.remove(tick);
    vars.onComplete?.();
  };

  const tick: TickerListener = (time) => {
    for (const p of particles) {
      if (p.done) continue;
      if (time < p.spawn) continue;

      if (!p.el) {
        const clone = p.template!.cloneNode(true) as Element;
        clone.removeAttribute("id");
        if (!isRenderable(clone)) {
          p.done = true;
          alive--;
          continue;
        }
        styleClone(clone, cx, cy, fixed);
        container.appendChild(clone);
        p.el = clone;
      }

      const local = time - p.spawn;
      renderParticle(p, gravity, local, fade);

      // One shared completion rule for both modes: done once it's finished fading (crossed the
      // viewport, then VIEWPORT_FADE_OUT_DURATION has elapsed), or - if fade is off - as soon as
      // it crosses the viewport at all, or (a generous backstop, not a normal-case trigger) once
      // MAX_LIFETIME is hit regardless, for a degenerate config that can never reach the viewport.
      const finishedFading = fade && p.exitedViewportAt !== null && local >= p.exitedViewportAt + VIEWPORT_FADE_OUT_DURATION;
      const exitedNoFade = !fade && p.exitedViewportAt !== null;
      if (finishedFading || exitedNoFade || local >= MAX_LIFETIME) {
        p.el.style.willChange = "";
        if (finishedFading) p.el.style.opacity = "0"; // guarantee a clean 0 regardless of exactly which tick crossed the fade deadline
        if (!p.direct) p.el.remove();
        p.done = true;
        alive--;
        if (alive === 0) finish();
      }
    }
  };

  ticker.add(tick);
  tick(start, 0, ticker.currentFrame); // render frame 0 synchronously, same as every other six-js animation does on creation

  return {
    kill(): void {
      if (finished) return;
      finished = true;
      ticker.remove(tick);
      for (const p of particles) {
        if (!p.direct) p.el?.remove();
        p.done = true;
      }
    },
  };
}
