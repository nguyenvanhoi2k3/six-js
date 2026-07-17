import { afterEach, describe, expect, it, vi } from "vitest";
import { ticker, TickerListener } from "../core/ticker";
import { OnScroll } from "../on-scroll/on-scroll";
import { SmoothScroll } from "./smooth-scroll";

// Proves the actual ask this plugin exists to satisfy: SmoothScroll's own scroll-position writes
// must be picked up by OnScroll (six-js's ScrollTrigger) with no extra wiring on OnScroll's part,
// and with no lag - not "eventually, once the async native scroll event gets around to firing".

function captureTick(): (deltaMs: number) => void {
  let captured: TickerListener | undefined;
  vi.spyOn(ticker, "add").mockImplementation((cb) => {
    captured = cb;
    return cb;
  });
  vi.spyOn(ticker, "remove").mockImplementation(() => {});
  return (deltaMs: number) => captured?.(0, deltaMs, 0);
}

function makeScroller(clientHeight: number, scrollHeight: number): HTMLDivElement {
  const el = document.createElement("div");
  Object.defineProperty(el, "clientHeight", { value: clientHeight, configurable: true });
  Object.defineProperty(el, "scrollHeight", { value: scrollHeight, configurable: true });
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  OnScroll.getAll().forEach((st) => st.kill());
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("SmoothScroll + OnScroll integration", () => {
  it("OnScroll.onUpdate fires synchronously within the same tick SmoothScroll moves the scroll position", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000); // limit = 2000
    const ss = new SmoothScroll({ scroller: el, lerp: 0.5 });

    const trigger = document.createElement("div");
    const readings: number[] = [];
    const onScroll = OnScroll.create({
      trigger,
      scroller: el,
      start: 0,
      end: 2000,
      onUpdate: (self) => readings.push(self.progress()),
    });
    readings.length = 0; // discard the construction-time snapshot call

    el.dispatchEvent(new WheelEvent("wheel", { deltaY: 400, cancelable: true }));
    fire(16);

    expect(readings.length).toBeGreaterThan(0);
    expect(readings[readings.length - 1]).toBeCloseTo(el.scrollTop / 2000, 5);

    ss.kill();
    onScroll.kill();
  });

  it("an OnScroll-driven animation plays exactly once, from a smooth-scrolled crossing, with no double-fire from the trailing native event", () => {
    const fire = captureTick();
    const el = makeScroller(1000, 3000);
    const ss = new SmoothScroll({ scroller: el, lerp: 0.6 });

    const trigger = document.createElement("div");
    const onEnter = vi.fn();
    const onScroll = OnScroll.create({
      trigger,
      scroller: el,
      start: 100,
      end: 2000,
      onEnter,
    });

    el.dispatchEvent(new WheelEvent("wheel", { deltaY: 2000, cancelable: true }));
    for (let i = 0; i < 600 && ss.isScrolling; i++) fire(16);

    // The real (async) native "scroll" event that setScroll() also triggers never actually
    // fires in jsdom's synchronous dispatch model here, but the synthetic one SmoothScroll
    // dispatches itself must not cause onEnter to double-fire either.
    expect(onEnter).toHaveBeenCalledOnce();

    ss.kill();
    onScroll.kill();
  });

  it("OnScroll keeps working unmodified for a DIFFERENT scroller that SmoothScroll never touches", () => {
    const fire = captureTick();
    const smoothed = makeScroller(1000, 3000);
    const untouched = makeScroller(500, 1500); // limit = 1000, plain native scrolling

    const ss = new SmoothScroll({ scroller: smoothed, lerp: 0.5 });

    const trigger = document.createElement("div");
    const readings: number[] = [];
    const onScroll = OnScroll.create({
      trigger,
      scroller: untouched,
      start: 0,
      end: 1000,
      onUpdate: (self) => readings.push(self.progress()),
    });
    readings.length = 0;

    // Smooth-scrolling the OTHER element must not affect this trigger at all.
    smoothed.dispatchEvent(new WheelEvent("wheel", { deltaY: 500, cancelable: true }));
    fire(16);
    expect(readings.length).toBe(0);

    // The untouched scroller still works exactly like plain native OnScroll usage.
    untouched.scrollTop = 500;
    untouched.dispatchEvent(new Event("scroll"));
    expect(readings.length).toBe(1);
    expect(readings[0]).toBeCloseTo(0.5, 5);

    ss.kill();
    onScroll.kill();
  });
});
