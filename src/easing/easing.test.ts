import { describe, expect, it } from "vitest";
import { EASES, resolveEase } from "./easing";

describe("EASES", () => {
  it("every named ease returns exactly 0 at t=0 and 1 at t=1", () => {
    for (const [name, fn] of Object.entries(EASES)) {
      expect(fn(0), `${name}(0)`).toBeCloseTo(0, 5);
      expect(fn(1), `${name}(1)`).toBeCloseTo(1, 5);
    }
  });

  it("linear/none pass through unchanged", () => {
    expect(EASES.linear(0.37)).toBeCloseTo(0.37);
    expect(EASES.none(0.37)).toBeCloseTo(0.37);
  });

  it("quadOut is monotonically increasing and front-loaded (decelerating)", () => {
    const fn = EASES.quadOut;
    expect(fn(0.25)).toBeGreaterThan(0.25);
    expect(fn(0.5)).toBeGreaterThan(fn(0.25));
    expect(fn(0.75)).toBeGreaterThan(fn(0.5));
  });

  it("backOut overshoots past 1 before settling", () => {
    const fn = EASES.backOut;
    let overshot = false;
    for (let t = 0; t <= 1; t += 0.01) {
      if (fn(t) > 1) overshot = true;
    }
    expect(overshot).toBe(true);
  });

  it("bounceOut dips below a straight line before settling at 1", () => {
    const fn = EASES.bounceOut;
    expect(fn(0.5)).toBeLessThan(1);
    expect(fn(1)).toBeCloseTo(1);
  });

  it("smooth has zero slope at both ends (smootherstep)", () => {
    const fn = EASES.smooth;
    const h = 1e-4;
    const slopeAtStart = (fn(h) - fn(0)) / h;
    const slopeAtEnd = (fn(1) - fn(1 - h)) / h;
    expect(slopeAtStart).toBeCloseTo(0, 2);
    expect(slopeAtEnd).toBeCloseTo(0, 2);
  });

  it("spring and jelly oscillate past 1 before settling", () => {
    for (const name of ["spring", "jelly"] as const) {
      const fn = EASES[name];
      let overshot = false;
      for (let t = 0; t <= 1; t += 0.01) {
        if (fn(t) > 1) overshot = true;
      }
      expect(overshot, name).toBe(true);
    }
  });
});

describe("resolveEase", () => {
  it("passes a function through unchanged", () => {
    const custom = (t: number) => t * t;
    expect(resolveEase(custom)).toBe(custom);
  });

  it("resolves a known name", () => {
    expect(resolveEase("cubicIn")).toBe(EASES.cubicIn);
  });

  it("falls back to quadOut for an unknown name", () => {
    expect(resolveEase("not-a-real-ease")).toBe(EASES.quadOut);
  });

  it("falls back to quadOut when undefined", () => {
    expect(resolveEase(undefined)).toBe(EASES.quadOut);
  });
});
