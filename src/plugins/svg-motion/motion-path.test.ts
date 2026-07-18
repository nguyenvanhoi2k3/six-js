import { afterEach, describe, expect, it, vi } from "vitest";
import { MotionPathAnimation, motionPath } from "./motion-path";
import { getTransformCache } from "../../animate/transform-cache";
import { rootTimeline } from "../../core/root";
import { Timeline } from "../../timeline/timeline";

interface Point {
  x: number;
  y: number;
}

// jsdom implements no SVG geometry methods at all (see CLAUDE.md's Testing section) - assigning
// getTotalLength/getPointAtLength directly (not vi.spyOn, which requires the method to already
// exist) is the only way to give a test path controllable, deterministic geometry.
function makeGuide(length: number, pointAt: (len: number) => Point): SVGPathElement {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as unknown as SVGPathElement;
  (path as unknown as { getTotalLength: () => number }).getTotalLength = () => length;
  (path as unknown as { getPointAtLength: (len: number) => Point }).getPointAtLength = pointAt;
  return path;
}

function straightLine(length: number): SVGPathElement {
  return makeGuide(length, (len) => ({ x: len, y: 0 }));
}

function diagonalLine(length: number): SVGPathElement {
  // x === y everywhere -> an exact, constant 45deg tangent regardless of sample spacing.
  return makeGuide(length, (len) => ({ x: len, y: len }));
}

function mover(): HTMLDivElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

function rootNow(): number {
  return rootTimeline.totalTime() as number;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MotionPathAnimation", () => {
  it("moves the target by the delta between the path's start point and the current point", () => {
    const target = mover();
    const guide = straightLine(100);

    const anim = new MotionPathAnimation(target, { path: guide, duration: 1, ease: "none" });

    anim.totalTime(0, true);
    expect(getTransformCache(target).x).toBe(0);

    anim.totalTime(0.5, true);
    expect(getTransformCache(target).x).toBeCloseTo(50);
    expect(getTransformCache(target).y).toBeCloseTo(0);

    anim.totalTime(1, true);
    expect(getTransformCache(target).x).toBeCloseTo(100);
  });

  it("adds the delta on top of whatever base x/y the target already had", () => {
    const target = mover();
    getTransformCache(target).x = 10;
    getTransformCache(target).y = 20;
    const guide = straightLine(100);

    const anim = new MotionPathAnimation(target, { path: guide, duration: 1, ease: "none" });
    anim.totalTime(1, true);

    expect(getTransformCache(target).x).toBeCloseTo(110);
    expect(getTransformCache(target).y).toBeCloseTo(20);
  });

  it("respects a from/to sub-range of the path instead of always spanning the whole thing", () => {
    const target = mover();
    const guide = straightLine(100);

    const anim = new MotionPathAnimation(target, { path: guide, duration: 1, ease: "none", from: 0.25, to: 0.75 });
    anim.totalTime(1, true);

    // start point is measured at ratio 0.25 (len 25); end of animation reaches ratio 0.75 (len 75)
    expect(getTransformCache(target).x).toBeCloseTo(50);
  });

  it("leaves rotation untouched when autoRotate is not set", () => {
    const target = mover();
    const guide = diagonalLine(100);

    const anim = new MotionPathAnimation(target, { path: guide, duration: 1, ease: "none" });
    anim.totalTime(0.5, true);

    expect(getTransformCache(target).rotation).toBe(0);
  });

  it("autoRotate: true aligns rotation to the path's tangent direction", () => {
    const target = mover();
    const guide = diagonalLine(100);

    const anim = new MotionPathAnimation(target, { path: guide, duration: 1, ease: "none", autoRotate: true });
    anim.totalTime(0.5, true);

    expect(getTransformCache(target).rotation).toBeCloseTo(45);
  });

  it("a numeric autoRotate adds a fixed degree offset on top of the tangent angle", () => {
    const target = mover();
    const guide = diagonalLine(100);

    const anim = new MotionPathAnimation(target, { path: guide, duration: 1, ease: "none", autoRotate: 90 });
    anim.totalTime(0.5, true);

    expect(getTransformCache(target).rotation).toBeCloseTo(135);
  });

  it("accepts a raw path `d` string instead of an element/selector", () => {
    // jsdom implements no SVG geometry engine at all, including on elements created internally
    // by resolveGeometry() (a detached <path> built from the raw "d" string) - unlike the other
    // tests here, there's no element reference to attach a per-instance mock to before
    // construction, so the only way to give it deterministic geometry is a shared prototype mock
    // (real browsers wouldn't need this; a genuine "d" string always resolves to a real
    // geometry-capable element there).
    const proto = SVGElement.prototype as unknown as { getTotalLength?: () => number; getPointAtLength?: (len: number) => Point };
    proto.getTotalLength = () => 100;
    proto.getPointAtLength = (len) => ({ x: len, y: 0 });

    try {
      const target = mover();
      const anim = new MotionPathAnimation(target, { path: "M0,0 L100,0", duration: 1, ease: "none" });

      anim.totalTime(0.5, true);
      expect(getTransformCache(target).x).toBeCloseTo(50);
    } finally {
      delete proto.getTotalLength;
      delete proto.getPointAtLength;
    }
  });
});

describe("motionPath()", () => {
  it("a single target attaches directly to rootTimeline as a bare MotionPathAnimation", () => {
    const target = mover();
    const guide = straightLine(100);
    const t0 = rootNow();

    const anim = motionPath(target, { path: guide, duration: 1, ease: "none" });
    expect(anim).toBeInstanceOf(MotionPathAnimation);

    rootTimeline.totalTime(t0 + 0.5, true);
    expect(getTransformCache(target).x).toBeCloseTo(50);
  });

  it("multiple targets are grouped into one staggered Timeline", () => {
    const a = mover();
    const b = mover();
    a.classList.add("plane");
    b.classList.add("plane");
    const guide = straightLine(100);
    const t0 = rootNow();

    const group = motionPath(".plane", { path: guide, duration: 1, ease: "none", stagger: 0.2 });
    expect(group).toBeInstanceOf(Timeline);
    expect((group as Timeline).getChildren()).toHaveLength(2);

    rootTimeline.totalTime(t0 + 0.5, true);
    expect(getTransformCache(a).x).toBeCloseTo(50);
    expect(getTransformCache(b).x).toBeCloseTo(30);
  });

  it("warns and returns a harmless empty Timeline when no target resolves", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const guide = straightLine(100);

    const result = motionPath(".nope-does-not-exist", { path: guide, duration: 1 });
    expect(result).toBeInstanceOf(Timeline);
    expect((result as Timeline).getChildren()).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
  });
});
