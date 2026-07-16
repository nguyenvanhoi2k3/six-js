import { afterEach, describe, expect, it, vi } from "vitest";
import { parseEdge, resolvePositionString, resolveTriggerEdgeY, resolveViewportEdgeOffset, OnScroll } from "./on-scroll";
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

  it("applies a '+=N'/'-=N' suffix as an extra pixel offset on top of a keyword/%/number base", () => {
    expect(parseEdge("top+=100")).toEqual({ ratio: 0, offsetPx: 100 });
    expect(parseEdge("bottom-=50")).toEqual({ ratio: 1, offsetPx: -50 });
    expect(parseEdge("30%+=20")).toEqual({ ratio: 0.3, offsetPx: 20 });
    expect(parseEdge("50-=20")).toEqual({ ratio: 0, offsetPx: 30 });
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

describe("resolveTriggerEdgeY / resolveViewportEdgeOffset", () => {
  const rect = { top: 500, height: 200 };
  const scrollY = 100;
  const viewportSize = 800;

  it("resolveTriggerEdgeY only depends on the trigger's own position, not viewportSize", () => {
    // trigger top in document coords = scrollY + rect.top = 600, regardless of the viewport token
    expect(resolveTriggerEdgeY("top bottom", rect, scrollY)).toBe(600);
    expect(resolveTriggerEdgeY("top top", rect, scrollY)).toBe(600);
    expect(resolveTriggerEdgeY("center center", rect, scrollY)).toBe(700);
  });

  it("resolveViewportEdgeOffset only depends on the viewport token/size, not the trigger's position", () => {
    expect(resolveViewportEdgeOffset("top bottom", viewportSize)).toBe(800);
    expect(resolveViewportEdgeOffset("top top", viewportSize)).toBe(0);
    expect(resolveViewportEdgeOffset("center center", viewportSize)).toBe(400);
  });

  it("together, trigger - viewport reproduces resolvePositionString's combined result", () => {
    for (const pos of ["top top", "top bottom", "bottom top", "center center"]) {
      expect(resolveTriggerEdgeY(pos, rect, scrollY) - resolveViewportEdgeOffset(pos, viewportSize)).toBe(
        resolvePositionString(pos, rect, scrollY, viewportSize),
      );
    }
  });
});

describe("OnScroll - integration", () => {
  // window.scrollY/innerHeight are mocked via vi.spyOn(..., "get") (an accessor spy vitest
  // properly tears down in restoreAllMocks()) rather than Object.defineProperty, which would
  // otherwise leave a plain own-property shadowing the getter that persists across tests and
  // corrupts later tests' measurements.
  afterEach(() => {
    OnScroll.getAll().forEach((st) => st.kill());
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
    // dispatched event to do it: before an OnScroll exists (e.g. setting up the initial
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

    const st = new OnScroll({ trigger });
    expect(st.progress()).toBeCloseTo(800 / 900, 2); // (0 - (-800)) / (100 - (-800))
  });

  it("resolves 'end: \"+=N\"' as N pixels past the resolved start (the sticky-distance idiom), not a trigger/viewport edge position", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 0, 100);
    mockViewportHeight(800);
    scrollTo(0);

    // start defaults to "top bottom" = -800; end should land at exactly start + 1200
    const st = new OnScroll({ trigger, end: "+=1200" });

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

    new OnScroll({ trigger, start: "top top", end: "bottom top", onEnter, onLeave, onEnterBack, onLeaveBack });
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

  it("does not fire onUpdate for scroll positions outside the trigger's range - only while inside, or on the exact entering/leaving frame", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 500, 100);
    mockViewportHeight(800);
    scrollTo(0);

    const onUpdate = vi.fn();
    new OnScroll({ trigger, start: "top top", end: "bottom top", onUpdate });
    // start = 500, end = 600 (see the onEnter/onLeave test above for the derivation)
    onUpdate.mockClear(); // ignore the construction-time refresh() call

    scrollTo(50); // nowhere near the range yet
    scrollTo(100);
    scrollTo(200);
    expect(onUpdate).not.toHaveBeenCalled();

    scrollTo(550); // entering
    expect(onUpdate).toHaveBeenCalledTimes(1);

    scrollTo(580); // still inside, progress changing
    expect(onUpdate).toHaveBeenCalledTimes(2);

    scrollTo(700); // leaving - fires once more for the transition itself
    expect(onUpdate).toHaveBeenCalledTimes(3);

    scrollTo(800); // long past the range now - no further change for this instance
    scrollTo(1000);
    expect(onUpdate).toHaveBeenCalledTimes(3);
  });

  it("plays a paused animation when entering forward (toggle mode, no sync)", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 500, 100);
    mockViewportHeight(800);
    scrollTo(0);

    const target = document.createElement("div");
    target.style.opacity = "0";
    const animation = new Tween(target, { opacity: 1, duration: 1, ease: "none" });

    new OnScroll({ trigger, start: "top top", end: "bottom top", animation });
    expect(animation.paused()).toBe(true); // paused immediately, waiting for scroll

    scrollTo(550);
    expect(animation.paused()).toBe(false);
  });

  it("does nothing to the animation on enterBack/leave/leaveBack by default (only a forward crossing of start plays it)", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 500, 100);
    mockViewportHeight(800);
    scrollTo(0);

    const target = document.createElement("div");
    target.style.opacity = "0";
    const animation = new Tween(target, { opacity: 1, duration: 1, ease: "none" });

    new OnScroll({ trigger, start: "top top", end: "bottom top", animation });
    // start = 500, end = 600 (see the onEnter/onLeave test above for the derivation)

    scrollTo(550); // enter forward -> plays
    expect(animation.paused()).toBe(false);
    animation.progress(1); // let it finish, as if the duration had elapsed
    expect(animation.reversed()).toBe(false);

    scrollTo(700); // leave forward -> "none": must not reverse or otherwise touch it
    expect(animation.reversed()).toBe(false);
    expect(animation.progress()).toBe(1);

    scrollTo(550); // enterBack -> "none"
    expect(animation.reversed()).toBe(false);
    expect(animation.progress()).toBe(1);

    scrollTo(0); // leaveBack -> "none": must NOT auto-reverse it back toward 0
    expect(animation.reversed()).toBe(false);
    expect(animation.progress()).toBe(1);
  });

  it("a trigger already behind the scroll position on construction (e.g. a reload deep into the page) shows its animation instantly complete, not replaying from scratch", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 0, 100);
    mockViewportHeight(800);
    scrollTo(5000); // simulates reloading deep into the page

    // fully behind: both start and end are already in the past
    const behindTarget = document.createElement("div");
    behindTarget.style.opacity = "0";
    const behindAnim = new Tween(behindTarget, { opacity: 1, duration: 0.6, ease: "none" });
    const onEnterBehind = vi.fn();
    new OnScroll({ trigger, start: 1000, end: 1100, animation: behindAnim, onEnter: onEnterBehind });

    // start already passed, but end is still ahead (currently "inside" its own range)
    const insideTarget = document.createElement("div");
    insideTarget.style.opacity = "0";
    const insideAnim = new Tween(insideTarget, { opacity: 1, duration: 0.6, ease: "none" });
    const onEnterInside = vi.fn();
    new OnScroll({ trigger, start: 4000, end: 6000, animation: insideAnim, onEnter: onEnterInside });

    // not reached yet - should stay hidden
    const aheadTarget = document.createElement("div");
    aheadTarget.style.opacity = "0";
    const aheadAnim = new Tween(aheadTarget, { opacity: 1, duration: 0.6, ease: "none" });
    const onEnterAhead = vi.fn();
    new OnScroll({ trigger, start: 9000, end: 9100, animation: aheadAnim, onEnter: onEnterAhead });

    expect(behindTarget.style.opacity).toBe("1");
    expect(onEnterBehind).toHaveBeenCalledOnce();
    expect(insideTarget.style.opacity).toBe("1");
    expect(onEnterInside).toHaveBeenCalledOnce();
    expect(aheadTarget.style.opacity).toBe("0");
    expect(onEnterAhead).not.toHaveBeenCalled();
  });

  it("still animates normally (not instantly) for a genuine live-scroll crossing after construction", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 500, 100);
    mockViewportHeight(800);
    scrollTo(0);

    const target = document.createElement("div");
    target.style.opacity = "0";
    const animation = new Tween(target, { opacity: 1, duration: 0.6, ease: "none" });
    new OnScroll({ trigger, start: "top top", end: "bottom top", animation });

    expect(target.style.opacity).toBe("0"); // not reached yet at construction

    scrollTo(550); // live crossing
    expect(animation.paused()).toBe(false);
    expect(target.style.opacity).not.toBe("1"); // still mid-animation, not snapped straight to done
  });

  it("drives an animation's progress directly in sync mode", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 0, 100);
    mockViewportHeight(800);
    scrollTo(0);

    const target = document.createElement("div");
    target.style.opacity = "0";
    const animation = new Tween(target, { opacity: 1, duration: 1, ease: "none" });

    // start = -800, end = 100 -> span of 900
    new OnScroll({ trigger, animation, sync: true });

    scrollTo(-800 + 450); // halfway through the span
    expect(animation.totalProgress()).toBeCloseTo(0.5, 2);
    expect(target.style.opacity).toBe("0.5");
  });

  it("smoothed sync does not visibly rewind on page reload when the browser's async scroll restoration lands after the first read", () => {
    // Regression test for a real reported bug: reloading mid-page, the browser doesn't always
    // have window.scrollY at the restored position by the time this library's synchronous
    // script runs - construction reads a stale value (here, 0), and the browser's own
    // restoration fires its own native "scroll" event moments later with the real position.
    // Before the fix, that later event was treated as an ordinary sync update and SMOOTHED
    // from the stale reading to the real one, i.e. the tween visibly rewound to 0 and eased
    // back into place on every reload - even before any real animation frame (ticker tick) had
    // a chance to occur, so "smoothing" was never actually meaningful for it.
    const trigger = document.createElement("div");
    mockRect(trigger, 0, 100);
    mockViewportHeight(800);
    scrollTo(0); // simulates the page not yet having its scroll position restored

    const target = document.createElement("div");
    const animation = new Tween(target, { opacity: 1, duration: 1, ease: "none" });

    // start = -800, end = 100 -> span of 900; sync as a number selects the smoothed controller
    new OnScroll({ trigger, animation, sync: 0.6 });
    // construction-time refresh() read the "stale" scrollY = 0, i.e. progress (0-(-800))/900
    expect(animation.totalProgress()).toBeCloseTo(800 / 900, 5);

    // the browser "restores" scroll shortly after, dispatching its own native scroll event -
    // no ticker tick has occurred in between (nothing here advances the ticker).
    scrollTo(-800 + 450); // halfway through the span
    expect(animation.totalProgress()).toBeCloseTo(0.5, 2); // snapped instantly, not mid-ease
  });

  it("kill() removes the instance from the registry and detaches its listeners", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 0, 100);

    const st = new OnScroll({ trigger });
    expect(OnScroll.getAll()).toContain(st);

    st.kill();
    expect(OnScroll.getAll()).not.toContain(st);
  });

  it("warns instead of crashing when sticky is given a value that isn't true/a selector/an Element", () => {
    const trigger = document.createElement("div");
    mockRect(trigger, 0, 100);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // a plain number (e.g. a typo'd "sticky duration") is not a valid sticky value in this API
    expect(() => new OnScroll({ trigger, sticky: 0.7 as unknown as true })).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("sticky must be true"));
  });

  it("sticks a 'center center' trigger at its natural vertically-centered position, not the viewport top", () => {
    // regression test for a real reported bug: sticking always used `top: 0`, so anything stuck
    // via a non-"top top" start snapped to the viewport's top edge instead of staying where it
    // naturally sat (e.g. vertically centered) when it started sticking.
    const trigger = document.createElement("div");
    document.body.appendChild(trigger); // setupSticky() needs a real parent to insert its spacer before
    const triggerHeight = 150;
    const viewportHeight = 800;
    mockRect(trigger, 0, triggerHeight); // rect.top = 0 at scrollY = 0 (set below)
    mockViewportHeight(viewportHeight);
    scrollTo(0);

    const st = new OnScroll({ trigger, start: "center center", end: "+=500", sticky: true });

    // naturalDocTop (rect.top(0) + scrollY(0)) = 0; startY = 0 + 0.5*150 - 0.5*800 = -325
    // expected stickyTop = naturalDocTop - startY = 0 - (-325) = 325 (vertically centers a
    // 150px-tall element in an 800px viewport: (800-150)/2 = 325)
    scrollTo(-325); // scroll to exactly startY so the trigger sticks
    expect(trigger.style.position).toBe("fixed");
    expect(trigger.style.top).toBe("325px");

    st.kill();
    trigger.remove();
  });
});

describe("OnScroll - syncTo/axis", () => {
  afterEach(() => {
    OnScroll.getAll().forEach((st) => st.kill());
    vi.restoreAllMocks();
  });

  // simulates a word inside a horizontally-scrubbed track: the container moves everything left
  // by `totalTravel` px total as `container` goes from totalProgress 0 to 1, so the word's own
  // rect.left is a linear function of the container's current progress.
  function mockHorizontalWord(el: Element, naturalLeft: number, width: number, container: Tween, totalTravel: number): void {
    vi.spyOn(el, "getBoundingClientRect").mockImplementation(() => {
      const left = naturalLeft - totalTravel * (container.totalProgress() as number);
      return { top: 0, height: 0, bottom: 0, left, right: left + width, width, x: left, y: 0, toJSON: () => ({}) } as DOMRect;
    });
  }

  function mockViewportWidth(width: number): void {
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(width);
  }

  it("resolves start as a sync-source-progress ratio, based on the trigger's measured position at syncTo progress 0 and 1", () => {
    mockViewportWidth(1000);
    const container = new Tween(document.createElement("div"), { x: -1000, duration: 1, ease: "none" });
    const word = document.createElement("span");
    mockHorizontalWord(word, 800, 100, container, 1000);

    // edge(p) = 800 - 1000p; "left 50%" wants edge(p) = 500 -> p = 0.3
    const st = new OnScroll({ trigger: word, start: "left 50%", axis: "x", syncTo: container });
    expect(st.progress()).toBeCloseTo(0, 5); // container is still at progress 0, well before the 0.3 threshold
  });

  it("fires onEnter exactly when the container's progress crosses the resolved threshold, forward only", () => {
    mockViewportWidth(1000);
    const container = new Tween(document.createElement("div"), { x: -1000, duration: 1, ease: "none" });
    const word = document.createElement("span");
    mockHorizontalWord(word, 800, 100, container, 1000);

    const onEnter = vi.fn();
    new OnScroll({ trigger: word, start: "left 50%", axis: "x", syncTo: container, onEnter });

    container.totalProgress(0.1); // before the 0.3 threshold
    expect(onEnter).not.toHaveBeenCalled();

    container.totalProgress(0.5); // crossed forward past 0.3
    expect(onEnter).toHaveBeenCalledOnce();
  });

  it("reacts only to the syncTo source's own updates, not native page scroll", () => {
    mockViewportWidth(1000);
    const container = new Tween(document.createElement("div"), { x: -1000, duration: 1, ease: "none" });
    const word = document.createElement("span");
    mockHorizontalWord(word, 800, 100, container, 1000);

    const onEnter = vi.fn();
    new OnScroll({ trigger: word, start: "left 50%", axis: "x", syncTo: container, onEnter });

    vi.spyOn(window, "scrollY", "get").mockReturnValue(999999);
    window.dispatchEvent(new Event("scroll"));
    expect(onEnter).not.toHaveBeenCalled();

    container.totalProgress(0.5);
    expect(onEnter).toHaveBeenCalledOnce();
  });

  it("interprets a relative 'end: \"+=N\"' as N pixels of the trigger's own measured travel, converted to an equivalent progress delta", () => {
    mockViewportWidth(1000);
    const container = new Tween(document.createElement("div"), { x: -1000, duration: 1, ease: "none" });
    const word = document.createElement("span");
    mockHorizontalWord(word, 800, 100, container, 1000); // moves 1000px total across progress 0->1

    const st = new OnScroll({ trigger: word, start: "left 50%", axis: "x", syncTo: container, end: "+=200" });
    // start = 0.3 (as above); "+=200" of the trigger's own 1000px total travel -> +0.2 progress
    container.totalProgress(0.3);
    expect(st.progress()).toBeCloseTo(0, 2);
    container.totalProgress(0.5); // 0.3 + 0.2 = 0.5, fully through the +=200 span
    expect(st.progress()).toBeCloseTo(1, 2);
  });

  it("kill() unsubscribes from the syncTo source's update event", () => {
    mockViewportWidth(1000);
    const container = new Tween(document.createElement("div"), { x: -1000, duration: 1, ease: "none" });
    const word = document.createElement("span");
    mockHorizontalWord(word, 800, 100, container, 1000);

    const onEnter = vi.fn();
    const st = new OnScroll({ trigger: word, start: "left 50%", axis: "x", syncTo: container, onEnter });
    st.kill();

    container.totalProgress(0.5);
    expect(onEnter).not.toHaveBeenCalled();
  });
});
