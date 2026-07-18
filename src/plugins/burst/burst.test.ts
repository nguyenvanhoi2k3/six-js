import { afterEach, describe, expect, it, vi } from "vitest";
import { ticker, TickerListener } from "../../core/ticker";
import { burst } from "./burst";

function makeOrigin(): HTMLElement {
  const el = document.createElement("button");
  document.body.appendChild(el);
  return el;
}

function makeIcon(): HTMLElement {
  const icon = document.createElement("div");
  icon.className = "icon";
  return icon;
}

function mockRect(el: Element, top: number): void {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top,
    height: 0,
    bottom: top,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: top,
    toJSON: () => ({}),
  });
}

function mockViewportHeight(height: number): void {
  vi.spyOn(window, "innerHeight", "get").mockReturnValue(height);
}

/**
 * burst() drives the real shared `ticker` directly (see burst.ts's doc comment for why it isn't
 * built on Tween/Timeline). Capturing `ticker.add`'s callbacks - instead of letting them actually
 * register for real rAF dispatch - gives full deterministic control over simulated time, same
 * approach `smooth-scroll-integration.test.ts` uses for the same reason. Keeps ALL captured
 * callbacks (not just the last one) so a single test can drive multiple simultaneous `burst()`
 * calls through the same `fire()`.
 */
function captureTick(): (time: number) => void {
  const captured: TickerListener[] = [];
  vi.spyOn(ticker, "add").mockImplementation((cb) => {
    captured.push(cb);
    return cb;
  });
  vi.spyOn(ticker, "remove").mockImplementation((cb) => {
    const i = captured.indexOf(cb);
    if (i !== -1) captured.splice(i, 1);
  });
  return (time: number) => captured.forEach((cb) => cb(time, 0, 0));
}

describe("burst - clone mode (`clone` set, `targets` used as a template)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("spawns `clone` copies of the target into the container immediately (frame 0 renders synchronously)", () => {
    const origin = makeOrigin();
    const icon = makeIcon();

    burst(origin, { targets: icon, clone: 5 });

    expect(document.body.querySelectorAll(".icon")).toHaveLength(5);
  });

  it("moves a clone continuously via real projectile motion, matching the closed-form curve exactly", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const icon = makeIcon();
    const t0 = ticker.time;

    mockRect(origin, 0);
    mockViewportHeight(1000);
    burst(origin, { targets: icon, clone: 1, power: [200, 200], spread: [0, 0], gravity: 800 });
    const clone = document.body.querySelector(".icon") as HTMLElement;
    const readY = (transform: string): number => Number(/translate\(0px, (-?[\d.]+)px\)/.exec(transform)![1]);

    const y0 = readY(clone.style.transform);
    expect(y0).toBeCloseTo(0); // t=0: still at the origin

    fire(t0 + 0.1);
    const y1 = readY(clone.style.transform);
    expect(y1).toBeCloseTo(-200 * 0.1 + 0.5 * 800 * 0.1 ** 2); // vy0=-200 (launched straight up), matches the exact kinematics formula

    fire(t0 + 0.2);
    const y2 = readY(clone.style.transform);
    expect(y2).toBeCloseTo(-200 * 0.2 + 0.5 * 800 * 0.2 ** 2);

    // continuous motion: never two identical frames while gravity keeps integrating
    expect(y1).not.toBe(y0);
    expect(y2).not.toBe(y1);
  });

  it("removes a clone once it exits the viewport and finishes fading, and calls onComplete once every particle is gone", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const icon = makeIcon();
    mockRect(origin, 0);
    mockViewportHeight(10); // tiny - exits almost immediately
    const t0 = ticker.time;
    let completed = false;

    burst(origin, { targets: icon, clone: 3, spread: [180, 180], power: [500, 500], gravity: 0, onComplete: () => (completed = true) });
    expect(document.body.querySelectorAll(".icon")).toHaveLength(3);

    fire(t0 + 0.1); // past the 10px viewport - fade timer starts
    expect(document.body.querySelectorAll(".icon")).toHaveLength(3);
    expect(completed).toBe(false);

    fire(t0 + 1); // well past the fade window finishing
    expect(document.body.querySelectorAll(".icon")).toHaveLength(0);
    expect(completed).toBe(true);
  });

  it("delays a staggered particle's DOM insertion until its own spawn time", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const icon = makeIcon();
    mockRect(origin, 0);
    mockViewportHeight(100000); // keeps particles alive for the whole test regardless of the default (random) spread/power
    const t0 = ticker.time;

    burst(origin, { targets: icon, clone: 2, stagger: 1 });
    expect(document.body.querySelectorAll(".icon")).toHaveLength(1); // only particle 0 has spawned so far

    fire(t0 + 0.5);
    expect(document.body.querySelectorAll(".icon")).toHaveLength(1); // particle 1 still waiting

    fire(t0 + 1.2);
    expect(document.body.querySelectorAll(".icon")).toHaveLength(2); // particle 1 has now launched
  });

  it("kill() removes every still-alive clone immediately and stops future updates", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const icon = makeIcon();
    const t0 = ticker.time;
    let completed = false;

    const controller = burst(origin, { targets: icon, clone: 4, onComplete: () => (completed = true) });
    expect(document.body.querySelectorAll(".icon")).toHaveLength(4);

    controller.kill();
    expect(document.body.querySelectorAll(".icon")).toHaveLength(0);

    fire(t0 + 10);
    expect(completed).toBe(false); // killed early, not a natural completion
  });

  it("appends clones to a custom container instead of document.body", () => {
    const origin = makeOrigin();
    const icon = makeIcon();
    const container = document.createElement("div");
    document.body.appendChild(container);

    burst(origin, { targets: icon, clone: 4, container });

    expect(container.querySelectorAll(".icon")).toHaveLength(4);
    expect(document.body.querySelectorAll(":scope > .icon")).toHaveLength(0);
  });

  it("uses viewport-fixed clones for the default document.body container", () => {
    const origin = makeOrigin();
    const icon = makeIcon();

    burst(origin, { targets: icon, clone: 1 });

    const clone = document.body.querySelector(".icon") as HTMLElement;
    expect(clone.style.position).toBe("fixed");
  });

  it("confines clones to a custom container via absolute positioning, forcing it relative", () => {
    const origin = makeOrigin();
    const icon = makeIcon();
    const container = document.createElement("div");
    document.body.appendChild(container);

    burst(origin, { targets: icon, clone: 1, container });

    const clone = container.querySelector(".icon") as HTMLElement;
    expect(clone.style.position).toBe("absolute");
    expect(container.style.position).toBe("relative");
  });

  it("leaves an already-positioned custom container's position untouched", () => {
    const origin = makeOrigin();
    const icon = makeIcon();
    const container = document.createElement("div");
    container.style.position = "absolute";
    document.body.appendChild(container);

    burst(origin, { targets: icon, clone: 1, container });

    expect(container.style.position).toBe("absolute");
  });

  it("warns and calls onComplete synchronously when no targets resolve", () => {
    const origin = makeOrigin();
    let completed = false;

    const controller = burst(origin, { targets: ".does-not-exist", clone: 5, onComplete: () => (completed = true) });

    expect(document.body.querySelectorAll(".icon")).toHaveLength(0);
    expect(completed).toBe(true);
    expect(() => controller.kill()).not.toThrow();
  });

  it("warns and calls onComplete synchronously when the origin can't be resolved", () => {
    const icon = makeIcon();
    let completed = false;

    const controller = burst("#does-not-exist", { targets: icon, clone: 5, onComplete: () => (completed = true) });

    expect(document.body.querySelectorAll(".icon")).toHaveLength(0);
    expect(completed).toBe(true);
    expect(() => controller.kill()).not.toThrow();
  });

  it("does not fade while still inside the viewport, no matter how long it's been flying", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const icon = makeIcon();
    mockRect(origin, 0);
    mockViewportHeight(100000); // effectively unreachable
    const t0 = ticker.time;

    burst(origin, { targets: icon, clone: 1, spread: [180, 180], power: [50, 50], gravity: 0 });
    fire(t0 + 5); // plenty of flight time, but nowhere near the (unreachable) viewport bottom

    const clone = document.body.querySelector(".icon") as HTMLElement;
    expect(clone.style.opacity).toBe("1");
  });

  it("fades once it exits the viewport, exactly like direct mode", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const icon = makeIcon();
    mockRect(origin, 0);
    mockViewportHeight(10); // tiny - exits almost immediately
    const t0 = ticker.time;

    burst(origin, { targets: icon, clone: 1, spread: [180, 180], power: [500, 500], gravity: 0 });

    fire(t0 + 0.1); // y=50, past the 10px viewport - fade timer starts counting from here
    expect(document.body.querySelector(".icon")!.style.opacity).toBe("1");

    fire(t0 + 0.4); // 0.3s into the fade window
    expect(Number(document.body.querySelector(".icon")!.style.opacity)).toBeLessThan(1);
  });
});

describe("burst - direct mode (default, no `clone` - `targets` animated in place)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  function makeWords(count: number): HTMLElement[] {
    return Array.from({ length: count }, (_, i) => {
      const word = document.createElement("span");
      word.className = "word";
      word.textContent = `word${i}`;
      document.body.appendChild(word);
      return word;
    });
  }

  it("animates the real elements in place instead of cloning - none are duplicated", () => {
    const origin = makeOrigin();
    const words = makeWords(3);

    burst(origin, { targets: words });

    expect(document.body.querySelectorAll(".word")).toHaveLength(3);
    expect(document.body.querySelectorAll(".word")[0]).toBe(words[0]);
  });

  it("does not require a resolvable origin - only `targets` matters for positioning", () => {
    const words = makeWords(2);
    const controller = burst("#does-not-exist", { targets: words });

    expect(document.body.contains(words[0])).toBe(true);
    expect(() => controller.kill()).not.toThrow();
  });

  it("moves a target via translate only (no -50%/-50% centering, no scale pop-in)", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const [word] = makeWords(1);
    const t0 = ticker.time;

    burst(origin, { targets: word, power: [200, 200], spread: [0, 0], gravity: 800 });
    fire(t0 + 0.1);

    expect(word.style.transform).not.toContain("-50%");
    expect(word.style.transform).not.toContain("scale");
    expect(word.style.transform).toContain("translate(0px,");
  });

  it("leaves the real element in the DOM once it finishes fading out, never removes it", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const [word] = makeWords(1);
    mockRect(word, 0);
    mockViewportHeight(10); // tiny - exits almost immediately
    const t0 = ticker.time;
    let completed = false;

    burst(origin, { targets: word, spread: [180, 180], power: [500, 500], gravity: 0, onComplete: () => (completed = true) });
    fire(t0 + 0.1); // crosses the viewport - starts the fade-out timer
    fire(t0 + 1); // well past the fade window finishing

    expect(document.body.contains(word)).toBe(true);
    expect(completed).toBe(true);
  });

  it("stays fully visible (opacity 1) while still inside the viewport, regardless of elapsed duration", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const [word] = makeWords(1);
    mockRect(word, 0);
    mockViewportHeight(1000);
    const t0 = ticker.time;

    // straight down, slow and no gravity so the math is exact: y(t) = 50*t
    burst(origin, { targets: word, spread: [180, 180], power: [50, 50], gravity: 0 });
    fire(t0 + 1); // y = 50, nowhere near the 1000px viewport bottom

    expect(word.style.opacity).toBe("1");
  });

  it("only starts fading once it crosses below the bottom of the viewport", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const [word] = makeWords(1);
    mockRect(word, 0);
    mockViewportHeight(100);
    const t0 = ticker.time;

    // y(t) = 100*t (no gravity, straight down) - crosses the 100px viewport bottom at t=1
    burst(origin, { targets: word, spread: [180, 180], power: [100, 100], gravity: 0 });

    fire(t0 + 0.5); // y=50, still inside the viewport
    expect(word.style.opacity).toBe("1");

    fire(t0 + 1.2); // y=120, now past the viewport bottom - crossing is detected on this tick,
    // but the fade timer itself starts counting from this exact moment, so it's still 1 here too
    expect(word.style.opacity).toBe("1");

    fire(t0 + 1.4); // 0.2s further into the fade window (VIEWPORT_FADE_OUT_DURATION=0.4) - now visibly fading
    expect(Number(word.style.opacity)).toBeLessThan(1);
  });

  it("fades all the way to exactly 0 once the fade window elapses, not a fraction short (regression)", () => {
    // Regression test for a real reported bug: the tick that crosses the fade-out deadline always
    // lands strictly past it, so the last frame actually rendered used to be whatever the fade
    // curve was on the PREVIOUS tick (still a few % opacity, not 0) - a real visible bug for
    // direct mode, since those elements are never removed: faded-out characters were left on
    // screen forever as faint, stuck-looking ghosts. This overshoots the fade deadline
    // (exitedViewportAt + VIEWPORT_FADE_OUT_DURATION) in one discrete step, same as a real ticker
    // frame would, exercising the explicit safety net that guarantees a clean 0 regardless.
    const fire = captureTick();
    const origin = makeOrigin();
    const [word] = makeWords(1);
    mockRect(word, 0);
    mockViewportHeight(10);
    const t0 = ticker.time;

    burst(origin, { targets: word, spread: [180, 180], power: [500, 500], gravity: 0 });

    fire(t0 + 0.1); // y=50, past the 10px viewport - exitedViewportAt set to 0.1 on this tick
    expect(word.style.opacity).toBe("1");

    fire(t0 + 0.6); // overshoots the 0.1+0.4=0.5 fade deadline in one discrete step
    expect(word.style.opacity).toBe("0");
  });

  it("never fades - by design - if a particle's trajectory never carries it below the viewport, even past its own duration", () => {
    // Deliberate design choice (explicitly requested): opacity must NEVER change unless the
    // element has actually crossed below the bottom of the viewport - no fallback, no "duration
    // is about to run out, fade anyway" exception. A particle whose speed/gravity/duration don't
    // carry it off-screen in time just stays fully opaque, frozen at its last position - tuning
    // those three is how you guarantee it disappears, not an automatic timer.
    const fire = captureTick();
    const origin = makeOrigin();
    const [word] = makeWords(1);
    mockRect(word, 0);
    mockViewportHeight(100000); // effectively unreachable
    const t0 = ticker.time;

    burst(origin, { targets: word, spread: [180, 180], power: [50, 50], gravity: 0 });
    fire(t0 + 0.5); // duration has elapsed

    expect(word.style.opacity).toBe("1");
  });

  it("with fade: false, completes as soon as it exits the viewport instead of continuing to simulate", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const [word] = makeWords(1);
    mockRect(word, 0);
    mockViewportHeight(10);
    const t0 = ticker.time;
    let completed = false;

    burst(origin, { targets: word, spread: [180, 180], power: [500, 500], gravity: 0, fade: false, onComplete: () => (completed = true) });
    fire(t0 + 0.1); // already past the 10px viewport

    expect(completed).toBe(true);
    expect(word.style.opacity).toBe(""); // fade disabled - opacity is never touched at all
  });

  it("stops simulating after a generous safety cap if a particle can never reach the viewport", () => {
    // Degenerate config: gravity 0 and a purely horizontal launch (spread 90 = straight sideways)
    // never gains any vertical velocity at all, so it can never cross window.innerHeight - without
    // a backstop this would keep rendering every tick forever. The cap only stops simulating; it
    // must NOT touch opacity (still governed strictly by "did it cross the viewport", per this
    // mode's own rule - see the test above).
    const fire = captureTick();
    const origin = makeOrigin();
    const [word] = makeWords(1);
    mockRect(word, 0);
    mockViewportHeight(100000);
    const t0 = ticker.time;
    let completed = false;

    burst(origin, { targets: word, spread: [90, 90], power: [200, 200], gravity: 0, onComplete: () => (completed = true) });

    fire(t0 + 14); // just under the 15s safety cap
    expect(completed).toBe(false);

    fire(t0 + 16); // past the cap
    expect(completed).toBe(true);
    expect(word.style.opacity).toBe("1"); // untouched - it never actually crossed the viewport
  });

  it("kill() leaves targets exactly where they last rendered instead of removing them", () => {
    const fire = captureTick();
    const origin = makeOrigin();
    const [word] = makeWords(1);
    const t0 = ticker.time;

    const controller = burst(origin, { targets: word });
    fire(t0 + 0.2);
    const midFlightTransform = word.style.transform;

    controller.kill();

    expect(document.body.contains(word)).toBe(true);
    expect(word.style.transform).toBe(midFlightTransform); // frozen in place, not reset or removed
  });
});
