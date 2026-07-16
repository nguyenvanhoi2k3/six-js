import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Breakpoint, breakpoint } from "./breakpoint";
import { context } from "./context";
import { Tween } from "../tween/tween";

interface FakeQueryState {
  matches: boolean;
  listeners: Set<(e: { matches: boolean; media: string }) => void>;
}

/**
 * jsdom doesn't implement window.matchMedia at all (confirmed: `typeof window.matchMedia` is
 * `undefined` in a bare jsdom instance) - so unlike scroll/resize (real DOM events on a real
 * window), there's no native behavior to piggyback on. This fakes just enough of the real
 * MediaQueryList contract (a `matches` getter + addEventListener/removeEventListener("change"))
 * for breakpoint.ts's own logic to be exercised, with `set()` driving synchronous "change"
 * dispatch exactly like a real browser would after a layout change.
 */
function installFakeMatchMedia() {
  const registry = new Map<string, FakeQueryState>();

  function stateFor(query: string): FakeQueryState {
    let state = registry.get(query);
    if (!state) {
      state = { matches: false, listeners: new Set() };
      registry.set(query, state);
    }
    return state;
  }

  function fakeMatchMedia(query: string): MediaQueryList {
    const state = stateFor(query);
    return {
      get matches() {
        return state.matches;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, cb: (e: { matches: boolean; media: string }) => void) => state.listeners.add(cb),
      removeEventListener: (_type: string, cb: (e: { matches: boolean; media: string }) => void) => state.listeners.delete(cb),
      addListener: (cb: (e: { matches: boolean; media: string }) => void) => state.listeners.add(cb),
      removeListener: (cb: (e: { matches: boolean; media: string }) => void) => state.listeners.delete(cb),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;
  }

  vi.stubGlobal("matchMedia", fakeMatchMedia);

  return {
    /** Flips a query's matched state and (if it actually changed) synchronously notifies listeners, like a real browser dispatching "change". */
    set(query: string, matches: boolean): void {
      const state = stateFor(query);
      if (state.matches === matches) return;
      state.matches = matches;
      state.listeners.forEach((cb) => cb({ matches, media: query }));
    },
  };
}

let fake: ReturnType<typeof installFakeMatchMedia>;

beforeEach(() => {
  fake = installFakeMatchMedia();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Breakpoint - single query", () => {
  it("runs the callback immediately if the query already matches at add() time", () => {
    fake.set("(min-width: 800px)", true);
    const cb = vi.fn();

    breakpoint().add("(min-width: 800px)", cb);

    expect(cb).toHaveBeenCalledOnce();
  });

  it("does not run until the query starts matching", async () => {
    const cb = vi.fn();
    breakpoint().add("(min-width: 800px)", cb);
    expect(cb).not.toHaveBeenCalled();

    fake.set("(min-width: 800px)", true);
    await Promise.resolve(); // change-driven re-checks are debounced via microtask - see breakpoint.ts
    expect(cb).toHaveBeenCalledOnce();
  });

  it("reverts (kills captured animations) the instant the query stops matching", async () => {
    fake.set("(min-width: 800px)", true);
    const el = document.createElement("div");
    let tween!: Tween;

    breakpoint().add("(min-width: 800px)", (ctx) => {
      tween = ctx.run(() => new Tween(el, { opacity: 1, duration: 1 })) as unknown as Tween;
    });

    const killSpy = vi.spyOn(tween, "kill");
    fake.set("(min-width: 800px)", false);
    await Promise.resolve();

    expect(killSpy).toHaveBeenCalledOnce();
  });

  it("calls a returned cleanup function on revert", async () => {
    fake.set("(min-width: 800px)", true);
    const cleanup = vi.fn();

    breakpoint().add("(min-width: 800px)", () => cleanup);
    fake.set("(min-width: 800px)", false);
    await Promise.resolve();

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it("runs again if the query matches again later", async () => {
    const cb = vi.fn();
    breakpoint().add("(min-width: 800px)", cb);

    fake.set("(min-width: 800px)", true);
    await Promise.resolve();
    fake.set("(min-width: 800px)", false);
    await Promise.resolve();
    fake.set("(min-width: 800px)", true);
    await Promise.resolve();

    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("leaves ctx.matches empty for the single-query form", () => {
    fake.set("(min-width: 800px)", true);
    let seen: unknown;

    breakpoint().add("(min-width: 800px)", (ctx) => {
      seen = ctx.matches;
    });

    expect(seen).toEqual({});
  });
});

describe("Breakpoint - named condition groups", () => {
  it("runs immediately with a snapshot of every condition if at least one matches", () => {
    fake.set("(min-width: 800px)", true);
    fake.set("(max-width: 799px)", false);
    let seen: unknown;

    breakpoint().add({ isDesktop: "(min-width: 800px)", isMobile: "(max-width: 799px)" }, (ctx) => {
      seen = ctx.matches;
    });

    expect(seen).toEqual({ isDesktop: true, isMobile: false });
  });

  it("does not run at all if none of the conditions match yet", () => {
    const cb = vi.fn();
    breakpoint().add({ isDesktop: "(min-width: 800px)", isMobile: "(max-width: 799px)" }, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it("reverts the previous run and re-runs when a query flips, as long as one still matches", async () => {
    fake.set("(min-width: 800px)", false);
    fake.set("(max-width: 799px)", true);
    const seen: unknown[] = [];

    breakpoint().add({ isDesktop: "(min-width: 800px)", isMobile: "(max-width: 799px)" }, (ctx) => {
      seen.push({ ...ctx.matches });
    });

    // Two genuinely separate transitions (flushed individually, not in the same tick - see the
    // "coalesces" test below for the same-tick case) should each produce their own re-run.
    fake.set("(max-width: 799px)", false);
    await Promise.resolve();
    fake.set("(min-width: 800px)", true);
    await Promise.resolve();

    expect(seen).toEqual([{ isDesktop: false, isMobile: true }, { isDesktop: true, isMobile: false }]);
  });

  it("reverts without re-running once every condition in the group stops matching", async () => {
    fake.set("(min-width: 800px)", true);
    const cb = vi.fn();
    const el = document.createElement("div");
    let tween!: Tween;

    breakpoint().add({ isDesktop: "(min-width: 800px)" }, (ctx) => {
      cb();
      tween = ctx.run(() => new Tween(el, { opacity: 1, duration: 1 })) as unknown as Tween;
    });
    const killSpy = vi.spyOn(tween, "kill");

    fake.set("(min-width: 800px)", false);
    await Promise.resolve();

    expect(cb).toHaveBeenCalledOnce(); // only the initial run - no re-invocation when nothing matches
    expect(killSpy).toHaveBeenCalledOnce(); // but the previous run's animation is still torn down
  });

  it("coalesces two queries flipping in the same tick into a single re-run with the settled state", async () => {
    fake.set("(min-width: 800px)", true);
    fake.set("(max-width: 799px)", false);
    const seen: unknown[] = [];

    breakpoint().add({ isDesktop: "(min-width: 800px)", isMobile: "(max-width: 799px)" }, (ctx) => {
      seen.push({ ...ctx.matches });
    });

    // Simulates one resize crossing the breakpoint: both underlying queries flip "together",
    // dispatching two separate native change events synchronously in the same tick.
    fake.set("(min-width: 800px)", false);
    fake.set("(max-width: 799px)", true);

    // Still just the initial run - the coalesced re-check hasn't flushed via microtask yet.
    expect(seen).toEqual([{ isDesktop: true, isMobile: false }]);

    await Promise.resolve();
    await Promise.resolve();

    expect(seen).toEqual([{ isDesktop: true, isMobile: false }, { isDesktop: false, isMobile: true }]);
  });
});

describe("Breakpoint - revert/kill lifecycle", () => {
  it("revert() tears down current content but keeps listening for future changes", async () => {
    fake.set("(min-width: 800px)", true);
    const cb = vi.fn();
    const bp = breakpoint().add("(min-width: 800px)", cb);

    bp.revert();
    expect(cb).toHaveBeenCalledOnce();

    fake.set("(min-width: 800px)", false);
    await Promise.resolve();
    fake.set("(min-width: 800px)", true);
    await Promise.resolve();
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("kill() detaches listeners so further query changes are ignored", () => {
    fake.set("(min-width: 800px)", true);
    const cb = vi.fn();
    const bp = breakpoint().add("(min-width: 800px)", cb);

    bp.kill();
    fake.set("(min-width: 800px)", false);
    fake.set("(min-width: 800px)", true);

    expect(cb).toHaveBeenCalledOnce(); // only the initial run - kill() stopped it from reacting further
  });

  it("throws if add() is called after kill()", () => {
    const bp = breakpoint();
    bp.kill();
    expect(() => bp.add("(min-width: 800px)", () => {})).toThrow();
  });

  it("add() returns the Breakpoint instance for chaining", () => {
    const bp = breakpoint();
    expect(bp.add("(min-width: 800px)", () => {})).toBe(bp);
  });

  it("breakpoint(conditions, callback) is sugar for breakpoint().add(conditions, callback)", () => {
    fake.set("(min-width: 800px)", true);
    const cb = vi.fn();

    const bp = breakpoint("(min-width: 800px)", cb);

    expect(cb).toHaveBeenCalledOnce();
    expect(bp).toBeInstanceOf(Breakpoint);
  });

  it("still supports chaining a second .add() after the direct-args form", () => {
    fake.set("(min-width: 800px)", true);
    fake.set("(max-width: 599px)", true);
    const first = vi.fn();
    const second = vi.fn();

    breakpoint("(min-width: 800px)", first).add("(max-width: 599px)", second);

    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it("no-ops instead of throwing when window.matchMedia is unavailable", () => {
    vi.unstubAllGlobals();
    // @ts-expect-error - simulating an environment without matchMedia
    delete window.matchMedia;

    const cb = vi.fn();
    expect(() => breakpoint().add("(min-width: 800px)", cb)).not.toThrow();
    expect(cb).not.toHaveBeenCalled();
  });
});

describe("Breakpoint - integration with six.context()", () => {
  it("a Breakpoint created inside an active context is captured and killed by the outer context's kill()", () => {
    fake.set("(min-width: 800px)", true);
    const cb = vi.fn();

    const ctx = context();
    const bp = ctx.run(() => breakpoint().add("(min-width: 800px)", cb)) as Breakpoint;
    const killSpy = vi.spyOn(bp, "kill");

    ctx.kill();

    expect(killSpy).toHaveBeenCalledOnce();

    fake.set("(min-width: 800px)", false);
    fake.set("(min-width: 800px)", true);
    expect(cb).toHaveBeenCalledOnce(); // the outer kill() also detached the listener
  });
});
