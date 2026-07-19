import { afterEach, describe, expect, it, vi } from "vitest";
import { SvgMotion, DrawAnimation, MorphAnimation, MotionPathAnimation } from "./svg-motion";
import { Timeline } from "../../timeline/timeline";

// jsdom implements no SVG geometry methods at all (see CLAUDE.md's Testing section) - assigning
// getTotalLength/getPointAtLength directly (not vi.spyOn, which requires the method to already
// exist) is the only way to give a test element controllable, deterministic geometry.
function makePath(d: string, length: number, pointAt: (len: number) => { x: number; y: number } = (len) => ({ x: len, y: 0 })): SVGPathElement {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path") as unknown as SVGPathElement;
  path.setAttribute("d", d);
  (path as unknown as { getTotalLength: () => number }).getTotalLength = () => length;
  (path as unknown as { getPointAtLength: (len: number) => { x: number; y: number } }).getPointAtLength = pointAt;
  return path;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SvgMotion() dispatcher", () => {
  it('mode: "draw" routes to a DrawAnimation', () => {
    const path = makePath("M0,0 L100,0", 100);
    const anim = SvgMotion(path, { mode: "draw", duration: 1, ease: "none" });
    expect(anim).toBeInstanceOf(DrawAnimation);
  });

  it('mode: "draw" with multiple resolved targets groups into a Timeline, same as the underlying drawSVG()', () => {
    const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const a = makePath("M0,0 L100,0", 100);
    const b = makePath("M0,0 L100,0", 100);
    a.classList.add("letter");
    b.classList.add("letter");
    container.appendChild(a);
    container.appendChild(b);
    document.body.appendChild(container);

    const group = SvgMotion(".letter", { mode: "draw", duration: 1, stagger: 0.1 });
    expect(group).toBeInstanceOf(Timeline);
    expect((group as Timeline).getChildren()).toHaveLength(2);

    document.body.removeChild(container);
  });

  it('mode: "morph" routes to a MorphAnimation and passes `toShape` through', () => {
    const from = makePath("M0,0 L10,0 L10,10 L0,10 Z", 12);
    const to = makePath("M0,0 L10,0 Z", 12, (len) => ({ x: len, y: 50 }));

    const anim = SvgMotion(from, { mode: "morph", toShape: to, duration: 1, ease: "none", precision: 4 });
    expect(anim).toBeInstanceOf(MorphAnimation);

    anim.totalTime(1, true);
    expect(from.getAttribute("d")).not.toBe("M0,0 L10,0 L10,10 L0,10 Z");
  });

  it('mode: "path" routes to a MotionPathAnimation', () => {
    const target = document.createElement("div");
    const guide = makePath("M0,0 L100,0", 100);

    const anim = SvgMotion(target, { mode: "path", path: guide, duration: 1, ease: "none" });
    expect(anim).toBeInstanceOf(MotionPathAnimation);
  });

  it('mode: "path" with multiple resolved targets groups into a Timeline, same as the underlying motionPath()', () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    a.classList.add("plane");
    b.classList.add("plane");
    document.body.appendChild(a);
    document.body.appendChild(b);
    const guide = makePath("M0,0 L100,0", 100);

    const group = SvgMotion(".plane", { mode: "path", path: guide, duration: 1, stagger: 0.1 });
    expect(group).toBeInstanceOf(Timeline);
    expect((group as Timeline).getChildren()).toHaveLength(2);

    document.body.removeChild(a);
    document.body.removeChild(b);
  });

  it("throws a clear error for an unrecognized mode instead of silently no-oping", () => {
    const target = document.createElement("div");
    expect(() => SvgMotion(target, { mode: "nope" } as never)).toThrow(/unknown mode/);
  });
});
