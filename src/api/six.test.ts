import { afterEach, describe, expect, it, vi } from "vitest";
import { six, ScrollTrigger } from "./six";
import { rootTimeline } from "../core/root";
import { Tween } from "../tween/tween";
import { Timeline } from "../timeline/timeline";
import { invalidateReads } from "../scroll-trigger/observer";

// rootTimeline is a real module-level singleton shared across every test in the process, so
// each test captures its OWN starting point and only advances forward relative to it, rather
// than asserting against absolute root time - keeps tests independent of execution order and
// of whatever earlier tests already did to the shared root.
function rootNow(): number {
  return rootTimeline.totalTime() as number;
}

function el(): HTMLDivElement {
  return document.createElement("div");
}

describe("six.to/from/fromTo", () => {
  it("six.to() returns a Tween parented under the root timeline and plays immediately", () => {
    const a = el();
    a.style.opacity = "0";
    const t0 = rootNow();

    const tween = six.to(a, { opacity: 1, duration: 1, ease: "none" });

    expect(tween).toBeInstanceOf(Tween);
    expect((tween as Tween).parent).toBe(rootTimeline);

    rootTimeline.totalTime(t0 + 0.5, true);
    expect(a.style.opacity).toBe("0.5");
  });

  it("six.from() and six.fromTo() work the same as their Timeline counterparts", () => {
    const a = el();
    a.style.opacity = "1";
    const b = el();
    const t0 = rootNow();

    six.from(a, { opacity: 0, duration: 1, ease: "none" });
    six.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 1, ease: "none" });

    rootTimeline.totalTime(t0 + 0.5, true);
    expect(a.style.opacity).toBe("0.5");
    expect(b.style.opacity).toBe("0.5");
  });

  it("independently created tweens play concurrently, not queued behind one another", () => {
    const a = el();
    a.style.opacity = "0";
    const b = el();
    b.style.opacity = "0";
    const t0 = rootNow();

    six.to(a, { opacity: 1, duration: 1, ease: "none" });
    rootTimeline.totalTime(t0 + 0.1, true); // small gap between creating a and b
    six.to(b, { opacity: 1, duration: 1, ease: "none" });

    rootTimeline.totalTime(t0 + 0.6, true);
    expect(a.style.opacity).toBe("0.6"); // 0.5s into its own 1s
    expect(b.style.opacity).toBe("0.5"); // 0.5s into ITS own 1s (started 0.1s later)
  });
});

describe("six.set", () => {
  it("applies instantly", () => {
    const a = el();
    a.style.opacity = "0";

    six.set(a, { opacity: 0.75 });

    expect(a.style.opacity).toBe("0.75");
  });
});

describe("six.timeline", () => {
  it("returns a Timeline parented under the root, usable for sequencing", () => {
    const a = el();
    a.style.opacity = "0";
    const b = el();
    b.style.opacity = "0";
    const t0 = rootNow();

    const tl = six.timeline();
    expect(tl).toBeInstanceOf(Timeline);
    expect(tl.parent).toBe(rootTimeline);

    tl.to(a, { opacity: 1, duration: 1, ease: "none" });
    tl.to(b, { opacity: 1, duration: 1, ease: "none" });

    rootTimeline.totalTime(t0 + 0.5, true);
    expect(a.style.opacity).toBe("0.5");
    expect(b.style.opacity).toBe("0");
  });

  it("respects vars.paused", () => {
    const a = el();
    a.style.opacity = "0";
    const t0 = rootNow();

    const tl = six.timeline({ paused: true });
    tl.to(a, { opacity: 1, duration: 1, ease: "none" });

    rootTimeline.totalTime(t0 + 0.5, true);
    expect(a.style.opacity).toBe("0"); // never advanced - still paused
  });
});

describe("six.to - stagger", () => {
  it("wraps staggered tweens in a Timeline so the whole group can be controlled as one", () => {
    const a = el();
    a.style.opacity = "0";
    const b = el();
    b.style.opacity = "0";
    const t0 = rootNow();

    const group = six.to([a, b], { opacity: 1, duration: 1, ease: "none", stagger: 0.5 });
    expect(group).toBeInstanceOf(Timeline);

    rootTimeline.totalTime(t0 + 0.5, true);
    expect(a.style.opacity).toBe("0.5");
    expect(b.style.opacity).toBe("0");

    (group as Timeline).pause();
    rootTimeline.totalTime(t0 + 5, true);
    expect(a.style.opacity).toBe("0.5"); // whole group frozen by one .pause() call
    expect(b.style.opacity).toBe("0");
  });
});

describe("six.config", () => {
  it("changes the fallback duration/ease used when a tween doesn't specify its own", () => {
    const a = el();
    a.style.opacity = "0";
    const t0 = rootNow();

    six.config({ duration: 2, ease: "none" });
    six.to(a, { opacity: 1 });

    rootTimeline.totalTime(t0 + 1, true);
    expect(a.style.opacity).toBe("0.5"); // 1s into a 2s default duration

    six.config({ duration: 0.5, ease: "power1.out" }); // restore factory defaults for other tests
  });
});

describe("six.context", () => {
  it("captures animations created within it and kills them on revert", () => {
    const a = el();

    let tween: Tween | Timeline | undefined;
    const ctx = six.context(() => {
      tween = six.to(a, { opacity: 1, duration: 1 });
    });

    expect(tween?.parent).toBe(rootTimeline);

    ctx.revert();

    expect(tween?.parent).toBeNull();
  });
});

describe("six.to - scrollTrigger", () => {
  afterEach(() => {
    ScrollTrigger.getAll().forEach((st) => st.kill());
    vi.restoreAllMocks();
  });

  function mockRect(target: Element, top: number, height: number): void {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
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

  function scrollTo(y: number): void {
    vi.spyOn(window, "scrollY", "get").mockReturnValue(y);
    invalidateReads();
    window.dispatchEvent(new Event("scroll"));
  }

  it("defaults scrollTrigger.trigger to the tween's own target and pauses it until scrubbed", () => {
    const a = el();
    a.style.opacity = "0";
    mockRect(a, 0, 100);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(800);
    scrollTo(0);

    const tween = six.to(a, { opacity: 1, duration: 1, ease: "none", scrollTrigger: { scrub: true } }) as Tween;
    expect(tween.paused()).toBe(true);

    // default start/end: "top bottom" -> -800, "bottom top" -> 100, span 900
    scrollTo(-800 + 450);
    expect(tween.totalProgress()).toBeCloseTo(0.5, 2);
    expect(a.style.opacity).toBe("0.5");
  });
});
