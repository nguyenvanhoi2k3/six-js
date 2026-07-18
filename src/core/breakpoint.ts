import { Context, getActiveScope } from "./context";

export type BreakpointConditions = Record<string, boolean>;
export type BreakpointCleanup = void | (() => void);
export type BreakpointCallback = (ctx: BreakpointContext) => BreakpointCleanup;

/**
 * A Context whose one extra field - `matches` - is a snapshot of which of the current add()'s
 * named queries currently match, refreshed right before every (re-)run. A single-query add()
 * never populates this: the callback running at all already says everything there is to say.
 */
export class BreakpointContext extends Context {
  matches: BreakpointConditions = {};
}

interface Entry {
  ctx: BreakpointContext;
  detach(): void;
  /** Extra per-entry state Breakpoint.revert() needs to reset besides the Context itself - see add(). */
  reset(): void;
}

/**
 * six.breakpoint()-equivalent to GSAP's gsap.matchMedia(): ties setup/teardown to CSS media
 * query state instead of the caller hand-rolling `change` listeners + manual if/else + manual
 * kill() calls. Built on Context rather than duplicating its capture/revert machinery - each
 * add() gets its own BreakpointContext that's revert()ed (soft: listeners stay attached, so a
 * later matching change runs it again) whenever its condition(s) change, and kill()ed (hard: also
 * detaches the underlying MediaQueryList listeners) only when the whole Breakpoint instance is
 * killed. A Breakpoint instance is itself Killable and auto-captures into whatever six.context()
 * is currently active (same as Tween/Timeline - see Animation's constructor), so an outer
 * context's single kill() tears down every responsive setup registered inside it too.
 *
 * Named `Breakpoint`, not `MatchMedia`/`Media` - deliberately not mirroring GSAP's naming (the
 * user asked for something that reads as six-js's own, not a renamed port). Distinct from
 * `ContainerBreakpoints` in container-breakpoints.ts (the slider/dialog components' own
 * container-width config parser, unrelated to media queries) - was named plain `Breakpoints`
 * until it was renamed specifically to avoid colliding with this class.
 *
 * Core logic (which conditions gate a (re-)run, the stale-read workaround below) is checked
 * directly against GSAP's own gsap-core.js (`MatchMedia`/`_onMediaChange`) rather than guessed -
 * see the Status section in CLAUDE.md for why that verification step matters here.
 */
export class Breakpoint {
  private entries: Entry[] = [];
  private dead = false;

  constructor() {
    getActiveScope()?._capture(this);
  }

  /**
   * One query string: `callback` runs while it matches, and its BreakpointContext is reverted
   * the instant it stops - the common "do this above N px, undo it below" case.
   *
   * A named map of queries: the SAME `callback` re-runs whenever any of them toggle, as long as
   * AT LEAST ONE still matches (`ctx.matches` tells it which) - GSAP's "mutually exclusive
   * breakpoints in one if/else ladder" pattern. If ALL of them stop matching, the previous run is
   * torn down and `callback` is simply not invoked again (matches GSAP - there's no "else"
   * invocation to represent "nothing matches").
   *
   * Either way, a `callback` that returns a function has that treated as its own cleanup and
   * called automatically on the next revert - reuses the same mechanism a captured Tween/Timeline
   * uses (`ctx.add({ kill: cleanup })`) rather than inventing a second one.
   */
  add(conditions: string | Record<string, string>, callback: BreakpointCallback): this {
    if (this.dead) throw new Error("[six-js] cannot add() to a killed breakpoint()");
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return this;

    const single = typeof conditions === "string";
    const map: Record<string, string> = single ? { matches: conditions } : conditions;
    const ctx = new BreakpointContext();
    // Last-known match per key, purely for toggle detection - never exposed as-is (see `single`
    // handling below); starts empty so the very first check() below always looks "toggled".
    const cond: BreakpointConditions = {};
    let scheduled = false;

    const check = (): void => {
      let anyMatch = false;
      let toggled = false;
      for (const key in map) {
        // Re-fetch a fresh MediaQueryList rather than trust one kept around: Firefox only
        // updates a MediaQueryList's own `.matches` at the moment ITS OWN change handler
        // fires, so a *different* query's stored object can read stale here - GSAP's real
        // _onMediaChange has this identical re-fetch, for exactly this reason.
        const match = window.matchMedia(map[key]).matches;
        if (match) anyMatch = true;
        if (cond[key] !== match) {
          cond[key] = match;
          toggled = true;
        }
      }
      if (!toggled) return;

      ctx.revert();
      if (anyMatch) {
        ctx.matches = single ? {} : { ...cond };
        this._run(ctx, callback);
      }
    };

    const evaluate = (): void => {
      // A single resize/orientation change can flip more than one of this group's queries at
      // once (e.g. isDesktop -> false and isMobile -> true "together"), each dispatching its
      // OWN native "change" event - without coalescing, check() would run once per event and
      // briefly revert into a halfway state (neither condition true) before the second event
      // arrives. One microtask coalesces same-tick events into a single check() of the settled
      // state. (GSAP instead debounces globally by wall-clock time across every matchMedia
      // instance on the page; per-group microtask coalescing is a deliberately simpler scope cut
      // here - it only fails to help if two SEPARATE add() groups both toggle in the same tick
      // AND their setup order relative to each other matters, which nothing in this codebase does.)
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        check();
      });
    };

    const mqs = Object.keys(map).map((key) => window.matchMedia(map[key]));
    mqs.forEach((mq) => mq.addEventListener("change", evaluate));

    this.entries.push({
      ctx,
      detach: () => mqs.forEach((mq) => mq.removeEventListener("change", evaluate)),
      reset: () => {
        for (const key in cond) delete cond[key];
      },
    });

    check(); // synchronous initial read - like GSAP's `active && func(...)` at the end of add()
    return this;
  }

  private _run(ctx: BreakpointContext, callback: BreakpointCallback): void {
    const cleanup = ctx.run(() => callback(ctx));
    if (typeof cleanup === "function") ctx.add({ kill: cleanup });
  }

  /** Tears down whatever's currently active (kills captured animations, runs returned cleanups) but keeps listening - a later matching change runs everything again. */
  revert(): void {
    this.entries.forEach((e) => {
      e.ctx.revert();
      e.reset();
    });
  }

  /** Permanent: reverts everything AND stops listening. A killed breakpoint() can't add() again. */
  kill(): void {
    if (this.dead) return;
    this.dead = true;
    this.entries.forEach((e) => {
      e.ctx.kill();
      e.detach();
    });
    this.entries.length = 0;
  }
}

/**
 * Zero-arg: an empty instance, register conditions later via `.add()`.
 * With args: sugar for `breakpoint().add(conditions, callback)` - the common "one breakpoint,
 * one setup" case doesn't need the empty-then-add two-step. Mirrors `six.context(fn)`'s own
 * "run immediately if given a function" shape rather than inventing a new convention.
 */
export function breakpoint(): Breakpoint;
export function breakpoint(conditions: string | Record<string, string>, callback: BreakpointCallback): Breakpoint;
export function breakpoint(conditions?: string | Record<string, string>, callback?: BreakpointCallback): Breakpoint {
  const bp = new Breakpoint();
  if (conditions !== undefined && callback !== undefined) bp.add(conditions, callback);
  return bp;
}
