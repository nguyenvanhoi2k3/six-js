import { afterEach, describe, expect, it, vi } from "vitest";
import { MorphAnimation, alignToFrom, isClosed, lerpPoints, morphSVG, Point, pointsToBezierPath, samplePoints } from "./morph";
import { rootTimeline } from "../../core/root";

interface MockPoint {
  x: number;
  y: number;
}

function makePath(d: string, length: number, pointAt: (len: number) => MockPoint): SVGPathElement {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as unknown as SVGPathElement;
  path.setAttribute("d", d);
  (path as unknown as { getTotalLength: () => number }).getTotalLength = () => length;
  (path as unknown as { getPointAtLength: (len: number) => MockPoint }).getPointAtLength = pointAt;
  return path;
}

function rootNow(): number {
  return rootTimeline.totalTime() as number;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isClosed", () => {
  it("detects a trailing Z/z as closed, ignoring trailing whitespace", () => {
    expect(isClosed("M0,0 L1,1 Z")).toBe(true);
    expect(isClosed("M0,0 L1,1 z  ")).toBe(true);
  });

  it("treats an open path as not closed", () => {
    expect(isClosed("M0,0 L1,1")).toBe(false);
  });
});

describe("samplePoints", () => {
  it("samples a closed shape at n evenly-spaced points around the full length (no duplicate wrap point)", () => {
    const el = makePath("M0,0 Z", 12, (len) => ({ x: len, y: 0 }));
    expect(samplePoints(el, 3, true)).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 8, y: 0 },
    ]);
  });

  it("samples an open shape inclusive of both endpoints", () => {
    const el = makePath("M0,0 L12,0", 12, (len) => ({ x: len, y: 0 }));
    expect(samplePoints(el, 3, false)).toEqual([
      { x: 0, y: 0 },
      { x: 6, y: 0 },
      { x: 12, y: 0 },
    ]);
  });
});

describe("lerpPoints", () => {
  it("interpolates each pair positionally", () => {
    const a: Point[] = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
    const b: Point[] = [{ x: 10, y: 10 }, { x: 20, y: 0 }];
    expect(lerpPoints(a, b, 0.5)).toEqual([
      { x: 5, y: 5 },
      { x: 15, y: 5 },
    ]);
    expect(lerpPoints(a, b, 0)).toEqual(a);
    expect(lerpPoints(a, b, 1)).toEqual(b);
  });
});

describe("pointsToBezierPath", () => {
  it("returns a single moveto for one point", () => {
    expect(pointsToBezierPath([{ x: 5, y: 5 }], false)).toBe("M5,5");
  });

  it("produces one C segment per gap for an open path, no trailing Z", () => {
    const d = pointsToBezierPath([{ x: 0, y: 0 }, { x: 10, y: 0 }], false);
    expect(d.startsWith("M0,0")).toBe(true);
    expect(d).toContain(" C");
    expect(d.trim().endsWith("Z")).toBe(false);
  });

  it("wraps around and closes with Z for a closed path", () => {
    const d = pointsToBezierPath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      true,
    );
    expect(d.trim().endsWith("Z")).toBe(true);
  });
});

describe("alignToFrom", () => {
  const square: Point[] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];

  it("undoes a pure rotation of the target's point order to minimize travel distance", () => {
    // `to` is `square` rotated by 1 - a perfect index-alignment exists (undo the rotation).
    const rotated: Point[] = [square[1], square[2], square[3], square[0]];
    const aligned = alignToFrom(square, rotated, true);
    expect(aligned).toEqual(square);
  });

  it("undoes a reversed winding direction", () => {
    const reversed: Point[] = [...square].reverse();
    const aligned = alignToFrom(square, reversed, true);
    expect(aligned).toEqual(square);
  });

  it("never rotates an open shape's point order - only tries reversed vs forward", () => {
    const openFrom: Point[] = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }];
    const shiftedOpen: Point[] = [openFrom[1], openFrom[2], openFrom[0]]; // not a valid "reverse" of openFrom
    const aligned = alignToFrom(openFrom, shiftedOpen, false);
    // no rotation attempted for an open shape - forward (unchanged) or reversed are the only options.
    expect(aligned === shiftedOpen || aligned.every((p, i) => p === shiftedOpen[shiftedOpen.length - 1 - i])).toBe(true);
  });
});

describe("MorphAnimation", () => {
  it("starts exactly at the sampled `from` shape and ends at the aligned `to` shape", () => {
    const from = makePath("M0,0 L10,0 L10,10 L0,10 Z", 12, (len) => ({ x: len, y: 0 }));
    const to = makePath("M0,0 L10,0 Z", 12, (len) => ({ x: len, y: 50 }));

    const anim = new MorphAnimation(from, to, { duration: 1, ease: "none", precision: 4 });

    const fromPoints = samplePoints(from, 4, true);
    const rawToPoints = samplePoints(to, 4, true);
    const toPoints = alignToFrom(fromPoints, rawToPoints, true);

    anim.totalTime(0, true);
    expect(from.getAttribute("d")).toBe(pointsToBezierPath(fromPoints, true));

    anim.totalTime(1, true);
    expect(from.getAttribute("d")).toBe(pointsToBezierPath(toPoints, true));
  });

  it("the `d` attribute actually changes mid-animation, not just snapping between two states", () => {
    const from = makePath("M0,0 L10,0 L10,10 L0,10 Z", 12, (len) => ({ x: len, y: 0 }));
    const to = makePath("M0,0 L10,0 Z", 12, (len) => ({ x: len, y: 50 }));

    const anim = new MorphAnimation(from, to, { duration: 1, ease: "none", precision: 4 });

    anim.totalTime(0, true);
    const d0 = from.getAttribute("d");
    anim.totalTime(0.5, true);
    const d1 = from.getAttribute("d");
    anim.totalTime(1, true);
    const d2 = from.getAttribute("d");

    expect(d0).not.toBe(d1);
    expect(d1).not.toBe(d2);
  });
});

describe("morphSVG()", () => {
  it("attaches directly to rootTimeline", () => {
    const from = makePath("M0,0 L10,0 L10,10 L0,10 Z", 12, (len) => ({ x: len, y: 0 }));
    const to = makePath("M0,0 L10,0 Z", 12, (len) => ({ x: len, y: 50 }));
    const t0 = rootNow();

    const anim = morphSVG(from, to, { duration: 1, ease: "none", precision: 4 });
    expect(anim).toBeInstanceOf(MorphAnimation);

    rootTimeline.totalTime(t0 + 1, true);
    expect(from.getAttribute("d")).not.toBe("M0,0 L10,0 L10,10 L0,10 Z");
  });
});
