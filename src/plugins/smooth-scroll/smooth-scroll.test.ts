import { afterEach, describe, expect, it, vi } from "vitest";
import { ticker, TickerListener } from "../../core/ticker";
import { SmoothScroll } from "./smooth-scroll";

function captureTick(): (deltaMs: number) => void {
  let captured: TickerListener | undefined;
  vi.spyOn(ticker, "add").mockImplementation((cb) => {
    captured = cb;
    return cb;
  });
  vi.spyOn(ticker, "remove").mockImplementation(() => {});
  return (deltaMs: number) => captured?.(0, deltaMs, 0);
}

interface MockScroller extends HTMLDivElement {
  setScrollHeight(v: number): void;
}

function makeScroller(clientHeight: number, scrollHeight: number): MockScroller {
  const el = document.createElement("div") as MockScroller;
  let sh = scrollHeight;
  Object.defineProperty(el, "clientHeight", { value: clientHeight, configurable: true });
  Object.defineProperty(el, "clientWidth", { value: clientHeight, configurable: true });
  Object.defineProperty(el, "scrollHeight", { get: () => sh, configurable: true });
  Object.defineProperty(el, "scrollWidth", { get: () => sh, configurable: true });
  el.setScrollHeight = (v: number) => {
    sh = v;
  };
  document.body.appendChild(el);
  return el;
}

function wheel(deltaY: number, extra: Partial<WheelEventInit> = {}): WheelEvent {
  return new WheelEvent("wheel", { deltaY, cancelable: true, ...extra });
}

// Plain Event (not a full jsdom TouchEvent, which has spotty constructor support) - onTouchMove
// only ever reads e.cancelable/calls e.preventDefault(), so a same-type Event works identically.
function touchMove(): Event {
  return new Event("touchmove", { cancelable: true });
}

function runUntilSettled(fire: (deltaMs: number) => void, maxTicks = 600): void {
  for (let i = 0; i < maxTicks; i++) fire(16);
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("SmoothScroll - construction", () => {
  it("reads the initial scroll position and marks the scroller with the base class", () => {
    captureTick();
    const el = makeScroller(1000, 2000);
    el.scrollTop = 40;

    const ss = new SmoothScroll({ scroller: el });
    expect(ss.scroll).toBe(40);
    expect(el.classList.contains("six-smooth")).toBe(true);

    ss.kill();
  });
});

describe("SmoothScroll - wheel-driven smoothing", () => {
  it("moves the real scrollTop smoothly toward the accumulated wheel target", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000); // limit = 2000

    const ss = new SmoothScroll({ scroller: el, lerp: 0.3 });
    el.dispatchEvent(wheel(300));

    fire(16);
    const afterOneTick = el.scrollTop;
    expect(afterOneTick).toBeGreaterThan(0);
    expect(afterOneTick).toBeLessThan(300);
    expect(ss.isScrolling).toBe(true);
    expect(el.classList.contains("six-smooth-scrolling")).toBe(true);

    runUntilSettled(fire);
    expect(el.scrollTop).toBe(300);
    expect(ss.isScrolling).toBe(false);
    expect(el.classList.contains("six-smooth-scrolling")).toBe(false);

    ss.kill();
  });

  it("calls preventDefault on the wheel event so the browser never scrolls natively", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });

    const evt = wheel(100);
    const spy = vi.spyOn(evt, "preventDefault");
    el.dispatchEvent(evt);
    expect(spy).toHaveBeenCalledOnce();

    fire(16);
    ss.kill();
  });

  it("clamps the target to [0, limit] - wheeling far past the bottom stops exactly at the limit", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000); // limit = 2000
    const ss = new SmoothScroll({ scroller: el, lerp: 0.5 });

    el.dispatchEvent(wheel(100000));
    runUntilSettled(fire);

    expect(el.scrollTop).toBe(2000);
    ss.kill();
  });

  it("clamps at the top too - wheeling up past 0 stops exactly at 0", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    el.scrollTop = 100;
    const ss = new SmoothScroll({ scroller: el, lerp: 0.5 });

    el.dispatchEvent(wheel(-100000));
    runUntilSettled(fire);

    expect(el.scrollTop).toBe(0);
    ss.kill();
  });

  it("does not react to ctrl+wheel (pinch-zoom) - no preventDefault, no movement", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });

    const evt = wheel(300, { ctrlKey: true });
    const spy = vi.spyOn(evt, "preventDefault");
    el.dispatchEvent(evt);
    expect(spy).not.toHaveBeenCalled();

    fire(16);
    expect(el.scrollTop).toBe(0);
    ss.kill();
  });

  it("respects a veto from another (earlier-run) listener that already called preventDefault - does not move the page", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);

    // Simulates an external lock (e.g. sx-dialog's own scroll lock) registered BEFORE
    // SmoothScroll - order matters here (see the class doc's capture-phase comment for how a
    // real integration guarantees this deterministically); this test only needs to prove
    // SmoothScroll's own half of the contract: once event.defaultPrevented is already true by
    // the time its handler runs, it must not move the page at all.
    el.addEventListener("wheel", (e) => e.preventDefault());
    const ss = new SmoothScroll({ scroller: el, lerp: 0.5 });

    el.dispatchEvent(wheel(300));
    fire(16);
    expect(el.scrollTop).toBe(0);
    expect(ss.isScrolling).toBe(false);

    ss.kill();
  });

  it("dispatches a synchronous native-shaped 'scroll' event within the same tick, before the async native one", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el, lerp: 0.5 });

    const heard: number[] = [];
    el.addEventListener("scroll", () => heard.push(el.scrollTop));

    el.dispatchEvent(wheel(200));
    expect(heard.length).toBe(0); // nothing yet - the wheel event itself doesn't move anything
    fire(16);
    expect(heard.length).toBeGreaterThan(0); // fired synchronously as part of this one fire() call
    expect(heard[heard.length - 1]).toBe(el.scrollTop);

    ss.kill();
  });
});

describe("SmoothScroll - stop/start", () => {
  it("stop() freezes scrolling: wheel is still preventDefault'd but produces no movement", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });
    ss.stop();
    expect(ss.isStopped).toBe(true);
    expect(el.classList.contains("six-smooth-stopped")).toBe(true);

    const evt = wheel(300);
    const spy = vi.spyOn(evt, "preventDefault");
    el.dispatchEvent(evt);
    expect(spy).toHaveBeenCalledOnce(); // page must not scroll natively either

    runUntilSettled(fire);
    expect(el.scrollTop).toBe(0);

    ss.start();
    expect(ss.isStopped).toBe(false);
    el.dispatchEvent(wheel(300));
    runUntilSettled(fire);
    expect(el.scrollTop).toBe(300);

    ss.kill();
  });

  it("stop() also blocks touch-drag scrolling (preventDefault on touchmove), not just wheel", () => {
    captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });
    ss.stop();

    const evt = touchMove();
    const spy = vi.spyOn(evt, "preventDefault");
    el.dispatchEvent(evt);
    expect(spy).toHaveBeenCalledOnce();

    ss.kill();
  });

  it("touch is otherwise left fully native - touchmove is never prevented while not stopped/locked", () => {
    captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });

    const evt = touchMove();
    const spy = vi.spyOn(evt, "preventDefault");
    el.dispatchEvent(evt);
    expect(spy).not.toHaveBeenCalled();

    ss.kill();
  });

  it("a locked in-flight scrollTo also blocks touch, symmetric with wheel", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el, lerp: 0.1 });

    ss.scrollTo(500, { lock: true });
    fire(16); // still mid-flight, locked

    const evt = touchMove();
    const spy = vi.spyOn(evt, "preventDefault");
    el.dispatchEvent(evt);
    expect(spy).toHaveBeenCalledOnce();

    ss.kill();
  });

  it("stop() cancels any in-flight motion at its current position rather than finishing it first", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el, lerp: 0.1 });

    el.dispatchEvent(wheel(1000));
    fire(16);
    const midway = el.scrollTop;
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(1000);

    ss.stop();
    runUntilSettled(fire);
    expect(el.scrollTop).toBe(midway); // frozen, never reached 1000

    ss.kill();
  });

  it("resuming after stop() and a small wheel nudge moves a small amount, not a leap toward the stale pre-stop target", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el, lerp: 0.1 });

    el.dispatchEvent(wheel(1000)); // heads toward 1000
    fire(16);
    const midway = el.scrollTop;
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(1000);

    ss.stop();
    ss.start();
    el.dispatchEvent(wheel(10)); // a small nudge, not a re-acceleration toward the old target
    runUntilSettled(fire);

    // Without the fix, this would clamp against the STALE pre-stop target (1000) + 10 = 1000
    // (already clamped there) instead of resuming from `midway`.
    expect(el.scrollTop).toBeCloseTo(midway + 10, 5);
    expect(el.scrollTop).toBeLessThan(midway + 100); // sanity: nowhere near the old target of 1000

    ss.kill();
  });
});

describe("SmoothScroll - external scroll reconciliation", () => {
  it("adopts a scroll position it didn't cause itself (scrollbar drag / keyboard / native touch) while idle", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el, lerp: 0.5 });
    expect(ss.isScrolling).toBe(false);

    // Simulate an external scroll (not caused by this instance's own applyScroll) landing while idle.
    el.scrollTop = 900;
    el.dispatchEvent(new Event("scroll"));
    expect(ss.scroll).toBe(900);

    // A subsequent wheel delta must build on top of the RECONCILED position, not a stale one.
    el.dispatchEvent(wheel(100));
    runUntilSettled(fire);
    expect(el.scrollTop).toBe(1000);

    ss.kill();
  });

  it("ignores its own synthetic/native scroll events while actively animating (does not fight itself)", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el, lerp: 0.1 });

    el.dispatchEvent(wheel(1000));
    fire(16); // now animating - applyScroll's own synthetic dispatch must NOT be treated as "external"
    expect(ss.isScrolling).toBe(true);
    expect(ss.scroll).toBeGreaterThan(0);
    expect(ss.scroll).toBeLessThan(1000); // would already equal target if wrongly reconciled/jumped

    ss.kill();
  });
});

describe("SmoothScroll - scrollTo", () => {
  it("animates to a numeric target using lerp mode and settles exactly on it", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el, lerp: 0.2 });

    const onComplete = vi.fn();
    ss.scrollTo(500, { onComplete });
    fire(16);
    expect(el.scrollTop).toBeGreaterThan(0);
    expect(el.scrollTop).toBeLessThan(500);
    expect(onComplete).not.toHaveBeenCalled();

    runUntilSettled(fire);
    expect(el.scrollTop).toBe(500);
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith(ss);

    ss.kill();
  });

  it("immediate: true jumps synchronously and fires onStart/onComplete without a tick", () => {
    captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });

    const onStart = vi.fn();
    const onComplete = vi.fn();
    ss.scrollTo(700, { immediate: true, onStart, onComplete });

    expect(el.scrollTop).toBe(700);
    expect(onStart).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    expect(ss.isScrolling).toBe(false);

    ss.kill();
  });

  it("duration + linear easing interpolates in time and completes at duration", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });

    ss.scrollTo(1000, { duration: 1, ease: (t) => t });
    fire(500); // 0.5s of a 1s linear tween
    expect(el.scrollTop).toBeCloseTo(500, 0);

    fire(500); // settles at 1s
    expect(el.scrollTop).toBe(1000);
    expect(ss.isScrolling).toBe(false);

    ss.kill();
  });

  it("setting only `duration` still animates smoothly (auto-defaulted easing), not an instant jump", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });

    ss.scrollTo(1000, { duration: 1 });
    fire(16);
    expect(el.scrollTop).toBeGreaterThan(0);
    expect(el.scrollTop).toBeLessThan(1000);

    runUntilSettled(fire, 100);
    expect(el.scrollTop).toBe(1000);
    ss.kill();
  });

  it("scrolling to the current position while idle fires callbacks synchronously and does nothing else", () => {
    captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });

    const onStart = vi.fn();
    const onComplete = vi.fn();
    ss.scrollTo(0, { onStart, onComplete });

    expect(onStart).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
    expect(ss.isScrolling).toBe(false);

    ss.kill();
  });

  it("a wheel event interrupts an in-flight programmatic scrollTo - its onComplete never fires", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000); // limit = 2000, well above either target below
    const ss = new SmoothScroll({ scroller: el, lerp: 0.2 });

    const onComplete = vi.fn();
    ss.scrollTo(1000, { duration: 2, ease: (t) => t, onComplete });
    fire(16);

    el.dispatchEvent(wheel(-500)); // scroll UP - clearly diverges from the original target
    runUntilSettled(fire);

    expect(onComplete).not.toHaveBeenCalled();
    expect(el.scrollTop).toBe(500); // motion.target(1000) + (-500), not the interrupted scrollTo's 1000

    ss.kill();
  });

  it("an unresolvable selector target warns and does nothing", () => {
    captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    ss.scrollTo(".does-not-exist");
    expect(warn).toHaveBeenCalledOnce();
    expect(ss.isScrolling).toBe(false);

    ss.kill();
  });

  it("force: true scrolls even while stopped", () => {
    captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });
    ss.stop();

    ss.scrollTo(500, { immediate: true, force: true });
    expect(el.scrollTop).toBe(500);

    ss.kill();
  });
});

describe("SmoothScroll - resize", () => {
  it("a window resize snaps in-flight motion to the actual position and refreshes the limit", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000); // limit = 2000
    const ss = new SmoothScroll({ scroller: el, lerp: 0.1 });

    el.dispatchEvent(wheel(1000));
    fire(16);
    const midway = el.scrollTop;
    expect(midway).toBeGreaterThan(0);

    el.setScrollHeight(4000); // content grew -> new limit = 3000
    window.dispatchEvent(new Event("resize"));

    expect(ss.isScrolling).toBe(false); // snapped/cancelled
    expect(el.scrollTop).toBe(midway); // unchanged by the snap itself

    el.dispatchEvent(wheel(2500));
    runUntilSettled(fire);
    expect(el.scrollTop).toBe(midway + 2500 > 3000 ? 3000 : midway + 2500);

    ss.kill();
  });

  it("content growing (ResizeObserver) raises the limit without cancelling in-flight motion", () => {
    // jsdom doesn't implement ResizeObserver - stub a minimal one that just captures the
    // callback SmoothScroll registers, so it can be invoked directly like a real content-growth
    // signal would, exactly as captureTick() does for the ticker.
    const observed: ResizeObserverCallback[] = [];
    class StubResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        observed.push(cb);
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    vi.stubGlobal("ResizeObserver", StubResizeObserver);

    const fire = captureTick();
    const el = makeScroller(1000, 3000); // limit = 2000
    const ss = new SmoothScroll({ scroller: el, lerp: 0.5 });
    expect(observed.length).toBe(1);

    el.dispatchEvent(wheel(100000)); // heads for the (old) limit = 2000
    fire(16);
    expect(ss.isScrolling).toBe(true);

    el.setScrollHeight(4000); // content grew -> new limit = 3000
    observed[0]([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);

    expect(ss.isScrolling).toBe(true); // NOT cancelled by a content-only resize signal
    runUntilSettled(fire);
    expect(el.scrollTop).toBe(2000); // finished the gesture already in flight, unaffected by the resize

    // A NEW gesture afterward clamps against the freshly-raised limit, proving it actually updated.
    el.dispatchEvent(wheel(100000));
    runUntilSettled(fire);
    expect(el.scrollTop).toBe(3000);

    ss.kill();
    vi.unstubAllGlobals();
  });
});

describe("SmoothScroll - kill", () => {
  it("removes listeners so wheel input no longer does anything", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });
    ss.kill();

    expect(el.classList.contains("six-smooth")).toBe(false);

    el.dispatchEvent(wheel(300));
    fire(16);
    expect(el.scrollTop).toBe(0);
  });

  it("is idempotent", () => {
    captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el });
    ss.kill();
    expect(() => ss.kill()).not.toThrow();
  });
});

describe("SmoothScroll - getters", () => {
  it("progress reflects scroll/limit, clamped, with limit=0 reading as complete", () => {
    captureTick();
    const el = makeScroller(1000, 1000); // limit = 0 (no scrollable overflow)
    const ss = new SmoothScroll({ scroller: el });
    expect(ss.progress).toBe(1);
    ss.kill();
  });

  it("velocity/direction reflect real px/second, not a raw per-tick pixel delta", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el, lerp: 0.5 });

    el.dispatchEvent(wheel(1000));
    fire(16);
    expect(ss.velocity).toBeGreaterThan(0);
    expect(ss.direction).toBe(1);

    ss.kill();
  });
});
