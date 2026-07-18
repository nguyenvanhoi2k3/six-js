import { afterEach, describe, expect, it, vi } from "vitest";
import { DrawAnimation, drawSVG } from "./draw";
import { rootTimeline } from "../../core/root";
import { Timeline } from "../../timeline/timeline";

// jsdom implements no SVG geometry methods at all (see CLAUDE.md's Testing section) - assigning
// getTotalLength directly (not vi.spyOn, which requires the method to already exist) is the only
// way to give a test element a controllable length.
function makePath(length: number): SVGPathElement {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as unknown as SVGPathElement;
  path.setAttribute("d", "M0,0 L100,0");
  (path as unknown as { getTotalLength: () => number }).getTotalLength = () => length;
  return path;
}

function rootNow(): number {
  return rootTimeline.totalTime() as number;
}

// rootTimeline is a real, wall-clock-ticker-driven singleton (see api/six.test.ts's own note on
// this) - a value derived from `t0 + 0.5` against it can land a hair off an exact half (e.g.
// 49.999999999999986) depending on incidental floating-point noise in t0 itself, so these two
// integration tests parse and compare with tolerance rather than exact string equality.
function parseDasharray(value: string): [number, number] {
  const [a, b] = value.split(" ").map(Number);
  return [a, b];
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DrawAnimation", () => {
  it("defaults to drawing 0% -> 100%: dasharray grows, dashoffset stays pinned at the start", () => {
    const path = makePath(100);
    const anim = new DrawAnimation(path, { duration: 1, ease: "none" });

    anim.totalTime(0, true);
    expect(path.style.strokeDasharray).toBe("0 100");

    anim.totalTime(0.5, true);
    expect(path.style.strokeDasharray).toBe("50 50");
    expect(path.style.strokeDashoffset).toBe("0");

    anim.totalTime(1, true);
    expect(path.style.strokeDasharray).toBe("100 0.0001");
  });

  it("supports a single `to` percentage meaning [0, value] - a partial, fixed-start reveal", () => {
    const path = makePath(200);
    const anim = new DrawAnimation(path, { duration: 1, ease: "none", to: "50%" });

    anim.totalTime(1, true);
    expect(path.style.strokeDasharray).toBe("100 100");
    expect(path.style.strokeDashoffset).toBe("0");
  });

  it("supports an erase effect via from/to both being full-window percentages", () => {
    const path = makePath(100);
    const anim = new DrawAnimation(path, { duration: 1, ease: "none", from: "100%", to: "0%" });

    anim.totalTime(0, true);
    expect(path.style.strokeDasharray).toBe("100 0.0001");
    anim.totalTime(1, true);
    expect(path.style.strokeDasharray).toBe("0 100");
  });

  it("supports a two-token 'A% B%' window that moves both ends (a comet/segment reveal)", () => {
    const path = makePath(100);
    const anim = new DrawAnimation(path, { duration: 1, ease: "none", from: "0% 0%", to: "50% 100%" });

    anim.totalTime(1, true);
    expect(path.style.strokeDasharray).toBe("50 50");
    expect(path.style.strokeDashoffset).toBe("-50");
  });

  it("does not clamp the window to 0-100%, so a from/to exactly one lap apart wraps seamlessly (no reset jump) under repeat: -1", () => {
    const path = makePath(100);
    // one full lap apart (0->100) with a constant 15%-wide window throughout
    const anim = new DrawAnimation(path, { duration: 1, ease: "none", from: "0% 15%", to: "100% 115%", repeat: -1 });

    anim.totalTime(0, true);
    let [visible, gap] = parseDasharray(path.style.strokeDasharray);
    expect(visible).toBeCloseTo(15); // width constant...
    expect(gap).toBeCloseTo(85);
    expect(path.style.strokeDashoffset).toBe("0");

    anim.totalTime(1, true); // ...still constant one full lap later, not reset/clamped back into [0,100]
    [visible, gap] = parseDasharray(path.style.strokeDasharray);
    expect(visible).toBeCloseTo(15);
    expect(gap).toBeCloseTo(85);
    expect(Number(path.style.strokeDashoffset)).toBeCloseTo(-100); // -100 mod length(100) === 0 - visually identical to t=0
  });
});

describe("drawSVG()", () => {
  it("a single resolved shape attaches directly to rootTimeline as a bare DrawAnimation", () => {
    const path = makePath(100);
    document.body.appendChild(path);
    const t0 = rootNow();

    const anim = drawSVG(path, { duration: 1, ease: "none" });
    expect(anim).toBeInstanceOf(DrawAnimation);

    rootTimeline.totalTime(t0 + 0.5, true);
    const [visible, gap] = parseDasharray(path.style.strokeDasharray);
    expect(visible).toBeCloseTo(50);
    expect(gap).toBeCloseTo(50);

    document.body.removeChild(path);
  });

  it("multiple resolved shapes are grouped into one Timeline, staggered", () => {
    const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const a = makePath(100);
    const b = makePath(100);
    a.classList.add("letter");
    b.classList.add("letter");
    container.appendChild(a);
    container.appendChild(b);
    document.body.appendChild(container);
    const t0 = rootNow();

    const group = drawSVG(".letter", { duration: 1, ease: "none", stagger: 0.2 });
    expect(group).toBeInstanceOf(Timeline);
    expect((group as Timeline).getChildren()).toHaveLength(2);

    // At t0 + 0.5: first shape (no extra delay) is halfway; second (delay 0.2) has only had 0.3s.
    rootTimeline.totalTime(t0 + 0.5, true);
    const [aVisible, aGap] = parseDasharray(a.style.strokeDasharray);
    expect(aVisible).toBeCloseTo(50);
    expect(aGap).toBeCloseTo(50);
    const [bVisible, bGap] = parseDasharray(b.style.strokeDasharray);
    expect(bVisible).toBeCloseTo(30);
    expect(bGap).toBeCloseTo(70);

    document.body.removeChild(container);
  });

  it("skips non-geometry elements with a warning instead of throwing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("mixed");
    const path = makePath(100);
    path.classList.add("mixed");
    container.appendChild(group);
    container.appendChild(path);
    document.body.appendChild(container);

    const anim = drawSVG(".mixed", { duration: 1 });
    expect(anim).toBeInstanceOf(DrawAnimation);
    expect(warn).toHaveBeenCalled();

    document.body.removeChild(container);
  });

  it("warns and returns a harmless empty Timeline when nothing resolves", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = drawSVG(".nope-does-not-exist", { duration: 1 });
    expect(result).toBeInstanceOf(Timeline);
    expect((result as Timeline).getChildren()).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
  });
});
