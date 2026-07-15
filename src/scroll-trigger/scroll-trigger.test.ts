import { afterEach, describe, expect, it, vi } from "vitest";
import { parseEdge, resolvePositionString, ScrollTrigger } from "./scroll-trigger";
import { invalidateReads } from "./observer";
import { Tween } from "../tween/tween";

describe("parseEdge", () => {
  it("resolves top/center/bottom keywords to ratios", () => {
    expect(parseEdge("top")).toEqual({ ratio: 0, offsetPx: 0 });
    expect(parseEdge("center")).toEqual({ ratio: 0.5, offsetPx: 0 });
    expect(parseEdge("bottom")).toEqual({ ratio: 1, offsetPx: 0 });
  });

  it("resolves a percentage to a ratio", () => {
    expect(parseEdge("30%")).toEqual({ ratio: 0.3, offsetPx: 0 });
  });

  it("resolves a bare number to a pixel offset", () => {
    expect(parseEdge("50")).toEqual({ ratio: 0, offsetPx: 50 });
    expect(parseEdge("-20")).toEqual({ ratio: 0, offsetPx: -20 });
  });
});

describe("resolvePositionString", () => {
  const rect = { top: 500, height: 200 }; // trigger's viewport-relative top + height
  const scrollY = 100; // page currently scrolled 100px
  const viewportSize = 800;

  it("'top top': trigger's top aligns with the viewport's top", () => {
    // trigger top in document coords = scrollY + rect.top = 600; viewport top offset = 0
    expect(resolvePositionString("top top", rect, scrollY, viewportSize)).toBe(600);
  });

  it("'top bottom' (the default start): trigger's top aligns with the viewport's bottom", () => {
    // viewport bottom offset = viewportSize -> 600 - 800 = -200
    expect(resolvePositionString("top bottom", rect, scrollY, viewportSize)).toBe(-200);
  });

  it("'bottom top' (the default end): trigger's bottom aligns with the viewport's top", () => {
    // trigger bottom in document coords = 600 + 200 = 800
    expect(resolvePositionString("bottom top", rect, scrollY, viewportSize)).toBe(800);
  });

  it("'center center'", () => {
    // trigger center = 600 + 100 = 700; viewport center offset = 400
    expect(resolvePositionString("center center", rect, scrollY, viewportSize)).toBe(300);
  });

  it("supports a percentage viewport edge", () => {
    expect(resolvePositionString("top 25%", rect, scrollY, viewportSize)).toBe(600 - 200);
  });
});

describe("ScrollTrigger - integration", () => {
  // window.scrollY/innerHeight are mocked via vi.spyOn(..., "get") (an accessor spy vitest
  // properly tears down in restoreAllMocks()) rather than Object.defineProperty, which would
  // otherwise leave a plain own-property shadowing the getter that persists across tests and
  // corrupts later tests' measurements.
  afterEach(() => {
    ScrollTrigger.getAll().forEach((st) => st.kill());
    vi.restoreAllMocks();
  });

  function mockRect(el: Element, top: number, height: number): void {
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top,
      height,
      bottom: top + height,
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

  function scrollTo(y: number): void {
    vi.spyOn(window, "scrollY", "get").mockReturnValue(y);
    // Explicitly invalidate the observer's read cache rather than relying solely on the
    // dispatched event to do it: before a ScrollTrigger exists (e.g. setting up the initial
    // scroll position ahead of construction), there's no listener attached yet to catch the
    // event, so the cache would otherwise keep serving a stale value from an earlier test.
    invalidateReads();
    window.dispatchEvent(new Event("scroll"));
  }

  it("computes progress based on scroll position between start and end", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 0, 100); // with scrollY=0: start("top bottom") = 0-800=-800, end("bottom top")=100

    mockViewportHeight(800);
    scrollTo(0);

    const st = new ScrollTrigger({ trigger });
    expect(st.progress()).toBeCloseTo(800 / 900, 2); // (0 - (-800)) / (100 - (-800))
  });

  it("resolves 'end: \"+=N\"' as N pixels past the resolved start (the pin-distance idiom), not a trigger/viewport edge position", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 0, 100);
    mockViewportHeight(800);
    scrollTo(0);

    // start defaults to "top bottom" = -800; end should land at exactly start + 1200
    const st = new ScrollTrigger({ trigger, end: "+=1200" });

    scrollTo(-800 + 600); // halfway through the intended 1200px span
    expect(st.progress()).toBeCloseTo(0.5, 2);
  });

  it("fires onEnter/onLeave based on scroll direction", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 500, 100);
    mockViewportHeight(800);
    scrollTo(0);

    const onEnter = vi.fn();
    const onLeave = vi.fn();
    const onEnterBack = vi.fn();
    const onLeaveBack = vi.fn();

    new ScrollTrigger({ trigger, start: "top top", end: "bottom top", onEnter, onLeave, onEnterBack, onLeaveBack });
    // start = scrollY(0)+500 = 500; end = scrollY(0)+500+100 = 600

    scrollTo(550); // inside [500,600], scrolling forward
    expect(onEnter).toHaveBeenCalledOnce();

    scrollTo(700); // past end, still forward
    expect(onLeave).toHaveBeenCalledOnce();

    scrollTo(550); // back inside, scrolling backward
    expect(onEnterBack).toHaveBeenCalledOnce();

    scrollTo(0); // back before start, scrolling backward
    expect(onLeaveBack).toHaveBeenCalledOnce();
  });

  it("plays a paused animation on enter and reverses it on leaveBack (toggle mode, no scrub)", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 500, 100);
    mockViewportHeight(800);
    scrollTo(0);

    const target = document.createElement("div");
    target.style.opacity = "0";
    const animation = new Tween(target, { opacity: 1, duration: 1, ease: "none" });

    new ScrollTrigger({ trigger, start: "top top", end: "bottom top", animation });
    expect(animation.paused()).toBe(true); // paused immediately, waiting for scroll

    scrollTo(550);
    expect(animation.paused()).toBe(false);
  });

  it("drives an animation's progress directly in scrub mode", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 0, 100);
    mockViewportHeight(800);
    scrollTo(0);

    const target = document.createElement("div");
    target.style.opacity = "0";
    const animation = new Tween(target, { opacity: 1, duration: 1, ease: "none" });

    // start = -800, end = 100 -> span of 900
    new ScrollTrigger({ trigger, animation, scrub: true });

    scrollTo(-800 + 450); // halfway through the span
    expect(animation.totalProgress()).toBeCloseTo(0.5, 2);
    expect(target.style.opacity).toBe("0.5");
  });

  it("kill() removes the instance from the registry and detaches its listeners", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 0, 100);

    const st = new ScrollTrigger({ trigger });
    expect(ScrollTrigger.getAll()).toContain(st);

    st.kill();
    expect(ScrollTrigger.getAll()).not.toContain(st);
  });

  it("warns instead of crashing when pin is given a value that isn't true/a selector/an Element", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 0, 100);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // a plain number (e.g. a typo'd "pin duration") is not a valid pin value in this API
    expect(() => new ScrollTrigger({ trigger, pin: 0.7 as unknown as true })).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("pin must be true"));
  });
});
